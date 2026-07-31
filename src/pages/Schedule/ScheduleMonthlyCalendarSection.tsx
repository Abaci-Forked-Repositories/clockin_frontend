import React, { useRef, useState } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../components/bootstrap/Card';
import ReusableScheduleCalendar from '../../components/MasterComponents/ScheduleComponent/ReusableScheduleCalendar';
import ScheduleCalendarDetailModal from './ScheduleCalendarDetailModal';

const dayKey = (d: Date) => {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
};

type Props = {
	scheduleId?: string | number;
	height?: string;
};

const ScheduleMonthlyCalendarSection = ({ scheduleId, height = '75vh' }: Props) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedDay, setSelectedDay] = useState<Date | null>(null);
	const [dayDetail, setDayDetail] = useState<any | null>(null);
	const [dayDetailLoading, setDayDetailLoading] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const activeKeyRef = useRef<string | null>(null);

	const handleOpenChange = (open: boolean) => {
		setModalOpen(open);
		if (!open) {
			activeKeyRef.current = null;
			setSelectedDay(null);
			setDayDetail(null);
			setDayDetailLoading(false);
		}
	};

	const handleDateClick = (date: Date, detail: any | null, meta: { loading: boolean }) => {
		if (scheduleId == null || scheduleId === '') return;
		const key = dayKey(date);
		if (meta.loading) {
			activeKeyRef.current = key;
			setSelectedDay(date);
			setDayDetail(null);
			setDayDetailLoading(true);
			setModalOpen(true);
			return;
		}
		if (activeKeyRef.current !== key) return;
		setDayDetail(detail);
		setDayDetailLoading(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardLabel icon='' iconColor='dark'>
					<CardTitle tag='div' className='h5'>
						Monthly Schedule
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody>
				<ReusableScheduleCalendar
					key={refreshKey}
					calendarType='schedule'
					entityId={scheduleId}
					height={height}
					onDateClick={handleDateClick}
				/>
				<ScheduleCalendarDetailModal
					isOpen={modalOpen}
					setIsOpen={handleOpenChange}
					selectedDate={selectedDay}
					scheduleId={scheduleId}
					detail={dayDetail}
					loading={dayDetailLoading}
					onChanged={() => setRefreshKey((k) => k + 1)}
				/>
			</CardBody>
		</Card>
	);
};

export default ScheduleMonthlyCalendarSection;
