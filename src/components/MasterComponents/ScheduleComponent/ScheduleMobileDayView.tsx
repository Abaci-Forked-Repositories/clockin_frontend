import React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import Icon from '../../icon/Icon';
import MobileDayNavigator from '../../CustomComponent/MobileDayNavigator';
import ScheduleMobileDayListing from './ScheduleMobileDayListing';

type ScheduleMobileDayViewProps = {
	focusedDay: Dayjs;
	onFocusedDayChange: (day: Dayjs) => void;
	events: any[];
	onViewDetails?: () => void;
	detailLoading?: boolean;
};

const ScheduleMobileDayView = ({
	focusedDay,
	onFocusedDayChange,
	events,
	onViewDetails,
	detailLoading = false,
}: ScheduleMobileDayViewProps) => {
	const isToday = focusedDay.isSame(dayjs(), 'day');

	return (
		<div className='asset-booking-mobile-day schedule-mobile-day'>
			<MobileDayNavigator
				focusedDay={focusedDay}
				onFocusedDayChange={onFocusedDayChange}
				meta={
					<>
						{!isToday ? (
							<button
								type='button'
								className='asset-booking-mobile-nav__chip asset-booking-mobile-nav__chip--today'
								onClick={() => onFocusedDayChange(dayjs())}>
								<Icon icon='Today' className='me-1' />
								Today
							</button>
						) : (
							<span className='asset-booking-mobile-nav__chip asset-booking-mobile-nav__chip--today-active'>
								<Icon icon='Today' className='me-1' />
								Today
							</span>
						)}
					</>
				}>
				<ScheduleMobileDayListing
					events={events}
					onViewDetails={onViewDetails}
					detailLoading={detailLoading}
				/>
			</MobileDayNavigator>
		</div>
	);
};

export default ScheduleMobileDayView;
