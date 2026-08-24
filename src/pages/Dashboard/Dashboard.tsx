import React, { useEffect, useState } from 'react';
import { useTour } from '@reactour/tour';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import SubHeader from '../../layout/SubHeader/SubHeader';
import { CardTitle } from '../../components/bootstrap/Card';
import AbaciLoader from '../../components/AbaciLoader/AbaciLoader';
import DashboardDaySummary from './DashboardDaySummary';
import DashboardLeaveRequestsSummary from './DashboardLeaveRequestsSummary';

const Dashboard = () => {
	const { currentStep, setCurrentStep } = useTour();
	const [dayReady, setDayReady] = useState(false);
	const [leaveReady, setLeaveReady] = useState(false);
	const pageLoading = !dayReady || !leaveReady;

	useEffect(() => {
		if (currentStep === 3) setCurrentStep(4);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep]);

	return (
		<PageWrapper title='Dashboard'>
			<SubHeader>
				<CardTitle tag='div' className='h5'>
					Dashboard
				</CardTitle>
			</SubHeader>
			<Page container='fluid'>
				{pageLoading ? <AbaciLoader /> : null}
				<div className={pageLoading ? 'd-none' : undefined}>
					<DashboardDaySummary hideLoader onLoadComplete={() => setDayReady(true)} />
					<DashboardLeaveRequestsSummary
						hideLoader
						onLoadComplete={() => setLeaveReady(true)}
					/>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Dashboard;
