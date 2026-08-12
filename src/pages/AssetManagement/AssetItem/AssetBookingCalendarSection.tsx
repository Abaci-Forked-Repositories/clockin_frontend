import React, { useEffect, useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import CustomCalendar from '../../../components/CustomComponent/CustomCalendar';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { calendarEventStyleFromColor } from '../../Attendance/attendanceStatusUtils';
import BookAssetBookingForm from '../BookAsset/BookAssetBookingForm';
import AssetBookingDayModal from './AssetBookingDayModal';
import {
	BOOKING_STATUS_LEGEND,
	bookingPhaseCode,
	bookingPhaseLabel,
	bookingStatusColor,
	bookingsForDate,
	buildBookingCalendarEvents,
	countBookedDays,
	type AssetBooking,
} from './assetBookingCalendarUtils';
import { resolveSiteTimezoneIana } from '../../../helpers/siteTimezoneDatetime';
import { formatSiteTimezone } from '../../Site/SiteDetails/SiteDetails';

type AssetBookingCalendarSectionProps = {
	assetId: string | number;
	asset?: Record<string, unknown> | null;
	allowBooking?: boolean;
};

const AssetBookingCalendarSection = ({
	assetId,
	asset = null,
	allowBooking = false,
}: AssetBookingCalendarSectionProps) => {
	const { showErrorNotification } = useToasterNotification();
	const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
	const [loading, setLoading] = useState(false);
	const [calendarData, setCalendarData] = useState<any>(null);
	const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
	const [modalOpen, setModalOpen] = useState(false);
	const [bookingFormOpen, setBookingFormOpen] = useState(false);
	const [selectedDay, setSelectedDay] = useState<Date | null>(null);
	const [dayBookings, setDayBookings] = useState<AssetBooking[]>([]);

	const selectedYearMonth = selectedMonth.format('YYYY-MM');

	const site =
		asset?.site != null && typeof asset.site === 'object'
			? (asset.site as Record<string, unknown>)
			: null;
	const siteTimezoneIana = resolveSiteTimezoneIana(site);
	const siteTimezoneLabel = formatSiteTimezone(site) || siteTimezoneIana;

	const events = useMemo(
		() => buildBookingCalendarEvents(calendarData, siteTimezoneIana),
		[calendarData, siteTimezoneIana],
	);

	const bookedDayCount = useMemo(() => countBookedDays(events), [events]);

	const statusLegend = useMemo(() => {
		const byKey = new Map<string, { key: string; label: string; color: string }>();
		for (const event of events) {
			const booking = event?.resource?.booking;
			if (!booking) continue;
			const key = String(bookingPhaseCode(booking) || '')
				.trim()
				.toUpperCase()
				.replace(/\s+/g, '_');
			if (!key || byKey.has(key)) continue;
			const fromStatic = BOOKING_STATUS_LEGEND.find((item) => item.key === key);
			byKey.set(key, {
				key,
				label: fromStatic?.label || bookingPhaseLabel(booking),
				color: fromStatic?.color || bookingStatusColor(key),
			});
		}
		return Array.from(byKey.values());
	}, [events]);

	useEffect(() => {
		if (assetId == null || assetId === '') {
			setCalendarData(null);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);
		authAxios
			.get('/api/hr/asset-items/booking-calendar/', {
				params: {
					asset: assetId,
					year: selectedMonth.year(),
					month: selectedMonth.month() + 1,
				},
			})
			.then((res) => {
				if (!cancelled) setCalendarData(res?.data ?? null);
			})
			.catch((err) => {
				if (!cancelled) {
					setCalendarData(null);
					showErrorNotification(err);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assetId, selectedYearMonth, calendarRefreshKey]);

	const handleDateClick = (date: Date) => {
		setSelectedDay(date);
		setDayBookings(bookingsForDate(events, date));
		setModalOpen(true);
	};

	const handleBook = (date: Date | null) => {
		setSelectedDay(date);
		setBookingFormOpen(true);
	};

	const refreshCalendar = () => {
		setCalendarRefreshKey((key) => key + 1);
		setModalOpen(false);
	};

	return (
		<>
			<Card stretch className='w-100 mb-0 shadow-sm'>
				<CardHeader borderSize={1}>
					<CardLabel icon='EventAvailable' iconColor='info'>
						<CardTitle tag='div' className='h5 mb-0'>
							Booking calendar
						</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<div className='d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3'>
						<div className='d-flex flex-column gap-2' style={{ maxWidth: 320 }}>
							<input
								type='month'
								value={selectedMonth.format('YYYY-MM')}
								onChange={(e) => {
									if (e.target.value) setSelectedMonth(dayjs(e.target.value));
								}}
								className='form-control'
							/>
							{siteTimezoneLabel ? (
								<div className='small text-muted'>
									Site timezone:{' '}
									<span className='fw-semibold'>{siteTimezoneLabel}</span>
									{siteTimezoneIana && siteTimezoneIana !== siteTimezoneLabel
										? ` (${siteTimezoneIana})`
										: ''}
								</div>
							) : null}
						</div>
						{!loading ? (
							<span className='badge rounded-pill text-bg-light border px-3 py-2'>
								{bookedDayCount > 0
									? `${bookedDayCount} booked day${bookedDayCount === 1 ? '' : 's'}`
									: 'No bookings this month'}
							</span>
						) : null}
					</div>
					<div className='position-relative schedule-calendar schedule-calendar--fit'>
						{loading ? (
							<div className='d-flex justify-content-center align-items-center py-5'>
								<CustomSpinner />
							</div>
						) : (
							<>
								<div className='small text-muted mb-2'>
									{allowBooking
										? 'Click a day to view bookings or book this asset.'
										: bookedDayCount === 0
											? `No bookings in ${selectedMonth.format('MMMM YYYY')}. Click a day for details.`
											: 'Click a day to view booking details.'}
								</div>
								{statusLegend.length > 0 ? (
									<div className='d-flex flex-wrap gap-2 mb-3'>
										{statusLegend.map((item) => (
											<span
												key={item.key}
												className='d-inline-flex align-items-center gap-2 small'
												style={{ color: item.color }}>
												<span
													aria-hidden
													style={{
														width: 10,
														height: 10,
														borderRadius: 999,
														backgroundColor: item.color,
														display: 'inline-block',
													}}
												/>
												{item.label}
											</span>
										))}
									</div>
								) : null}
								<CustomCalendar
									events={events}
									date={selectedMonth.toDate()}
									height='auto'
									className='schedule-calendar-grid--fit'
									onNavigate={(date) => setSelectedMonth(dayjs(date))}
									onDateClick={handleDateClick}
									eventPropGetter={(event: any) => {
										const accent =
											event?.color ||
											bookingStatusColor(
												bookingPhaseCode(event?.resource?.booking),
											) ||
											'#64748b';
										return {
											className: 'rbc-event--booking-card',
											style: {
												...calendarEventStyleFromColor(accent),
												backgroundColor: 'transparent',
												borderLeft: 'none',
											},
										};
									}}
								/>
							</>
						)}
					</div>
				</CardBody>
			</Card>
			<AssetBookingDayModal
				isOpen={modalOpen}
				setIsOpen={setModalOpen}
				selectedDate={selectedDay}
				bookings={dayBookings}
				allowBooking={allowBooking}
				onBook={handleBook}
				onActionSuccess={refreshCalendar}
				siteTimezoneIana={siteTimezoneIana || undefined}
				siteTimezoneLabel={siteTimezoneLabel || undefined}
			/>
			{allowBooking ? (
				<BookAssetBookingForm
					isOpen={bookingFormOpen}
					setIsOpen={setBookingFormOpen}
					asset={asset}
					selectedDate={selectedDay}
					onBooked={refreshCalendar}
				/>
			) : null}
		</>
	);
};

export default AssetBookingCalendarSection;
