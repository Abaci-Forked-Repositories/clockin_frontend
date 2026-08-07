export const toMovementList = (data: unknown): any[] => {
	if (Array.isArray(data)) return data;
	if (
		data != null &&
		typeof data === 'object' &&
		Array.isArray((data as { results?: unknown[] }).results)
	) {
		return (data as { results: unknown[] }).results;
	}
	return [];
};

export const sortMovementsNewestFirst = (rows: any[]): any[] =>
	[...rows].sort((a, b) =>
		String(b?.movement_date || b?.created_at || '').localeCompare(
			String(a?.movement_date || a?.created_at || ''),
		),
	);

export const resolvePersonName = (value: unknown): string => {
	if (value == null || value === '') return '';
	if (typeof value === 'string') return value.trim();
	if (typeof value === 'number') return `User #${value}`;
	if (typeof value === 'object') {
		const record = value as Record<string, unknown>;
		const name = String(record.name || '').trim();
		if (name) return name;
		const full = [record.first_name, record.last_name].filter(Boolean).join(' ').trim();
		if (full) return full;
		const preferred = String(record.preferred_name || '').trim();
		if (preferred) return preferred;
		if (record.id != null) return `User #${record.id}`;
	}
	return '';
};

export const movementTypeLabel = (movement: any): string =>
	String(movement?.movement_type_display || movement?.movement_type || '').trim() || '----';

export const movementTypeStatus = (movement: any): string =>
	String(movement?.movement_type || '').trim();

/** Display API datetime as sent (no timezone conversion). */
export const formatApiDatetimeAsIs = (value: unknown): string => {
	const raw = String(value || '').trim();
	if (!raw) return '';
	if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

	// Prefer wall-clock from the string itself (ignore Z / ±offset).
	const match = raw.match(
		/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
	);
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
		const monthLabel = months[Number(mo) - 1] || mo;
		return `${d} ${monthLabel} ${y}, ${hh}:${mi}`;
	}

	return raw;
};

export const formatMovementDate = (value: unknown): string => {
	const formatted = formatApiDatetimeAsIs(value);
	return formatted || '----';
};

export const movementQuantityLabel = (movement: any): string => {
	if (movement?.quantity == null || movement?.quantity === '') return '';
	const n = Number(movement.quantity);
	if (Number.isFinite(n)) return String(n);
	return String(movement.quantity);
};

export const movementRequestStatus = (movement: any): string => {
	const request = movement?.asset_request;
	if (request != null && typeof request === 'object') {
		return String(request.status || '').trim();
	}
	return '';
};

export const movementRequestStatusLabel = (movement: any): string => {
	const request = movement?.asset_request;
	if (request != null && typeof request === 'object') {
		return String(request.status_display || request.status || '').trim();
	}
	return '';
};

export const movementSiteLabel = (site: unknown): string => {
	if (site == null || site === '') return '';
	if (typeof site === 'object') {
		const record = site as Record<string, unknown>;
		return String(record.name || record.label || '').trim();
	}
	return '';
};
