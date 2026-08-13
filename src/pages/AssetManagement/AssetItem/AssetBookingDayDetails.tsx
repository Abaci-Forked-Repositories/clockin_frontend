import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import Icon from '../../../components/icon/Icon';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';
import AuthContext from '../../../contexts/authContext';
import useDarkMode from '../../../hooks/useDarkMode';
import { isAdminOrHrToggleMode } from '../../../helpers/roleToggleUtils';
import { formatUtcIsoInZone } from '../../../helpers/siteTimezoneDatetime';
import AssetRequestActionButtons from '../AssetRequest/AssetRequestActionButtons';
import { formatApiDatetimeAsIs } from './assetMovementUtils';
import {
	bookingPhaseCode,
	bookingPhaseLabel,
	bookingStatusColor,
	type AssetBooking,
} from './assetBookingCalendarUtils';

type AssetBookingDayDetailsProps = {
	bookings: AssetBooking[];
	allowBooking?: boolean;
	onActionSuccess?: () => void;
	siteTimezoneIana?: string;
	siteTimezoneLabel?: string;
	emptyMinHeight?: number;
};

const formatDatetime = (raw?: string, timeZoneIana?: string): string => {
	if (!raw) return '';
	if (timeZoneIana) return formatUtcIsoInZone(raw, timeZoneIana);
	return formatApiDatetimeAsIs(raw);
};

const initialsFromName = (name?: string): string => {
	const parts = String(name || '')
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (!parts.length) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const AssetBookingDayDetails = ({
	bookings,
	allowBooking = false,
	onActionSuccess,
	siteTimezoneIana,
	siteTimezoneLabel,
	emptyMinHeight = 240,
}: AssetBookingDayDetailsProps) => {
	const { userData } = useContext(AuthContext);
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const canShowBookingActions = isAdminOrHrToggleMode(userData, mode);
	const { darkModeStatus } = useDarkMode();
	const timezoneHint = siteTimezoneLabel || siteTimezoneIana;

	const cardBg = darkModeStatus ? 'rgba(255,255,255,0.06)' : '#ffffff';
	const border = darkModeStatus ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)';
	const textPrimary = darkModeStatus ? '#f1f5f9' : '#0f172a';
	const textMuted = darkModeStatus ? '#94a3b8' : '#64748b';
	const accentSoft = darkModeStatus ? 'rgba(13,110,253,0.18)' : 'rgba(13,110,253,0.08)';

	if (bookings.length === 0) {
		return (
			<div
				className='d-flex flex-column align-items-center justify-content-center text-center rounded-3 px-4 py-5'
				style={{
					background: cardBg,
					border: `1px dashed ${border}`,
					minHeight: emptyMinHeight,
				}}>
				<div
					className='d-flex align-items-center justify-content-center rounded-circle mb-3'
					style={{
						width: 56,
						height: 56,
						background: accentSoft,
						color: '#0d6efd',
					}}>
					<Icon icon='EventAvailable' size='2x' />
				</div>
				<div style={{ color: textPrimary, fontWeight: 600, fontSize: '1.05rem' }}>
					No bookings yet
				</div>
				<div className='mt-2' style={{ color: textMuted, maxWidth: 320, fontSize: '0.95rem' }}>
					{allowBooking
						? 'This day is open. Book the asset to reserve your slot.'
						: 'Nothing is scheduled for this day.'}
				</div>
			</div>
		);
	}

	return (
		<div className='d-flex flex-column gap-3'>
			{bookings.map((booking, index) => {
				const startDisplay =
					formatDatetime(booking.start_datetime, siteTimezoneIana) ||
					booking.start_date ||
					'';
				const endDisplay =
					formatDatetime(booking.end_datetime, siteTimezoneIana) ||
					booking.end_date ||
					'';
				const phaseCode = bookingPhaseCode(booking);
				const phaseLabel = bookingPhaseLabel(booking);
				const accent = bookingStatusColor(phaseCode);
				const canApprove = Boolean(booking.actions?.can_approve);
				const canReject = Boolean(booking.actions?.can_reject);
				const canCancel = Boolean(booking.actions?.can_cancel);
				const hasItemActions =
					canShowBookingActions &&
					(canApprove || canReject || canCancel) &&
					booking.request_id != null &&
					booking.request_item_id != null;

				return (
					<div
						key={String(
							booking.request_item_id ??
								booking.id ??
								`${booking.user_name}-${index}`,
						)}
						className='rounded-3 p-4'
						style={{
							background: cardBg,
							border: `1px solid ${border}`,
							borderLeft: `4px solid ${accent}`,
						}}>
						<div className='d-flex align-items-start justify-content-between gap-3 mb-3'>
							<div className='d-flex align-items-center gap-3 min-w-0'>
								<div
									className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
									style={{
										width: 48,
										height: 48,
										background: accentSoft,
										color: accent,
										fontWeight: 700,
										fontSize: '0.9rem',
									}}>
									{initialsFromName(booking.user_name)}
								</div>
								<div className='min-w-0'>
									<div
										style={{
											color: textPrimary,
											fontWeight: 700,
											fontSize: '1.05rem',
										}}
										className='text-truncate d-flex align-items-center gap-2'>
										{booking.user_name || 'Booking'}
										{booking.is_requested_by_you ? (
											<span className='rbc-booking-event-card__you'>You</span>
										) : null}
									</div>
									{booking.email ? (
										<div
											className='text-truncate mt-1'
											style={{ color: textMuted, fontSize: '0.9rem' }}>
											{booking.email}
										</div>
									) : null}
								</div>
							</div>
							{phaseLabel ? (
								<StatusBadge
									status={phaseCode}
									label={phaseLabel}
									emptyFallback=''
								/>
							) : null}
						</div>

						<div
							className='rounded-3 px-3 py-3 d-flex flex-column gap-2'
							style={{
								background: darkModeStatus ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
							}}>
							{timezoneHint ? (
								<div
									className='small mb-1'
									style={{ color: textMuted, fontWeight: 600 }}>
									Times in {timezoneHint}
								</div>
							) : null}
							<div className='d-flex justify-content-between gap-2'>
								<span style={{ color: textMuted }}>Start</span>
								<span style={{ color: textPrimary, fontWeight: 600 }}>
									{startDisplay || '—'}
								</span>
							</div>
							<div className='d-flex justify-content-between gap-2'>
								<span style={{ color: textMuted }}>End</span>
								<span style={{ color: textPrimary, fontWeight: 600 }}>
									{endDisplay || '—'}
								</span>
							</div>
						</div>

						{booking.description ? (
							<div className='mt-3' style={{ color: textMuted }}>
								{booking.description}
							</div>
						) : null}

						{hasItemActions ? (
							<div className='d-flex justify-content-end mt-3'>
								<AssetRequestActionButtons
									id={booking.request_id as number | string}
									itemId={booking.request_item_id}
									onActionSuccess={onActionSuccess}
									canApprove={canApprove}
									canReject={canReject}
									canCancel={canCancel}
								/>
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
};

export default AssetBookingDayDetails;
