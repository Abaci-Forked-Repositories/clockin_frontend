/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { Col, Container, Row, Spinner } from 'reactstrap';
import classNames from 'classnames';
import { useFormik } from 'formik';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Input from '../../components/bootstrap/forms/Input';
import Checks, { ChecksGroup } from '../../components/bootstrap/forms/Checks';
import Button from '../../components/bootstrap/Button';
import useDarkMode from '../../hooks/useDarkMode';
import AuthContext from '../../contexts/authContext';
import { publicAxios, updateToken } from '../../axiosInstance';
import LogoForLogin from '../../assets/LogoForLogin.png';
import ClockInLogoDark from '../../assets/ClockInLogoDark.png';
import loginBackground from '../../assets/Home.jpg';
import { setLogOut } from '../../store/auth';
import validateEmail from '../../helpers/emailValidator';
import AbaciLoader from '../../components/AbaciLoader/AbaciLoader';
import { getHomePathForUser } from '../../helpers/roleToggleUtils';
import { normalizeTenantSlug, withClientTenantPrefix } from '../../helpers/baseURL';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Error from '../../helpers/Error';

const USER_LOGIN_API = 'api/users/login/';
const VALIDATE_EMAIL_API = 'api/users/validate-email/';

const Login = ({
	loginApiUrl = USER_LOGIN_API,
	heading = 'USER LOGIN',
	pageTitle = 'Login',
	showSignup = true,
}) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { userData, setUser, setUserData } = useContext(AuthContext);
	const { darkModeStatus } = useDarkMode();
	const [signInPassword] = useState(false);
	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [availableTenants, setAvailableTenants] = useState([]);
	const [selectedTenant, setSelectedTenant] = useState('');
	const [validatingEmail, setValidatingEmail] = useState(false);
	const lastValidatedEmailRef = useRef('');
	const emailValidationRequestIdRef = useRef(0);
	const shouldValidateEmailTenants = loginApiUrl === USER_LOGIN_API;

	const clearTenantSelection = () => {
		emailValidationRequestIdRef.current += 1;
		setAvailableTenants([]);
		setSelectedTenant('');
		lastValidatedEmailRef.current = '';
	};

	useEffect(() => {
		if (userData != null && Object.keys(userData).length > 0) {
			navigate(getHomePathForUser(userData));
		}
	}, [userData, navigate]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			loginUsername: '',
			loginPassword: '',
		},
		validate: (values) => {
			const errors = {};
			const emailError = validateEmail(values.loginUsername);
			if (!values.loginUsername) {
				errors.loginUsername = 'Required';
			}

			if (!values.loginPassword) {
				errors.loginPassword = 'Required';
			}
			if (emailError) {
				errors.loginUsername = emailError;
			}
			if (availableTenants.length > 1 && !selectedTenant) {
				errors.loginUsername = errors.loginUsername || 'Please select a tenant';
			}
			return errors;
		},
		onSubmit: (values) => {
			handleSignin(values);
		},
	});

	const applyValidateEmailResult = (email, responseData) => {
		const tenants = (Array.isArray(responseData?.tenants) ? responseData.tenants : [])
			.map((tenant) => normalizeTenantSlug(tenant))
			.filter(Boolean);
		const tenantCount = Number(responseData?.tenant_count ?? tenants.length);

		lastValidatedEmailRef.current = email;

		if (tenantCount > 1 && tenants.length > 1) {
			setAvailableTenants(tenants);
			setSelectedTenant(tenants[0] || '');
			return { tenants, tenant: tenants[0] || '', requiresSelection: true };
		}

		const tenant = tenants[0] || '';
		setAvailableTenants([]);
		setSelectedTenant(tenant);
		return { tenants, tenant, requiresSelection: false };
	};

	const handleEmailBlur = (e) => {
		formik.handleBlur(e);

		if (!shouldValidateEmailTenants || validatingEmail) return;

		const email = String(formik.values.loginUsername || '').trim();
		const emailError = validateEmail(email);
		if (!email || emailError) {
			clearTenantSelection();
			return;
		}

		if (lastValidatedEmailRef.current === email) return;

		const requestId = emailValidationRequestIdRef.current + 1;
		emailValidationRequestIdRef.current = requestId;
		setValidatingEmail(true);
		publicAxios
			.post(VALIDATE_EMAIL_API, { email })
			.then((response) => {
				if (requestId !== emailValidationRequestIdRef.current) return;
				applyValidateEmailResult(email, response?.data || {});
			})
			.catch(() => {
				if (requestId !== emailValidationRequestIdRef.current) return;
				setAvailableTenants([]);
				setSelectedTenant('');
				lastValidatedEmailRef.current = '';
			})
			.finally(() => {
				if (requestId === emailValidationRequestIdRef.current) {
					setValidatingEmail(false);
				}
			});
	};

	const handleEmailChange = (e) => {
		formik.handleChange(e);
		const nextEmail = String(e.target.value || '').trim();
		if (nextEmail !== lastValidatedEmailRef.current) {
			emailValidationRequestIdRef.current += 1;
			setValidatingEmail(false);
			setAvailableTenants([]);
			setSelectedTenant('');
			lastValidatedEmailRef.current = '';
		}
	};

	const getLoginFormValues = (formikValues) => {
		// Browser "remembered" autofill often fills the DOM without updating React/Formik state.
		const emailInput = document.getElementById('loginUsername');
		const passwordInput = document.getElementById('loginPassword');
		const emailFromDom =
			emailInput instanceof HTMLInputElement ? emailInput.value : undefined;
		const passwordFromDom =
			passwordInput instanceof HTMLInputElement ? passwordInput.value : undefined;
		const loginUsername = String(emailFromDom ?? formikValues.loginUsername ?? '').trim();
		const loginPassword = String(passwordFromDom ?? formikValues.loginPassword ?? '');

		if (loginUsername !== formikValues.loginUsername) {
			formik.setFieldValue('loginUsername', loginUsername, false);
		}
		if (loginPassword !== formikValues.loginPassword) {
			formik.setFieldValue('loginPassword', loginPassword, false);
		}

		return { loginUsername, loginPassword };
	};

	const performLogin = (values, tenantForRequest) => {
		const tenantName = normalizeTenantSlug(tenantForRequest);

		// User login must always be tenant-scoped; never hit root /api/users/login/.
		if (shouldValidateEmailTenants && !tenantName) {
			setWaitingForAxios(false);
			formik.setFieldError(
				'loginPassword',
				'Unable to resolve organization for this email. Please try again.',
			);
			return;
		}

		// Put tenant in the URL itself so we never depend on cookie timing alone.
		if (tenantName) {
			Cookies.set('tenant', tenantName);
		}

		const url =
			shouldValidateEmailTenants && tenantName
				? withClientTenantPrefix(loginApiUrl, tenantName)
				: loginApiUrl;

		const dataToBeSend = {
			password: values.loginPassword,
			email: values.loginUsername,
		};

		publicAxios
			.post(url, dataToBeSend, /** @type {import('axios').AxiosRequestConfig} */ ({
				clientTenant: tenantName,
			}))
			.then((response) => {
				const responseData = response?.data || {};
				const userPayload = responseData?.user ?? responseData;
				const enrichedUser = {
					...userPayload,
					is_platform_admin:
						responseData?.is_platform_admin ?? userPayload?.is_platform_admin ?? false,
					is_platform_partner: responseData?.is_platform_partner ?? userPayload?.is_platform_partner ?? false,
				};
				const isPlatformAdminUser = enrichedUser.is_platform_admin === true;
				const isPlatformPartnerUser = enrichedUser.is_platform_partner === true;

				const tenant =
					tenantName ||
					normalizeTenantSlug(responseData?.tenant) ||
					normalizeTenantSlug(responseData?.tenants?.[0]);

				if (isPlatformAdminUser || isPlatformPartnerUser) {
					Cookies.remove('tenant');
				} else if (tenant) {
					Cookies.set('tenant', tenant);
				}

				const token = responseData?.access ?? responseData?.token ?? Cookies.get('token');
				if (token) {
					Cookies.set('token', token);
					updateToken(token, isPlatformAdminUser || isPlatformPartnerUser ? null : tenant);
				}

				setUser(enrichedUser?.email ?? values.loginUsername);
				setUserData({ ...enrichedUser });
				setWaitingForAxios(false);
				navigate(getHomePathForUser(enrichedUser));
			})
			.catch((error) => {
				setWaitingForAxios(false);
				dispatch(setLogOut());
				let errorMessage = null;
				if (error.response?.status === 403) {
					errorMessage = error?.response?.data?.detail;
				} else if (error.response?.status === 400) {
					errorMessage = Error(error, () => {});
				} else {
					errorMessage = 'Error occured, please check your connection and try again!';
				}
				formik.setFieldError('loginPassword', errorMessage);
				formik.setFieldError('loginUsername', ' ');
			});
	};

	const handleSignin = (formikValues) => {
		const values = getLoginFormValues(formikValues);
		const email = values.loginUsername;
		const emailError = validateEmail(email);

		if (!email || emailError) {
			formik.setFieldTouched('loginUsername', true, false);
			formik.setFieldError('loginUsername', emailError || 'Required');
			return;
		}
		if (!values.loginPassword) {
			formik.setFieldTouched('loginPassword', true, false);
			formik.setFieldError('loginPassword', 'Required');
			return;
		}

		if (availableTenants.length > 1 && !selectedTenant) {
			formik.setFieldError('loginUsername', 'Please select a tenant');
			return;
		}

		const emailAlreadyValidated = lastValidatedEmailRef.current === email && Boolean(selectedTenant);

		// Always validate remembered/autofilled emails before login when not checked yet.
		if (shouldValidateEmailTenants && !emailAlreadyValidated) {
			setWaitingForAxios(true);
			setValidatingEmail(true);
			const requestId = emailValidationRequestIdRef.current + 1;
			emailValidationRequestIdRef.current = requestId;

			publicAxios
				.post(VALIDATE_EMAIL_API, { email })
				.then((response) => {
					if (requestId !== emailValidationRequestIdRef.current) return;

					const result = applyValidateEmailResult(email, response?.data || {});
					setValidatingEmail(false);

					if (result.requiresSelection) {
						setWaitingForAxios(false);
						return;
					}

					performLogin(values, result.tenant);
				})
				.catch(() => {
					if (requestId !== emailValidationRequestIdRef.current) return;
					setValidatingEmail(false);
					setAvailableTenants([]);
					setSelectedTenant('');
					lastValidatedEmailRef.current = '';
					setWaitingForAxios(false);
					formik.setFieldError(
						'loginPassword',
						'Unable to verify email. Please try again.',
					);
				});
			return;
		}

		setWaitingForAxios(true);
		performLogin(values, selectedTenant);
	};

	if (userData == null) {
		return <AbaciLoader />;
	}
	return (
		<PageWrapper
			isProtected={false}
			title={pageTitle}
			className={classNames('p-0', {
				'bg-white': !darkModeStatus,
				'bg-dark': darkModeStatus,
			})}>
			<Page className='p-0' container={false}>
				<div style={{ width: '100%', height: '100vh' }}>
					<Container fluid className='p-0'>
						<Row className='g-0'>
							<Col lg={8}>
								<div
									className='authentication-bg'
									style={{ backgroundImage: `url(${loginBackground})` }}>
									<div className='bg-overlay' />
								</div>
							</Col>
							<Col lg={4}>
								<div
									className='authentication-page-content p-4 d-flex justify-content-center align-items-center min-vh-100'
									style={{ overflowY: 'auto' }}>
									<div style={{ width: '80%' }}>
										<div className='py-5'>
											<div className='text-center mb-4'>
												<img
													src={darkModeStatus ? ClockInLogoDark : LogoForLogin}
													alt='Logo'
													height='70'
												/>
											</div>

											<div className='text-center h2 mb-4'>{heading}</div>

											<form
												className='row g-4'
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														formik.handleSubmit();
													}
												}}>
												<div className='col-12'>
													<FormGroup
														id='loginUsername'
														isFloating
														label='Username'
														className={classNames({
															'd-none': signInPassword,
														})}>
														<Input
															autoComplete='username'
															value={formik.values.loginUsername}
															isTouched={formik.touched.loginUsername}
															invalidFeedback={formik.errors.loginUsername}
															isValid={formik.isValid}
															onChange={handleEmailChange}
															onBlur={handleEmailBlur}
															onFocus={() => {
																formik.setErrors({});
															}}
														/>
													</FormGroup>
													{availableTenants.length > 1 && (
														<div className='mt-3'>
															<div className='form-label mb-2'>Select organization</div>
															<ChecksGroup isInline={false}>
																{availableTenants.map((tenant) => (
																	<Checks
																		key={tenant}
																		id={`login-tenant-${tenant}`}
																		type='radio'
																		name='loginTenant'
																		value={tenant}
																		label={tenant}
																		checked={selectedTenant}
																		onChange={() => setSelectedTenant(tenant)}
																	/>
																))}
															</ChecksGroup>
														</div>
													)}
													<br />
													<FormGroup id='loginPassword' isFloating label='Password'>
														<Input
															type='password'
															autoComplete='current-password'
															value={formik.values.loginPassword}
															isTouched={formik.touched.loginPassword}
															invalidFeedback={formik.errors.loginPassword}
															isValid={formik.isValid}
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
														/>
													</FormGroup>
												</div>
												<div className='d-flex justify-content-end'>
													<p
														className='cursor-pointer user-select-none mb-0'
														onClick={() => navigate('/forgotpassword')}
														onKeyDown={(e) => {
															if (e.key === 'Enter' || e.key === ' ') {
																navigate('/forgotpassword');
															}
														}}
														role='button'
														tabIndex={0}>
														Forgot password ?
													</p>
												</div>

												<div className='col-12 mt-3 text-center'>
													<Button
														color='warning'
														icon='Login'
														className='py-2'
														style={{ width: '150px' }}
														isDisable={waitingForAxios || validatingEmail}
														onClick={formik.handleSubmit}>
														{waitingForAxios ? <Spinner size='sm' /> : 'Login'}
													</Button>
												</div>
											</form>

											{showSignup && (
												<div className='text-center mt-4'>
													<p className='mb-0'>
														Don&apos;t have an account?{' '}
														<button
															type='button'
															className='btn btn-link p-0 align-baseline'
															onClick={() => navigate('/signup')}>
															Sign up
														</button>
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</Col>
						</Row>
					</Container>
				</div>
			</Page>
		</PageWrapper>
	);
};

Login.propTypes = {
	loginApiUrl: PropTypes.string,
	heading: PropTypes.string,
	pageTitle: PropTypes.string,
	showSignup: PropTypes.bool,
};

export default Login;
