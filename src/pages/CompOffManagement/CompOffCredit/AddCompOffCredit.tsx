import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'reactstrap';
import { useForm, useWatch } from 'react-hook-form';
import OffCanvasComponent from '../../../components/OffCanvasComponent';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import SaveButton from '../../../components/CustomComponent/Buttons/SaveButton';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import CompOffCreditFields, { type CompOffWorkSummary } from './CompOffCreditFields';

const formatAccountLabel = (item: any): string => {
	if (!item) return '';
	const pref = String(item?.preferred_name || '').trim();
	if (pref) return pref;
	const first = String(item?.first_name || '').trim();
	const last = String(item?.last_name || '').trim();
	const full = [first, last].filter(Boolean).join(' ').trim();
	if (full) return full;
	const email = String(item?.email || '').trim();
	if (email) return email;
	return `User ${item?.id}`;
};

type CompOffCreditFormValues = {
	user: { label: string; value: number } | null;
	earned_date: string;
	expiry_date: string;
	days: string;
	remarks: string;
};

const defaultValues: CompOffCreditFormValues = {
	user: null,
	earned_date: '',
	expiry_date: '',
	days: '',
	remarks: '',
};

const buildPayload = (data: CompOffCreditFormValues) => ({
	user: Number(data.user?.value),
	earned_date: data.earned_date,
	expiry_date: data.expiry_date,
	days: String(data.days),
	remarks: data.remarks?.trim() || '',
});

const getCurrentSummaryPeriod = () => {
	const now = new Date();
	return { month: now.getMonth() + 1, year: now.getFullYear() };
};

const parseWorkSummary = (data: any): CompOffWorkSummary => ({
	month: data?.month != null ? Number(data.month) : null,
	year: data?.year != null ? Number(data.year) : null,
	ot_mins_total: data?.ot_mins_total != null ? Number(data.ot_mins_total) : null,
	extra_worked_mins_total:
		data?.extra_worked_mins_total != null ? Number(data.extra_worked_mins_total) : null,
	extra_working_days:
		data?.extra_working_days != null ? Number(data.extra_working_days) : null,
	ot_days_count: data?.ot_days_count != null ? Number(data.ot_days_count) : null,
});

type AddCompOffCreditProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	tableRef: React.MutableRefObject<any>;
	title: string;
	id?: number | string | null;
};

const AddCompOffCredit = ({ isOpen, setIsOpen, tableRef, title, id = null }: AddCompOffCreditProps) => {
	const {
		register,
		handleSubmit,
		reset,
		control,
		getValues,
		formState: { errors },
	} = useForm<CompOffCreditFormValues>({
		defaultValues,
	});

	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
	const [workSummary, setWorkSummary] = useState<CompOffWorkSummary | null>(null);
	const [workSummaryLoading, setWorkSummaryLoading] = useState(false);
	const [{ month: summaryMonth, year: summaryYear }, setSummaryPeriod] = useState(
		getCurrentSummaryPeriod,
	);
	const { showErrorNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;
	const isEdit = Boolean(id);
	const selectedUserId = useWatch({ control, name: 'user' })?.value;

	useEffect(() => {
		if (!isOpen) return undefined;

		let cancelled = false;
		setIsLoading(isEdit);

		authAxios
			.get('api/hr/accounts/', { params: { paginate: 'off' } })
			.then((res) => {
				if (cancelled) return;
				const rows = Array.isArray(res?.data)
					? res.data
					: Array.isArray(res?.data?.results)
						? res.data.results
						: [];
				setUserOptions(
					rows.map((item: any) => ({
						label: formatAccountLabel(item),
						value: Number(item.id),
					})),
				);
			})
			.catch((err) => {
				if (!cancelled) showErrorNotification(err);
			});

		if (!isEdit) {
			reset(defaultValues);
			setIsLoading(false);
			return () => {
				cancelled = true;
			};
		}

		authAxios
			.get(`/api/hr/comp-off-credits/${id}/`)
			.then((res) => {
				if (cancelled) return;
				const data = res?.data ?? {};
				const userId =
					typeof data.user === 'object' && data.user != null
						? data.user.id
						: data.user;
				const userLabel =
					typeof data.user === 'object' && data.user != null
						? formatAccountLabel(data.user)
						: data.user_name || `User ${userId}`;

				reset({
					user:
						userId != null
							? { label: userLabel, value: Number(userId) }
							: null,
					earned_date: data.earned_date ? String(data.earned_date).slice(0, 10) : '',
					expiry_date: data.expiry_date ? String(data.expiry_date).slice(0, 10) : '',
					days: data.days != null ? String(data.days) : '',
					remarks: data.remarks || '',
				});
			})
			.catch((err) => {
				if (!cancelled) showErrorNotification(err);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, id, isEdit]);

	useEffect(() => {
		if (!isOpen) {
			setWorkSummary(null);
			setWorkSummaryLoading(false);
			setSummaryPeriod(getCurrentSummaryPeriod());
			return undefined;
		}

		const userId = selectedUserId;
		if (userId == null || Number.isNaN(Number(userId))) {
			setWorkSummary(null);
			setWorkSummaryLoading(false);
			return undefined;
		}

		let cancelled = false;
		setWorkSummaryLoading(true);

		authAxios
			.get('/api/hr/comp-off-work-summary/', {
				params: {
					user: userId,
					month: summaryMonth,
					year: summaryYear,
				},
			})
			.then((res) => {
				if (cancelled) return;
				const data = res?.data ?? {};
				setWorkSummary(parseWorkSummary(data));
				if (data?.month != null && data?.year != null) {
					setSummaryPeriod({
						month: Number(data.month),
						year: Number(data.year),
					});
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setWorkSummary(null);
					showErrorRef.current(err);
				}
			})
			.finally(() => {
				if (!cancelled) setWorkSummaryLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen, selectedUserId, summaryMonth, summaryYear]);

	const handleSummaryMonthChange = (month: number) => {
		setSummaryPeriod((prev) => ({ ...prev, month }));
	};

	const handleSummaryYearChange = (year: number) => {
		setSummaryPeriod((prev) => ({ ...prev, year }));
	};

	const handleUserChangeResetPeriod = () => {
		setSummaryPeriod(getCurrentSummaryPeriod());
	};

	useEffect(() => {
		if (!isOpen || selectedUserId == null) return;
		handleUserChangeResetPeriod();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedUserId]);

	const onSubmit = (data: CompOffCreditFormValues) => {
		setWaitingForAxios(true);
		const payload = buildPayload(data);

		const req = isEdit
			? authAxios.patch(`/api/hr/comp-off-credits/${id}/`, payload)
			: authAxios.post('/api/hr/comp-off-credits/', payload);

		req
			.then(() => {
				setWaitingForAxios(false);
				tableRef?.current?.onQueryChange?.();
				setIsOpen(false);
			})
			.catch((err) => {
				setWaitingForAxios(false);
				showErrorNotification(err);
			});
	};

	return (
		<OffCanvasComponent isOpen={isOpen} placement='end' title={title} setOpen={setIsOpen}>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Card>
					<CardBody>
						{isLoading ? (
							<CustomSpinner />
						) : (
							<>
								<CompOffCreditFields
									register={register}
									control={control}
									getValues={getValues}
									errors={errors}
									userOptions={userOptions}
									selectedUserId={selectedUserId}
									summaryMonth={summaryMonth}
									summaryYear={summaryYear}
									onSummaryMonthChange={handleSummaryMonthChange}
									onSummaryYearChange={handleSummaryYearChange}
									workSummary={workSummary}
									workSummaryLoading={workSummaryLoading}
								/>
								<div className='row m-0'>
									<div className='col-12 p-3'>
										<SaveButton state={waitingForAxios} />
									</div>
								</div>
							</>
						)}
					</CardBody>
				</Card>
			</Form>
		</OffCanvasComponent>
	);
};

AddCompOffCredit.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	tableRef: PropTypes.object.isRequired,
	title: PropTypes.string.isRequired,
	id: PropTypes.any,
};

AddCompOffCredit.defaultProps = {
	id: null,
};

export default AddCompOffCredit;
