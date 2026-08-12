import dayjs, { type Dayjs } from 'dayjs';
import { dateKeyFromIsoInZone } from '../../../helpers/siteTimezoneDatetime';
import { ASSET_REQUEST_STATUS_LOOKUP } from '../AssetRequest/assetRequestUtils';

export type AssetBookingActions = {
	can_approve?: boolean;
	can_reject?: boolean;
	can_cancel?: boolean;
};

export type AssetBooking = {
	id?: number | string;
	request_id?: number | string;
	request_item_id?: number | string;
	user_name: string;
	email?: string;
	start_date?: string;
	end_date?: string;
	start_datetime?: string;
	end_datetime?: string;
	booking_phase?: string;
	booking_phase_display?: string;
	status?: string;
	status_display?: string;
	description?: string;
	actions?: AssetBookingActions;
	is_requested_by_you?: boolean;
	raw?: unknown;
};

export type AssetBookingCalendarEvent = {
	title: string;
	start: Date;
	end: Date;
	allDay: boolean;
	color: string;
	resource: {
		kind: 'booking';
		booking: AssetBooking;
		startDateKey: string;
		endDateKey: string;
	};
};

/** Distinct calendar accent colors by booking phase / request status. */
const BOOKING_PHASE_COLORS: Record<string, string> = {
	REQUESTED: '#d97706',
	PENDING: '#d97706',
	APPLIED: '#d97706',
	UPCOMING: '#2563eb',
	APPROVED: '#059669',
	ACTIVE: '#059669',
	IN_PROGRESS: '#059669',
	ONGOING: '#059669',
	PARTIAL: '#ea580c',
	COMPLETED: '#7c3aed',
	PAST: '#6b7280',
	REJECTED: '#dc2626',
	CANCELLED: '#9ca3af',
	CANCELED: '#9ca3af',
	BOOKED: '#0f766e',
};

const DEFAULT_BOOKING_COLOR = '#64748b';

const formatPhaseLabel = (phase: string): string =>
	phase
		.replace(/_/g, ' ')
		.trim()
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());

/** Prefer booking_phase; fall back to request status when phase is absent. */
export const bookingPhaseCode = (booking: AssetBooking): string => {
	const phase = String(booking.booking_phase || '').trim();
	if (phase) return phase;
	return String(booking.status || '').trim();
};

export const bookingPhaseLabel = (booking: AssetBooking): string => {
	const phase = bookingPhaseCode(booking);
	if (!phase) return '';
	const key = phase.toUpperCase().replace(/\s+/g, '_');
	const fromLookup = ASSET_REQUEST_STATUS_LOOKUP[key];
	if (fromLookup) return fromLookup;

	const display = String(
		booking.booking_phase_display || booking.status_display || '',
	).trim();
	if (display) return formatPhaseLabel(display);
	return formatPhaseLabel(phase);
};

export const CALENDAR_CELL_MAX_BOOKINGS = 3;

export const isAssetBookable = (asset: Record<string, unknown> | null | undefined): boolean => {
	if (!asset) return false;
	if (asset.asset_type != null && typeof asset.asset_type === 'object') {
		return Boolean((asset.asset_type as { is_bookable?: boolean }).is_bookable);
	}
	return Boolean(asset.is_bookable);
};

export const toDateKey = (d: Date | Dayjs | string): string => {
	if (typeof d === 'string') {
		return String(d).trim().slice(0, 10);
	}
	const date = dayjs.isDayjs(d) ? d : dayjs(d);
	return date.format('YYYY-MM-DD');
};

const parseLocalDay = (raw: unknown): Dayjs | null => {
	const s = String(raw ?? '')
		.trim()
		.slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
		const [y, m, d] = s.split('-').map(Number);
		return dayjs(new Date(y, m - 1, d));
	}
	const parsed = dayjs(raw as any);
	return parsed.isValid() ? parsed.startOf('day') : null;
};

const dateKeyFromDatetime = (raw: unknown, timeZone?: string | null): string | null => {
	const s = String(raw ?? '').trim();
	if (!s) return null;
	const inZone = dateKeyFromIsoInZone(s, timeZone);
	if (inZone) return inZone;
	const dayPart = s.slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(dayPart)) return dayPart;
	const parsed = dayjs(s);
	return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
};

const resolveUserName = (value: unknown): string => {
	if (value == null || value === '') return '';
	if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
	if (typeof value === 'object') {
		const record = value as Record<string, unknown>;
		const preferred = String(
			record.full_name || record.preferred_name || record.name || '',
		).trim();
		if (preferred) return preferred;
		const full = [record.first_name, record.last_name].filter(Boolean).join(' ').trim();
		if (full) return full;
		const email = String(record.email || '').trim();
		if (email) return email;
	}
	return '';
};

export const normalizeBooking = (
	raw: any,
	timeZone?: string | null,
): AssetBooking | null => {
	if (raw == null || typeof raw !== 'object') return null;

	const bookedBy = raw.booked_by;
	const userName =
		resolveUserName(bookedBy) ||
		resolveUserName(raw.user) ||
		resolveUserName(raw.user_details) ||
		resolveUserName(raw.requested_by) ||
		resolveUserName(raw.employee) ||
		String(raw.user_name || raw.employee_name || '').trim() ||
		'Booking';

	const email =
		(typeof bookedBy === 'object' && bookedBy != null
			? String(bookedBy.email || '').trim()
			: '') || String(raw.email || '').trim() || undefined;

	const bookingPhase = String(raw.booking_phase || '').trim();
	const status = String(raw.status || '').trim();
	const bookingPhaseDisplay =
		String(raw.booking_phase_display || '').trim() ||
		(bookingPhase ? formatPhaseLabel(bookingPhase) : '');
	const statusDisplay =
		String(raw.status_display || '').trim() ||
		(status
			? ASSET_REQUEST_STATUS_LOOKUP[status.toUpperCase()] || formatPhaseLabel(status)
			: '');

	const actionsRaw = raw.actions;
	const actions: AssetBookingActions | undefined =
		actionsRaw != null && typeof actionsRaw === 'object'
			? {
					can_approve: Boolean(actionsRaw.can_approve),
					can_reject: Boolean(actionsRaw.can_reject),
					can_cancel: Boolean(actionsRaw.can_cancel),
				}
			: undefined;

	const startDatetime = raw.start_datetime ? String(raw.start_datetime) : undefined;
	const endDatetime = raw.end_datetime ? String(raw.end_datetime) : undefined;
	// Prefer site-timezone calendar days from datetimes (not UTC date keys from API buckets).
	const startDate =
		dateKeyFromDatetime(startDatetime, timeZone) ||
		(raw.start_date ? String(raw.start_date).slice(0, 10) : undefined) ||
		undefined;
	const endDate =
		dateKeyFromDatetime(endDatetime, timeZone) ||
		(raw.end_date ? String(raw.end_date).slice(0, 10) : undefined) ||
		undefined;

	return {
		id: raw.id ?? raw.request_item_id,
		request_id: raw.asset_request_id ?? raw.request_id ?? raw.request?.id,
		request_item_id: raw.request_item_id ?? raw.id,
		user_name: userName,
		email: email || undefined,
		start_date: startDate,
		end_date: endDate,
		start_datetime: startDatetime,
		end_datetime: endDatetime,
		booking_phase: bookingPhase || undefined,
		booking_phase_display: bookingPhaseDisplay || undefined,
		status: status || undefined,
		status_display: statusDisplay || undefined,
		description: String(raw.description || raw.remarks || '').trim() || undefined,
		actions,
		is_requested_by_you: Boolean(raw.is_requested_by_you),
		raw,
	};
};

export const bookingStatusColor = (phase?: string): string => {
	const key = String(phase || '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '_');
	return BOOKING_PHASE_COLORS[key] || DEFAULT_BOOKING_COLOR;
};

export const summarizeBookingTitles = (
	bookings: AssetBooking[],
	maxShown = CALENDAR_CELL_MAX_BOOKINGS,
): string => {
	if (!bookings.length) return '';
	const lines = bookings.map((b) => {
		const name = b.user_name || 'Booking';
		const phaseLabel = bookingPhaseLabel(b);
		return phaseLabel ? `${name} · ${phaseLabel}` : name;
	});
	const unique = Array.from(new Set(lines));
	const shown = unique.slice(0, maxShown);
	const body = shown.join('\n');
	if (unique.length > maxShown) {
		return body ? `${body}\n+${unique.length - maxShown} more` : `+${unique.length - maxShown} more`;
	}
	return body || 'Booked';
};

export const BOOKING_STATUS_LEGEND: { key: string; label: string; color: string }[] = [
	{ key: 'REQUESTED', label: 'Requested', color: BOOKING_PHASE_COLORS.REQUESTED },
	{ key: 'PENDING', label: 'Pending', color: BOOKING_PHASE_COLORS.PENDING },
	{ key: 'BOOKED', label: 'Booked', color: BOOKING_PHASE_COLORS.BOOKED },
	{ key: 'UPCOMING', label: 'Upcoming', color: BOOKING_PHASE_COLORS.UPCOMING },
	{ key: 'APPROVED', label: 'Approved', color: BOOKING_PHASE_COLORS.APPROVED },
	{ key: 'ACTIVE', label: 'Active', color: BOOKING_PHASE_COLORS.ACTIVE },
	{ key: 'PARTIAL', label: 'Partial', color: BOOKING_PHASE_COLORS.PARTIAL },
	{ key: 'COMPLETED', label: 'Completed', color: BOOKING_PHASE_COLORS.COMPLETED },
	{ key: 'PAST', label: 'Past', color: BOOKING_PHASE_COLORS.PAST },
	{ key: 'REJECTED', label: 'Rejected', color: BOOKING_PHASE_COLORS.REJECTED },
	{ key: 'CANCELLED', label: 'Cancelled', color: BOOKING_PHASE_COLORS.CANCELLED },
];

export const formatBookingRange = (booking: AssetBooking): string => {
	const start = booking.start_date || dateKeyFromDatetime(booking.start_datetime);
	const end = booking.end_date || dateKeyFromDatetime(booking.end_datetime);
	if (start && end && start !== end) return `${start} → ${end}`;
	if (start) return start;
	if (end) return end;
	return '—';
};

/** Bookings whose span includes the given calendar day. */
export const bookingsForDate = (
	events: AssetBookingCalendarEvent[],
	date: Date | string,
): AssetBooking[] => {
	const key = toDateKey(date);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return [];
	return events
		.filter((event) => {
			const start = event.resource.startDateKey;
			const end = event.resource.endDateKey;
			return start <= key && key <= end;
		})
		.map((event) => event.resource.booking);
};

const bookingSpanKey = (raw: any, booking: AssetBooking): string => {
	const itemId = raw?.request_item_id ?? booking.request_item_id;
	if (itemId != null && itemId !== '') return `item:${itemId}`;
	const requestId = raw?.asset_request_id ?? booking.request_id;
	if (requestId != null && requestId !== '') return `request:${requestId}`;
	if (booking.id != null && booking.id !== '') return `id:${booking.id}`;
	return `fallback:${booking.user_name}|${booking.start_datetime}|${booking.end_datetime}`;
};

const minDateKey = (a: string, b: string): string => (a <= b ? a : b);
const maxDateKey = (a: string, b: string): string => (a >= b ? a : b);

/** One entry per request/booking — merges multi-day rows from `bookings_by_date`. */
export const collectUniqueBookings = (
	data: any,
	timeZone?: string | null,
): AssetBooking[] => {
	const merged = new Map<
		string,
		{ booking: AssetBooking; minDate: string; maxDate: string }
	>();

	const ingest = (dateKey: string, raw: any) => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
		const booking = normalizeBooking(raw, timeZone);
		if (!booking) return;

		const key = bookingSpanKey(raw, booking);
		const fromStart = dateKeyFromDatetime(booking.start_datetime, timeZone);
		const fromEnd = dateKeyFromDatetime(booking.end_datetime, timeZone);
		// Site-local days from datetimes; API bucket date is fallback only (UTC buckets can span extra days).
		const entryStart = fromStart || booking.start_date || dateKey;
		const entryEnd = fromEnd || booking.end_date || fromStart || dateKey;

		const existing = merged.get(key);
		if (!existing) {
			merged.set(key, {
				booking: {
					...booking,
					start_date: entryStart,
					end_date: entryEnd,
				},
				minDate: entryStart,
				maxDate: entryEnd,
			});
			return;
		}

		existing.minDate = minDateKey(existing.minDate, entryStart);
		existing.maxDate = maxDateKey(existing.maxDate, entryEnd);
		existing.booking = {
			...existing.booking,
			start_date: existing.minDate,
			end_date: existing.maxDate,
			booking_phase: booking.booking_phase || existing.booking.booking_phase,
			booking_phase_display:
				booking.booking_phase_display || existing.booking.booking_phase_display,
			status: booking.status || existing.booking.status,
			status_display: booking.status_display || existing.booking.status_display,
			actions: booking.actions || existing.booking.actions,
			request_item_id: booking.request_item_id || existing.booking.request_item_id,
			request_id: booking.request_id || existing.booking.request_id,
		};
	};

	const byDate = data?.bookings_by_date;
	if (byDate != null && typeof byDate === 'object' && !Array.isArray(byDate)) {
		for (const [dateKey, list] of Object.entries(byDate as Record<string, unknown>)) {
			const key = String(dateKey).slice(0, 10);
			for (const raw of Array.isArray(list) ? list : []) {
				ingest(key, raw);
			}
		}
		return Array.from(merged.values()).map(({ booking, minDate, maxDate }) => ({
			...booking,
			start_date: minDate,
			end_date: maxDate,
		}));
	}

	const list = Array.isArray(data)
		? data
		: Array.isArray(data?.bookings)
			? data.bookings
			: Array.isArray(data?.results)
				? data.results
				: [];

	for (const raw of list) {
		const booking = normalizeBooking(raw, timeZone);
		if (!booking) continue;
		const startKey =
			dateKeyFromDatetime(booking.start_datetime, timeZone) ||
			booking.start_date ||
			'';
		const endKey =
			dateKeyFromDatetime(booking.end_datetime, timeZone) ||
			booking.end_date ||
			startKey;
		if (!startKey) continue;

		const key = bookingSpanKey(raw, booking);
		const existing = merged.get(key);
		if (!existing) {
			merged.set(key, {
				booking: { ...booking, start_date: startKey, end_date: endKey },
				minDate: startKey,
				maxDate: endKey,
			});
			continue;
		}
		existing.minDate = minDateKey(existing.minDate, startKey);
		existing.maxDate = maxDateKey(existing.maxDate, endKey);
		existing.booking = {
			...existing.booking,
			start_date: existing.minDate,
			end_date: existing.maxDate,
			booking_phase: booking.booking_phase || existing.booking.booking_phase,
			booking_phase_display:
				booking.booking_phase_display || existing.booking.booking_phase_display,
			status: booking.status || existing.booking.status,
			status_display: booking.status_display || existing.booking.status_display,
			actions: booking.actions || existing.booking.actions,
			request_item_id: booking.request_item_id || existing.booking.request_item_id,
			request_id: booking.request_id || existing.booking.request_id,
		};
	}

	return Array.from(merged.values()).map(({ booking, minDate, maxDate }) => ({
		...booking,
		start_date: minDate,
		end_date: maxDate,
	}));
};

/** Count distinct calendar days covered by spanning booking events. */
export const countBookedDays = (events: AssetBookingCalendarEvent[]): number => {
	const days = new Set<string>();
	for (const event of events) {
		const start = parseLocalDay(event.resource.startDateKey);
		const end = parseLocalDay(event.resource.endDateKey);
		if (!start?.isValid() || !end?.isValid()) continue;
		let cursor = start.startOf('day');
		const last = end.startOf('day');
		while (cursor.isBefore(last) || cursor.isSame(last, 'day')) {
			days.add(cursor.format('YYYY-MM-DD'));
			cursor = cursor.add(1, 'day');
		}
	}
	return days.size;
};

/** Prefer unique bookings expanded by site-local span; API UTC buckets alone can mis-bucket overnight. */
export const bookingsByDate = (
	data: any,
	timeZone?: string | null,
): Record<string, AssetBooking[]> => {
	const map: Record<string, AssetBooking[]> = {};
	const push = (dateKey: string, booking: AssetBooking) => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
		if (!map[dateKey]) map[dateKey] = [];
		const exists = map[dateKey].some(
			(b) =>
				(b.request_item_id != null &&
					booking.request_item_id != null &&
					String(b.request_item_id) === String(booking.request_item_id)) ||
				(b.id != null && booking.id != null && String(b.id) === String(booking.id)) ||
				(b.user_name === booking.user_name &&
					b.start_datetime === booking.start_datetime &&
					b.end_datetime === booking.end_datetime),
		);
		if (!exists) map[dateKey].push(booking);
	};

	for (const booking of collectUniqueBookings(data, timeZone)) {
		const start =
			parseLocalDay(booking.start_date) ||
			parseLocalDay(dateKeyFromDatetime(booking.start_datetime, timeZone));
		const end =
			parseLocalDay(booking.end_date) ||
			parseLocalDay(dateKeyFromDatetime(booking.end_datetime, timeZone)) ||
			start;

		if (!start || !start.isValid()) continue;
		const endDay = end && end.isValid() ? end : start;

		let cursor = start.startOf('day');
		const last = endDay.startOf('day');
		while (cursor.isBefore(last) || cursor.isSame(last, 'day')) {
			push(cursor.format('YYYY-MM-DD'), booking);
			cursor = cursor.add(1, 'day');
		}
	}

	return map;
};

export const buildBookingCalendarEvents = (
	data: any,
	timeZone?: string | null,
): AssetBookingCalendarEvent[] => {
	const bookings = collectUniqueBookings(data, timeZone);

	return bookings
		.map((booking) => {
			const startDay = parseLocalDay(booking.start_date);
			const endDay = parseLocalDay(booking.end_date);
			if (!startDay?.isValid() || !endDay?.isValid()) return null;

			const startDateKey = startDay.format('YYYY-MM-DD');
			const endDateKey = endDay.format('YYYY-MM-DD');
			const title = summarizeBookingTitles([booking]);

			return {
				title,
				start: startDay.toDate(),
				// RBC month view: exclusive end → bar covers through last day inclusive.
				end: endDay.add(1, 'day').startOf('day').toDate(),
				allDay: true,
				color: bookingStatusColor(bookingPhaseCode(booking)),
				resource: {
					kind: 'booking' as const,
					booking,
					startDateKey,
					endDateKey,
				},
			};
		})
		.filter((event): event is AssetBookingCalendarEvent => event != null);
};
