export type HrExportFormat = 'csv' | 'xlsx';

export type HrExportOptions = {
	exportFormat: HrExportFormat;
	fromDate: string;
	toDate: string;
	userId?: string | number | null;
	groupId?: string | number | null;
};

const PAGINATION_KEYS = new Set(['limit', 'offset']);
const OVERRIDABLE_FILTER_KEYS = new Set(['user', 'group', 'export_format', 'from_date', 'to_date']);

export const ATTENDANCE_EVENTS_EXPORT_PATH = '/api/hr/attendance-events/export/';
export const ATTENDANCE_EXPORT_PATH = '/api/hr/attendance/export/';
export const ATTENDANCE_CONSOLIDATED_EXPORT_PATH = '/api/hr/attendance/consolidated-report/';

/** Build export URL from a list query URL, preserving search, ordering, and filters. */
export function buildHrListExportUrl(
	listUrl: string | undefined,
	exportPath: string,
	{ exportFormat, fromDate, toDate, userId, groupId }: HrExportOptions,
): string {
	const params = new URLSearchParams();

	if (listUrl) {
		const queryStart = listUrl.indexOf('?');
		if (queryStart !== -1) {
			const existing = new URLSearchParams(listUrl.slice(queryStart + 1));
			existing.forEach((value, key) => {
				if (!PAGINATION_KEYS.has(key) && !OVERRIDABLE_FILTER_KEYS.has(key)) {
					params.append(key, value);
				}
			});
		}
	}

	params.set('export_format', exportFormat);
	params.set('from_date', fromDate);
	params.set('to_date', toDate);

	if (userId != null && String(userId).trim() !== '') {
		params.set('user', String(userId));
	}
	if (groupId != null && String(groupId).trim() !== '') {
		params.set('group', String(groupId));
	}

	return `${exportPath}?${params.toString()}`;
}

export const hrExportFileName = (name: string, format: HrExportFormat): string =>
	`${name}.${format}`;

export const buildAttendanceEventsExportUrl = (
	listUrl: string | undefined,
	options: HrExportOptions,
): string => buildHrListExportUrl(listUrl, ATTENDANCE_EVENTS_EXPORT_PATH, options);

export const buildAttendanceExportUrl = (
	listUrl: string | undefined,
	options: HrExportOptions,
): string => buildHrListExportUrl(listUrl, ATTENDANCE_EXPORT_PATH, options);

export const buildAttendanceConsolidatedExportUrl = (
	listUrl: string | undefined,
	options: HrExportOptions,
): string => buildHrListExportUrl(listUrl, ATTENDANCE_CONSOLIDATED_EXPORT_PATH, options);
