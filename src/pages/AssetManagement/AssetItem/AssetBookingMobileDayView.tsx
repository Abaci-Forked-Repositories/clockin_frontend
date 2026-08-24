import React, { useRef } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import Button from '../../../components/bootstrap/Button';
import Icon from '../../../components/icon/Icon';
import MobileCalendarSkeleton from '../../../components/CustomComponent/Skeleton/MobileCalendarSkeleton';
import AssetBookingDayDetails from './AssetBookingDayDetails';
import type { AssetBooking } from './assetBookingCalendarUtils';

type AssetBookingMobileDayViewProps = {
	focusedDay: Dayjs;
	onFocusedDayChange: (day: Dayjs) => void;
	bookings: AssetBooking[];
	allowBooking?: boolean;
	onBook?: (date: Date) => void;
	onActionSuccess?: () => void;
	siteTimezoneIana?: string;
	siteTimezoneLabel?: string;
	loading?: boolean;
};

const openNativePicker = (input: HTMLInputElement | null) => {
	if (!input) return;
	if (typeof input.showPicker === 'function') {
		try {
			input.showPicker();
			return;
		} catch {
			// showPicker can throw when not user-gesture initiated
		}
	}
	input.click();
};

const AssetBookingMobileDayView = ({
	focusedDay,
	onFocusedDayChange,
	bookings,
	allowBooking = false,
	onBook,
	onActionSuccess,
	siteTimezoneIana,
	siteTimezoneLabel,
	loading = false,
}: AssetBookingMobileDayViewProps) => {
	const monthInputRef = useRef<HTMLInputElement>(null);
	const dateInputRef = useRef<HTMLInputElement>(null);
	const timezoneHint = siteTimezoneLabel || siteTimezoneIana;
	const isToday = focusedDay.isSame(dayjs(), 'day');

	const goToPreviousDay = () => onFocusedDayChange(focusedDay.subtract(1, 'day'));
	const goToNextDay = () => onFocusedDayChange(focusedDay.add(1, 'day'));
	const goToPreviousMonth = () => onFocusedDayChange(focusedDay.subtract(1, 'month'));
	const goToNextMonth = () => onFocusedDayChange(focusedDay.add(1, 'month'));

	const handleMonthInputChange = (value: string) => {
		if (!value) return;
		const monthStart = dayjs(value);
		const dayOfMonth = Math.min(focusedDay.date(), monthStart.daysInMonth());
		onFocusedDayChange(monthStart.date(dayOfMonth));
	};

	return (
		<div className='asset-booking-mobile-day'>
			<div className='asset-booking-mobile-nav'>
				<div className='asset-booking-mobile-nav__month-bar'>
					<button
						type='button'
						className='asset-booking-mobile-nav__step-btn'
						aria-label='Previous month'
						onClick={goToPreviousMonth}>
						<span className='asset-booking-mobile-nav__double-chevron' aria-hidden>
							<Icon icon='ChevronLeft' />
							<Icon icon='ChevronLeft' />
						</span>
					</button>
					<button
						type='button'
						className='asset-booking-mobile-nav__step-btn'
						aria-label='Previous day'
						onClick={goToPreviousDay}>
						<Icon icon='ChevronLeft' />
					</button>
					<button
						type='button'
						className='asset-booking-mobile-nav__month-pill'
						aria-label='Select month'
						onClick={() => openNativePicker(monthInputRef.current)}>
						<Icon icon='CalendarViewMonth' size='lg' />
						<span>{focusedDay.format('MMMM YYYY')}</span>
					</button>
					<input
						ref={monthInputRef}
						type='month'
						className='asset-booking-mobile-nav__picker'
						value={focusedDay.format('YYYY-MM')}
						onChange={(e) => handleMonthInputChange(e.target.value)}
						tabIndex={-1}
						aria-hidden
					/>
					<button
						type='button'
						className='asset-booking-mobile-nav__step-btn'
						aria-label='Next day'
						onClick={goToNextDay}>
						<Icon icon='ChevronRight' />
					</button>
					<button
						type='button'
						className='asset-booking-mobile-nav__step-btn'
						aria-label='Next month'
						onClick={goToNextMonth}>
						<span className='asset-booking-mobile-nav__double-chevron' aria-hidden>
							<Icon icon='ChevronRight' />
							<Icon icon='ChevronRight' />
						</span>
					</button>
				</div>

				<div className='asset-booking-mobile-nav__day-bar'>
					<div className='asset-booking-mobile-nav__day-core'>
						<button
							type='button'
							className='asset-booking-mobile-nav__day-header'
							aria-label='Select date'
							onClick={() => openNativePicker(dateInputRef.current)}>
							<span className='asset-booking-mobile-nav__weekday'>
								{focusedDay.format('dddd')}
							</span>
							<span className='asset-booking-mobile-nav__date-num'>
								{focusedDay.format('D')}
							</span>
							<span className='asset-booking-mobile-nav__date-sub'>
								{focusedDay.format('MMMM YYYY')}
							</span>
						</button>
						<input
							ref={dateInputRef}
							type='date'
							className='asset-booking-mobile-nav__picker'
							value={focusedDay.format('YYYY-MM-DD')}
							onChange={(e) => {
								if (!e.target.value) return;
								onFocusedDayChange(dayjs(e.target.value));
							}}
							tabIndex={-1}
							aria-hidden
						/>
						<div className='asset-booking-mobile-nav__day-content'>
							{loading ? (
								<MobileCalendarSkeleton contentOnly variant='booking' cardCount={2} />
							) : (
								<AssetBookingDayDetails
									bookings={bookings}
									allowBooking={allowBooking}
									onActionSuccess={onActionSuccess}
									siteTimezoneIana={siteTimezoneIana}
									siteTimezoneLabel={siteTimezoneLabel}
									emptyMinHeight={160}
								/>
							)}
						</div>
					</div>
				</div>

				<div className='asset-booking-mobile-nav__meta'>
					{loading ? (
						<span className='asset-booking-mobile-nav__chip mobile-calendar-skeleton__chip-slot'>
							<span className='mobile-calendar-skeleton__chip-fill mobile-calendar-skeleton__shimmer' />
						</span>
					) : bookings.length > 0 ? (
						<span className='asset-booking-mobile-nav__chip asset-booking-mobile-nav__chip--booked'>
							<Icon icon='EventAvailable' className='me-1' />
							{bookings.length} booking{bookings.length === 1 ? '' : 's'}
						</span>
					) : (
						<span className='asset-booking-mobile-nav__chip asset-booking-mobile-nav__chip--free'>
							<Icon icon='EventAvailable' className='me-1' />
							Free day
						</span>
					)}
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
					{timezoneHint ? (
						<span className='asset-booking-mobile-nav__timezone'>{timezoneHint}</span>
					) : null}
				</div>
			</div>

			{allowBooking ? (
				<Button
					color='info'
					className='w-100 mt-3'
					size='lg'
					icon='EventAvailable'
					onClick={() => onBook?.(focusedDay.toDate())}>
					Book this asset
				</Button>
			) : null}
		</div>
	);
};

export default AssetBookingMobileDayView;
