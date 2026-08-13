import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubheaderSeparator } from '../../../../layout/SubHeader/SubHeader';
import { CardTitle } from '../../../../components/bootstrap/Card';
import Page from '../../../../layout/Page/Page';
import BackButton from '../../../../components/CustomComponent/Buttons/BackButton';
import AbaciLoader from '../../../../components/AbaciLoader/AbaciLoader';
import { authAxios } from '../../../../axiosInstance';
import useToasterNotification from '../../../../hooks/useToasterNotification';
import CustomerDetails from './CustomerDetails';
import CustomerLicensesTable from './CustomerLicensesTable';
import { allRoutesObject } from '../../../../routes/RoutesMenu';

const CustomerDetailPage = () => {
	const { id } = useParams();
	const [customer, setCustomer] = useState<Record<string, unknown> | null>(null);
	const [loading, setLoading] = useState(true);
	const { showErrorNotification } = useToasterNotification();

	useEffect(() => {
		if (!id) {
			setCustomer(null);
			setLoading(false);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);
		authAxios
			.get(`api/customers/clients/${id}/`)
			.then((res) => {
				if (!cancelled) setCustomer(res?.data ?? null);
			})
			.catch((err) => {
				if (!cancelled) showErrorNotification(err);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const licenses = Array.isArray(customer?.licenses) ? customer.licenses : [];

	return (
		<PageWrapper title='Customer details'>
			<SubHeader>
				<SubHeaderLeft>
					<BackButton to={allRoutesObject.Customers.path} />
					<SubheaderSeparator />
					<CardTitle tag='div' className='h6'>
						{String(customer?.name || 'Customer Details')}
					</CardTitle>
				</SubHeaderLeft>
			</SubHeader>
			<Page container='fluid' className='position-relative'>
				{loading && (
					<div
						className='d-flex justify-content-center align-items-center py-5'
						style={{ minHeight: '40vh' }}>
						<AbaciLoader />
					</div>
				)}
				{!loading && (
					<div className='row g-4'>
						<div className='col-12'>
							<CustomerDetails customer={customer} />
						</div>
						<div className='col-12'>
							<CustomerLicensesTable licenses={licenses} />
						</div>
					</div>
				)}
			</Page>
		</PageWrapper>
	);
};

export default CustomerDetailPage;
