/**
 * Interpret datetime-local wall clock in a site IANA timezone and emit UTC ISO (`…Z`).
 * Uses Intl only (no dayjs-timezone dependency).
 */

const pad2 = (n: number) => String(n).padStart(2, '0');

const IANA_TZ_RE = /^(UTC|[A-Za-z_]+\/[A-Za-z0-9_+\-\/]+)$/;

/** Prefer machine IANA id over display label from site.timezone object. */
export const resolveSiteTimezoneIana = (
	site: Record<string, unknown> | null | undefined,
): string => {
	if (!site) return '';
	const tz = site.timezone ?? site.time_zone;
	if (tz == null || tz === '') return '';

	if (typeof tz === 'string') {
		const s = tz.trim();
		return IANA_TZ_RE.test(s) ? s : '';
	}

	if (typeof tz === 'object') {
		const record = tz as Record<string, unknown>;
		const candidates = [
			record.timezone,
			record.tz,
			record.name,
			record.value,
			record.label,
		];
		for (const candidate of candidates) {
			const s = String(candidate ?? '').trim();
			if (IANA_TZ_RE.test(s)) return s;
		}
	}

	return '';
};

const isValidTimeZone = (timeZone: string): boolean => {
	try {
		Intl.DateTimeFormat(undefined, { timeZone });
		return true;
	} catch {
		return false;
	}
};

const zonedParts = (
	date: Date,
	timeZone: string,
): { year: number; month: number; day: number; hour: number; minute: number; second: number } => {
	const dtf = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
	});
	const parts = dtf.formatToParts(date);
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((p) => p.type === type)?.value || 0);
	return {
		year: get('year'),
		month: get('month'),
		day: get('day'),
		hour: get('hour'),
		minute: get('minute'),
		second: get('second'),
	};
};

/** Offset (ms) such that: utcMs + offset ≈ wall clock in zone when formatted. */
const getTimeZoneOffsetMs = (utcDate: Date, timeZone: string): number => {
	const p = zonedParts(utcDate, timeZone);
	const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
	return asUtc - utcDate.getTime();
};

/**
 * Wall clock `YYYY-MM-DD` + `HH:mm[:ss]` in `timeZone` → UTC ISO `…Z`.
 */
export const datetimeLocalInZoneToUtcIso = (
	datetimeLocal: string,
	timeZone: string,
): string | null => {
	const s = String(datetimeLocal || '').trim();
	const match = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
	if (!match) return null;
	if (!timeZone || !isValidTimeZone(timeZone)) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const hour = Number(match[4] || 0);
	const minute = Number(match[5] || 0);
	const second = Number(match[6] || 0);

	// Initial guess: treat wall values as if UTC, then correct by zone offset.
	let utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
	if (Number.isNaN(utc.getTime())) return null;

	const offset1 = getTimeZoneOffsetMs(utc, timeZone);
	utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offset1);

	const offset2 = getTimeZoneOffsetMs(utc, timeZone);
	if (offset2 !== offset1) {
		utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offset2);
	}

	return utc.toISOString();
};

/** API UTC/offset ISO → `datetime-local` wall clock in `timeZone`. */
export const utcIsoToDatetimeLocalInZone = (
	raw: string,
	timeZone: string,
): string => {
	const s = String(raw || '').trim();
	if (!s) return '';
	if (!timeZone || !isValidTimeZone(timeZone)) return '';

	const date = new Date(s);
	if (Number.isNaN(date.getTime())) return '';

	const p = zonedParts(date, timeZone);
	return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
};

/** API UTC/offset ISO → readable wall clock in `timeZone` (e.g. `06 Aug 2026, 09:00`). */
export const formatUtcIsoInZone = (
	raw: string | null | undefined,
	timeZone?: string | null,
): string => {
	const s = String(raw || '').trim();
	if (!s) return '';
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

	const zone = String(timeZone || '').trim();
	if (zone && isValidTimeZone(zone)) {
		const date = new Date(s);
		if (Number.isNaN(date.getTime())) return s;
		const p = zonedParts(date, zone);
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		const monthLabel = months[p.month - 1] || pad2(p.month);
		return `${pad2(p.day)} ${monthLabel} ${p.year}, ${pad2(p.hour)}:${pad2(p.minute)}`;
	}

	// No zone: keep wall clock as sent (no browser conversion).
	const match = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
	if (match) {
		const [, y, mo, d, hh, mi] = match;
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		return `${d} ${months[Number(mo) - 1] || mo} ${y}, ${hh}:${mi}`;
	}
	return s;
};

/** API UTC/offset ISO → calendar day key `YYYY-MM-DD` in `timeZone` (or wall-clock date if no zone). */
export const dateKeyFromIsoInZone = (
	raw: string | null | undefined,
	timeZone?: string | null,
): string | null => {
	const s = String(raw || '').trim();
	if (!s) return null;
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

	const zone = String(timeZone || '').trim();
	if (zone && isValidTimeZone(zone)) {
		const date = new Date(s);
		if (Number.isNaN(date.getTime())) return null;
		const p = zonedParts(date, zone);
		return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
	}

	const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
	return match ? match[1] : null;
};

/** Browser-local datetime-local → UTC ISO `…Z` (fallback when site TZ missing). */
export const datetimeLocalBrowserToUtcIso = (datetimeLocal: string): string | null => {
	const s = String(datetimeLocal || '').trim();
	const match = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
	if (!match) return null;
	const local = new Date(
		Number(match[1]),
		Number(match[2]) - 1,
		Number(match[3]),
		Number(match[4] || 0),
		Number(match[5] || 0),
		Number(match[6] || 0),
	);
	if (Number.isNaN(local.getTime())) return null;
	return local.toISOString();
};
