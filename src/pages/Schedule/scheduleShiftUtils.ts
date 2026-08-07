export const formatShiftTime = (raw?: string): string => {
	if (!raw) return '';
	const [h, m] = String(raw).split(':');
	if (h == null || h === '') return '';
	return `${String(h).padStart(2, '0')}:${String(m ?? '00').padStart(2, '0')}`;
};

type ShiftTimeEntry = { start_time?: string; end_time?: string };

const isShiftTimeEntry = (value: unknown): value is ShiftTimeEntry =>
	value != null &&
	typeof value === 'object' &&
	!Array.isArray(value) &&
	('start_time' in value || 'end_time' in value);

const resolveShiftsMap = (raw: unknown): Record<string, ShiftTimeEntry> | null => {
	if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
	const record = raw as Record<string, unknown>;

	if (record.shifts != null && typeof record.shifts === 'object' && !Array.isArray(record.shifts)) {
		const inner = record.shifts as Record<string, unknown>;
		if (Object.values(inner).some(isShiftTimeEntry)) {
			return inner as Record<string, ShiftTimeEntry>;
		}
	}

	if (Object.values(record).some(isShiftTimeEntry)) {
		return record as Record<string, ShiftTimeEntry>;
	}

	return null;
};

/** e.g. `{ "Day Shift": { start_time, end_time } }` → `["Day Shift"]` */
export const shiftNamesFromShiftsField = (raw: unknown): string[] => {
	const map = resolveShiftsMap(raw);
	if (!map) return [];
	return Object.keys(map)
		.map((name) => String(name || '').trim())
		.filter(Boolean);
};

/** e.g. `{ "Day Shift": { start_time, end_time } }` → `["Day Shift 09:00–18:00"]` */
export const shiftLabelsFromShiftsField = (raw: unknown): string[] => {
	const map = resolveShiftsMap(raw);
	if (!map) return [];

	return Object.entries(map)
		.map(([name, times]) => {
			const label = String(name || '').trim();
			if (!label) return null;
			const start = formatShiftTime(times?.start_time);
			const end = formatShiftTime(times?.end_time);
			if (start && end) return `${label} ${start}–${end}`;
			if (start) return `${label} ${start}`;
			if (end) return `${label} ${end}`;
			return label;
		})
		.filter((line): line is string => Boolean(line));
};

/** Max shift names shown in a month-calendar day cell. */
export const CALENDAR_CELL_MAX_SHIFT_NAMES = 3;

export const summarizeShiftLabels = (
	labels: string[],
	maxShown = CALENDAR_CELL_MAX_SHIFT_NAMES,
): string => {
	if (!labels.length) return '';
	const shown = labels.slice(0, maxShown);
	const body = shown.join('\n');
	if (labels.length > maxShown) {
		return body ? `${body}\n+${labels.length - maxShown} more` : `+${labels.length - maxShown} more`;
	}
	return body;
};

export const shiftsArrayFromShiftsField = (
	raw: unknown,
): { name: string; shift_name: string; start_time?: string; end_time?: string }[] => {
	const map = resolveShiftsMap(raw);
	if (!map) return [];
	return Object.entries(map).map(([name, times]) => ({
		name,
		shift_name: name,
		start_time: times?.start_time,
		end_time: times?.end_time,
	}));
};
