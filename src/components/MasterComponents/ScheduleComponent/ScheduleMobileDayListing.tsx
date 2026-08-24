import React from 'react';
import Icon from '../../icon/Icon';
import { statusColorLightBackground } from '../../../pages/Attendance/attendanceStatusUtils';
import type { TIcons } from '../../../type/icons-type';
import MobileCalendarSkeleton from '../../CustomComponent/Skeleton/MobileCalendarSkeleton';

type ScheduleEventKind = 'status' | 'shift' | 'leave' | 'ot' | string;

const KIND_META: Record<
	string,
	{ label: string; icon: TIcons }
> = {
	status: { label: 'Status', icon: 'EventNote' },
	shift: { label: 'Schedule', icon: 'CalendarToday' },
	leave: { label: 'Leave', icon: 'EventBusy' },
	ot: { label: 'Overtime', icon: 'HistoryToggleOff' },
};

type ScheduleMobileDayListingProps = {
	events: any[];
	onViewDetails?: () => void;
	detailLoading?: boolean;
	loading?: boolean;
};

const ScheduleMobileDayListing = ({
	events,
	onViewDetails,
	detailLoading = false,
	loading = false,
}: ScheduleMobileDayListingProps) => {
	if (loading || (detailLoading && events.length === 0)) {
		return <MobileCalendarSkeleton contentOnly variant='schedule' cardCount={3} />;
	}

	return (
		<div className='schedule-mobile-day-listing'>
			{events.length === 0 ? (
				<div className='schedule-mobile-day-listing__empty text-center py-4 px-3'>
					<div className='schedule-mobile-day-listing__empty-icon d-inline-flex align-items-center justify-content-center rounded-circle mb-3'>
						<Icon icon='EventAvailable' size='2x' />
					</div>
					<div className='fw-semibold'>Nothing on this day</div>
					<div className='small text-muted mt-2'>
						No status, schedule, leave, or overtime entries for this date.
					</div>
				</div>
			) : (
				<div className='d-flex flex-column gap-2'>
					{events.map((event, index) => {
						const accent = String(event?.color || '#64748b');
						const kind = String(event?.resource?.kind || 'status') as ScheduleEventKind;
						const kindMeta = KIND_META[kind] || {
							label: kind.replace(/_/g, ' '),
							icon: 'Event' as TIcons,
						};
						const lines = String(event?.title || '')
							.split('\n')
							.filter(Boolean);
						const [primary, ...details] = lines;

						return (
							<button
								key={`${kind}-${index}-${primary}`}
								type='button'
								className='schedule-mobile-day-listing__card text-start w-100'
								style={{
									background: statusColorLightBackground(accent, '28'),
									borderLeft: `4px solid ${accent}`,
								}}
								onClick={onViewDetails}
								disabled={!onViewDetails || detailLoading}>
								<div className='d-flex align-items-start gap-3'>
									<div
										className='schedule-mobile-day-listing__icon flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle'
										style={{
											background: statusColorLightBackground(accent, '40'),
											color: accent,
										}}>
										<Icon icon={kindMeta.icon} />
									</div>
									<div className='min-w-0 flex-grow-1'>
										<div
											className='schedule-mobile-day-listing__kind small fw-bold text-uppercase'
											style={{ color: accent }}>
											{kindMeta.label}
										</div>
										{primary ? (
											<div className='schedule-mobile-day-listing__primary fw-bold mt-1'>
												{primary}
											</div>
										) : null}
										{details.map((line, lineIndex) => (
											<div
												key={lineIndex}
												className='schedule-mobile-day-listing__detail small text-muted mt-1'>
												{line}
											</div>
										))}
									</div>
								</div>
							</button>
						);
					})}
				</div>
			)}

			{onViewDetails ? (
				<button
					type='button'
					className='schedule-mobile-day-listing__details-btn btn btn-warning w-100 mt-3'
					onClick={onViewDetails}
					disabled={detailLoading}>
					{detailLoading ? 'Loading details…' : 'View full day details'}
				</button>
			) : null}
		</div>
	);
};

export default ScheduleMobileDayListing;
