import {
	datetimeLocalBrowserToUtcIso,
	datetimeLocalInZoneToUtcIso,
	formatUtcIsoInZone,
	resolveSiteTimezoneIana,
	utcIsoToDatetimeLocalInZone,
} from '../../../helpers/siteTimezoneDatetime';
import { formatSiteTimezone } from '../../Site/SiteDetails/SiteDetails';

const pad2 = (n: number) => String(n).padStart(2, '0');

/** `datetime-local` value: YYYY-MM-DDTHH:mm (browser-local fallback). */
export const isoToDatetimeLocalInput = (raw: string): string => {
	const s = String(raw ?? '').trim();
	if (!s) return '';
	const parsed = new Date(s);
	if (!Number.isNaN(parsed.getTime())) {
		return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}T${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`;
	}
	const match = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
	if (match) return `${match[1]}T${match[2]}`;
	return s.length >= 16 ? s.slice(0, 16) : '';
};

export const parseDatetimeLocalValue = (
	value: string,
): { date: string; time: string } | null => {
	const s = String(value ?? '').trim();
	if (!s) return null;
	const match = s.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2})(?::(\d{2}))?)?/);
	if (!match) return null;
	const [, date, hhmm, sec] = match;
	const time = hhmm ? `${hhmm}:${sec || '00'}` : '00:00:00';
	return { date, time };
};

export const formatBookingDatetimeDisplay = (
	raw?: string | null,
	timeZoneIana?: string | null,
): string => {
	if (raw == null || raw === '') return '';
	const s = String(raw).trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
	const zone = String(timeZoneIana || '').trim();
	if (zone) {
		const inZone = formatUtcIsoInZone(s, zone);
		if (inZone) return inZone;
	}
	return formatUtcIsoInZone(s) || s;
};

export const resolveAssetItemSiteTimezone = (
	assetItem: unknown,
): { iana: string; label: string } => {
	const site =
		assetItem != null &&
		typeof assetItem === 'object' &&
		(assetItem as { site?: unknown }).site != null &&
		typeof (assetItem as { site?: unknown }).site === 'object'
			? ((assetItem as { site: Record<string, unknown> }).site as Record<string, unknown>)
			: null;
	const iana = resolveSiteTimezoneIana(site);
	const label = formatSiteTimezone(site) || iana;
	return { iana, label };
};

export type AssetTypeOption = {
	label: string;
	value: number;
	is_consumable?: boolean;
	is_bookable?: boolean;
	user_selects_item?: boolean;
	is_self_requestable?: boolean;
};

export type AssetItemOption = {
	label: string;
	value: number;
	site_name?: string;
	/** Display label for UI */
	site_timezone?: string;
	/** IANA id used for UTC conversion (e.g. Asia/Dubai) */
	site_timezone_iana?: string;
};

export type AssetRequestItemForm = {
	asset_type: AssetTypeOption | null;
	asset_item: AssetItemOption | null;
	qty: string;
	start_date: string;
	end_date: string;
	item_description: string;
};

export const emptyAssetRequestItem = (): AssetRequestItemForm => ({
	asset_type: null,
	asset_item: null,
	qty: '',
	start_date: '',
	end_date: '',
	item_description: '',
});

export const toList = (data: unknown): any[] => {
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

export const mapAssetTypeToOption = (item: any): AssetTypeOption => ({
	label: String(item?.name || `Asset type ${item?.id}`),
	value: Number(item.id),
	is_consumable: Boolean(item?.is_consumable),
	is_bookable: Boolean(item?.is_bookable),
	user_selects_item: Boolean(item?.user_selects_item),
	is_self_requestable: Boolean(item?.is_self_requestable),
});

const resolveAssetItemSiteName = (item: any): string => {
	const site = item?.site;
	if (site != null && typeof site === 'object') {
		return String(site.name || site.site_name || '').trim();
	}
	return String(item?.site_name || '').trim();
};

const siteRecordFromAsset = (item: any): Record<string, unknown> | null =>
	item?.site != null && typeof item.site === 'object'
		? (item.site as Record<string, unknown>)
		: null;

export const mapAssetItemToOption = (item: any): AssetItemOption => {
	const name = String(item?.name || '').trim();
	const code = String(item?.asset_code || '').trim();
	const serial = String(item?.serial_number || '').trim();
	const label = [name, code, serial].filter(Boolean).join(' — ') || `Asset ${item?.id}`;
	const site = siteRecordFromAsset(item);
	const siteTimezoneIana = resolveSiteTimezoneIana(site);
	const siteTimezone = formatSiteTimezone(site) || siteTimezoneIana;
	const siteName = resolveAssetItemSiteName(item);

	return {
		label,
		value: Number(item.id),
		site_name: siteName || undefined,
		site_timezone: siteTimezone || undefined,
		site_timezone_iana: siteTimezoneIana || undefined,
	};
};

/**
 * Bookable items: datetime-local wall clock in site TZ → UTC ISO (`…Z`).
 * Falls back to browser-local → UTC when site TZ is missing.
 */
export const bookingDatetimesFromDates = (
	startValue: string,
	endValue: string,
	timeZoneIana?: string | null,
): { start_datetime: string; end_datetime: string } | null => {
	const zone = String(timeZoneIana || '').trim();
	const toUtc = (value: string): string | null =>
		zone
			? datetimeLocalInZoneToUtcIso(value, zone)
			: datetimeLocalBrowserToUtcIso(value);

	const start_datetime = toUtc(startValue);
	const end_datetime = toUtc(endValue);
	if (!start_datetime || !end_datetime) return null;
	return { start_datetime, end_datetime };
};

export const dateFromBookingField = (
	apiItem: any,
	kind: 'start' | 'end',
	timeZoneIana?: string | null,
): string => {
	const datetimeKey = kind === 'start' ? 'start_datetime' : 'end_datetime';
	const dateKey = kind === 'start' ? 'start_date' : 'end_date';
	const raw = apiItem?.[datetimeKey] ?? apiItem?.[dateKey];
	if (raw == null || raw === '') return '';
	const s = String(raw).trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
		return kind === 'start' ? `${s}T00:00` : `${s}T23:59`;
	}
	const zone = String(timeZoneIana || '').trim();
	if (zone) {
		const inZone = utcIsoToDatetimeLocalInZone(s, zone);
		if (inZone) return inZone;
	}
	return isoToDatetimeLocalInput(s);
};

export const buildAssetRequestItemPayload = (
	item: AssetRequestItemForm,
): Record<string, unknown> | null => {
	const type = item.asset_type;
	if (!type?.value) return null;

	const payload: Record<string, unknown> = {};

	if (type.user_selects_item) {
		if (!item.asset_item?.value) return null;
		payload.asset_item = item.asset_item.value;
	} else {
		payload.asset_type = type.value;
	}

	if (type.is_consumable) {
		if (item.qty === '' || item.qty == null) return null;
		payload.qty = String(item.qty);
	}

	if (type.is_bookable) {
		const booking = bookingDatetimesFromDates(
			item.start_date,
			item.end_date,
			item.asset_item?.site_timezone_iana,
		);
		if (!booking) return null;
		payload.start_datetime = booking.start_datetime;
		payload.end_datetime = booking.end_datetime;
		if (item.item_description?.trim()) {
			payload.description = item.item_description.trim();
		}
	}

	return payload;
};

export const buildAssetRequestItemsPayload = (
	items: AssetRequestItemForm[] | undefined,
): Record<string, unknown>[] =>
	(items || [])
		.map((item) => buildAssetRequestItemPayload(item))
		.filter((item): item is Record<string, unknown> => item != null);

export const validateAssetRequestItems = (
	items: AssetRequestItemForm[] | undefined,
): string | null => {
	if (!items?.length) return 'Add at least one asset item.';

	for (let i = 0; i < items.length; i += 1) {
		const item = items[i];
		const type = item.asset_type;
		const row = i + 1;

		if (!type?.value) return `Row ${row}: select an asset type.`;

		if (type.user_selects_item && !item.asset_item?.value) {
			return `Row ${row}: select an asset from inventory.`;
		}

		if (type.is_consumable && (item.qty === '' || item.qty == null)) {
			return `Row ${row}: enter quantity.`;
		}

		if (type.is_bookable) {
			if (!item.start_date || !item.end_date) {
				return `Row ${row}: enter booking start and end date & time.`;
			}
			const start = parseDatetimeLocalValue(item.start_date);
			const end = parseDatetimeLocalValue(item.end_date);
			if (start && end) {
				const startMs = new Date(`${start.date}T${start.time}`).getTime();
				const endMs = new Date(`${end.date}T${end.time}`).getTime();
				if (
					!Number.isNaN(startMs) &&
					!Number.isNaN(endMs) &&
					endMs < startMs
				) {
					return `Row ${row}: end must be after start.`;
				}
			}
		}
	}

	return null;
};

export const mapApiItemToForm = (
	apiItem: any,
	assetTypeOptions: AssetTypeOption[],
	assetItemOptionsByType: Record<number, AssetItemOption[]>,
): AssetRequestItemForm => {
	const typeId =
		apiItem?.asset_type?.id ??
		apiItem?.asset_type ??
		apiItem?.asset_item?.asset_type?.id ??
		apiItem?.asset_item?.asset_type;

	const typeFromList = assetTypeOptions.find((o) => Number(o.value) === Number(typeId));
	const assetType: AssetTypeOption | null =
		typeFromList ||
		(typeId != null
			? {
					label: String(apiItem?.asset_type?.name || `Asset type ${typeId}`),
					value: Number(typeId),
					is_consumable: Boolean(apiItem?.asset_type?.is_consumable),
					is_bookable: Boolean(apiItem?.asset_type?.is_bookable),
					user_selects_item: Boolean(apiItem?.asset_type?.user_selects_item),
				}
			: null);

	const itemId = apiItem?.asset_item?.id ?? apiItem?.asset_item;
	const itemOpts = typeId != null ? assetItemOptionsByType[Number(typeId)] || [] : [];
	const itemFromList = itemOpts.find((o) => Number(o.value) === Number(itemId));
	const assetItemFromApi =
		apiItem?.asset_item != null && typeof apiItem.asset_item === 'object'
			? mapAssetItemToOption(apiItem.asset_item)
			: null;
	const assetItem: AssetItemOption | null =
		itemFromList ||
		assetItemFromApi ||
		(itemId != null
			? {
					label: String(apiItem?.asset_item?.name || `Asset ${itemId}`),
					value: Number(itemId),
				}
			: null);

	const zone =
		assetItem?.site_timezone_iana ||
		resolveSiteTimezoneIana(siteRecordFromAsset(apiItem?.asset_item));

	return {
		asset_type: assetType,
		asset_item: assetType?.user_selects_item ? assetItem : null,
		qty: apiItem?.qty != null ? String(apiItem.qty) : '',
		start_date: dateFromBookingField(apiItem, 'start', zone),
		end_date: dateFromBookingField(apiItem, 'end', zone),
		item_description: apiItem?.description || '',
	};
};
