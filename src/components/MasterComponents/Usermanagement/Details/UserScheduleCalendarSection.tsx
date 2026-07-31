import React, { useCallback, useRef, useState } from 'react';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../bootstrap/Card';
import ReusableScheduleCalendar from '../../ScheduleComponent/ReusableScheduleCalendar';
import UserCalendarDetailModal from './UserCalendarDetailModal';
import { authAxios } from '../../../../axiosInstance';
import useToasterNotification from '../../../../hooks/useToasterNotification';

const dayKey = (d: Date) => {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
};

type UserScheduleCalendarSectionProps = {
	userId?: string;
	hideLoadingIndicator?: boolean;
	onInitialLoadComplete?: () => void;
};

const UserScheduleCalendarSection = ({
	userId,
	hideLoadingIndicator,
	onInitialLoadComplete,
}: UserScheduleCalendarSectionProps) => {
	const [dayModalOpen, setDayModalOpen] = useState(false);
	const [selectedDay, setSelectedDay] = useState<Date | null>(null);
	const [dayDetail, setDayDetail] = useState<any | null>(null);
	const [dayDetailLoading, setDayDetailLoading] = useState(false);
	const activeDetailDayKeyRef = useRef<string | null>(null);
	const { showErrorNotification } = useToasterNotification();

	const refreshDayDetail = useCallback(async () => {
		if (!selectedDay || userId == null || userId === '') return;
		try {
			const res = await authAxios.get('/api/hr/attendance/calendar-detail/', {
				params: {
					calendar_type: 'user',
					user: userId,
					date: dayKey(selectedDay),
				},
			});
			setDayDetail(res?.data ?? null);
		} catch (err) {
			showErrorNotification(err);
		}
	}, [selectedDay, userId, showErrorNotification]);

	const handleModalOpenChange = (open: boolean) => {
		setDayModalOpen(open);
		if (!open) {
			activeDetailDayKeyRef.current = null;
			setDayDetailLoading(false);
			setSelectedDay(null);
			setDayDetail(null);
		}
	};

	const handleDateClick = (date: Date, detail: any | null, meta: { loading: boolean }) => {
		if (userId == null || userId === '') return;
		if (meta.loading) {
			const key = dayKey(date);
			activeDetailDayKeyRef.current = key;
			setSelectedDay(date);
			setDayDetail(null);
			setDayDetailLoading(true);
			setDayModalOpen(true);
			return;
		}
		const key = dayKey(date);
		if (activeDetailDayKeyRef.current == null || activeDetailDayKeyRef.current !== key) {
			return;
		}
		setDayDetail(detail);
		setDayDetailLoading(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardLabel icon='' iconColor='dark'>
					<CardTitle tag='div' className='h5'>
						Monthly Schedule Calendar
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody>
				<ReusableScheduleCalendar
					calendarType='user'
					entityId={userId}
					height='75vh'
					enableViewFilter
					hideLoadingIndicator={hideLoadingIndicator}
					onInitialLoadComplete={onInitialLoadComplete}
					onDateClick={handleDateClick}
				/>
				<UserCalendarDetailModal
					isOpen={dayModalOpen}
					setIsOpen={handleModalOpenChange}
					selectedDate={selectedDay}
					userId={userId}
					detail={dayDetail}
					loading={dayDetailLoading}
					onUserUpdated={refreshDayDetail}
				/>
			</CardBody>
		</Card>
	);
};

export default UserScheduleCalendarSection;
