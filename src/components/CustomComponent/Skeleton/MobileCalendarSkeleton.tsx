import React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import Icon from '../../icon/Icon';
import MobileDayNavigator from '../MobileDayNavigator';
import './MobileCalendarSkeleton.css';

type MobileCalendarSkeletonProps = {
	focusedDay?: Dayjs;
	onFocusedDayChange?: (day: Dayjs) => void;
	/** Only the day-content cards (nav already rendered by parent). */
	contentOnly?: boolean;
	/** Match booking day cards vs schedule listing cards. */
	variant?: 'schedule' | 'booking';
	cardCount?: number;
	className?: string;
	showBookButton?: boolean;
};

const ContentCards = ({
	variant,
	cardCount,
}: {
	variant: 'schedule' | 'booking';
	cardCount: number;
}) => {
	if (variant === 'booking') {
		return (
			<div className='d-flex flex-column gap-3' aria-busy='true' aria-label='Loading bookings'>
				{Array.from({ length: cardCount }).map((_, index) => (
					<div key={index} className='mobile-calendar-skeleton__booking-card rounded-3 p-4'>
						<div className='d-flex align-items-start justify-content-between gap-3 mb-3'>
							<div className='d-flex align-items-center gap-3 min-w-0 flex-grow-1'>
								<span className='mobile-calendar-skeleton__avatar mobile-calendar-skeleton__shimmer' />
								<div className='min-w-0 flex-grow-1 d-flex flex-column gap-2'>
									<span className='mobile-calendar-skeleton__line mobile-calendar-skeleton__line--md mobile-calendar-skeleton__shimmer' />
									<span className='mobile-calendar-skeleton__line mobile-calendar-skeleton__line--sm mobile-calendar-skeleton__shimmer' />
								</div>
							</div>
							<span className='mobile-calendar-skeleton__badge mobile-calendar-skeleton__shimmer' />
						</div>
						<div className='mobile-calendar-skeleton__booking-panel rounded-3 px-3 py-3 d-flex flex-column gap-2'>
							<span className='mobile-calendar-skeleton__line mobile-calendar-skeleton__line--lg mobile-calendar-skeleton__shimmer' />
							<span className='mobile-calendar-skeleton__line mobile-calendar-skeleton__line--md mobile-calendar-skeleton__shimmer' />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className='schedule-mobile-day-listing' aria-busy='true' aria-label='Loading day details'>
			<div className='d-flex flex-column gap-2'>
				{Array.from({ length: cardCount }).map((_, index) => (
					<div key={index} className='schedule-mobile-day-listing__card text-start w-100'>
						<div className='d-flex align-items-start gap-3'>
							<span className='schedule-mobile-day-listing__icon flex-shrink-0 mobile-calendar-skeleton__shimmer rounded-circle' />
							<div className='min-w-0 flex-grow-1 d-flex flex-column gap-2'>
								<span className='mobile-calendar-skeleton__line mobile-calendar-skeleton__line--xs mobile-calendar-skeleton__shimmer' />
								<span className='mobile-calendar-skeleton__line mobile-calendar-skeleton__line--md mobile-calendar-skeleton__shimmer' />
								<span className='mobile-calendar-skeleton__line mobile-calendar-skeleton__line--sm mobile-calendar-skeleton__shimmer' />
							</div>
						</div>
					</div>
				))}
			</div>
			<span className='mobile-calendar-skeleton__details-btn mobile-calendar-skeleton__shimmer mt-3 d-block w-100' />
		</div>
	);
};

/**
 * Mobile calendar skeleton that reuses the real day-navigator structure
 * so layout does not shift while loading.
 */
const MobileCalendarSkeleton = ({
	focusedDay,
	onFocusedDayChange,
	contentOnly = false,
	variant = 'schedule',
	cardCount = variant === 'booking' ? 2 : 3,
	className,
	showBookButton = false,
}: MobileCalendarSkeletonProps) => {
	const day = focusedDay ?? dayjs();
	const content = <ContentCards variant={variant} cardCount={cardCount} />;

	if (contentOnly) {
		return <div className={className}>{content}</div>;
	}

	const handleDayChange = onFocusedDayChange ?? (() => undefined);
	const isToday = day.isSame(dayjs(), 'day');

	return (
		<div
			className={['asset-booking-mobile-day', className].filter(Boolean).join(' ')}
			aria-busy='true'
			aria-label='Loading calendar'>
			<MobileDayNavigator
				focusedDay={day}
				onFocusedDayChange={handleDayChange}
				meta={
					<>
						<span className='asset-booking-mobile-nav__chip mobile-calendar-skeleton__chip-slot'>
							<span className='mobile-calendar-skeleton__chip-fill mobile-calendar-skeleton__shimmer' />
						</span>
						{isToday ? (
							<span className='asset-booking-mobile-nav__chip asset-booking-mobile-nav__chip--today-active'>
								<Icon icon='Today' className='me-1' />
								Today
							</span>
						) : (
							<button
								type='button'
								className='asset-booking-mobile-nav__chip asset-booking-mobile-nav__chip--today'
								onClick={() => handleDayChange(dayjs())}>
								<Icon icon='Today' className='me-1' />
								Today
							</button>
						)}
					</>
				}>
				{content}
			</MobileDayNavigator>
			{showBookButton ? (
				<span className='mobile-calendar-skeleton__book-btn mobile-calendar-skeleton__shimmer mt-3 d-block w-100' />
			) : null}
		</div>
	);
};

export default MobileCalendarSkeleton;
