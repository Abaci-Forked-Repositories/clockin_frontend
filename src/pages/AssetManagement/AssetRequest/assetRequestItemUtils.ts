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
	if (data != null && typeof data === 'object' && Array.isArray((data as { results?: unknown[] }).results)) {
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

export const mapAssetItemToOption = (item: any): AssetItemOption => {
	const name = String(item?.name || '').trim();
	const code = String(item?.asset_code || '').trim();
	const serial = String(item?.serial_number || '').trim();
	const label = [name, code, serial].filter(Boolean).join(' — ') || `Asset ${item?.id}`;
	return {
		label,
		value: Number(item.id),
	};
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
		if (!item.start_date || !item.end_date) return null;
		payload.start_date = item.start_date;
		payload.end_date = item.end_date;
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

		if (type.is_bookable && (!item.start_date || !item.end_date)) {
			return `Row ${row}: enter booking start and end dates.`;
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
	const assetItem: AssetItemOption | null =
		itemFromList ||
		(itemId != null
			? {
					label: String(apiItem?.asset_item?.name || `Asset ${itemId}`),
					value: Number(itemId),
				}
			: null);

	return {
		asset_type: assetType,
		asset_item: assetType?.user_selects_item ? assetItem : null,
		qty: apiItem?.qty != null ? String(apiItem.qty) : '',
		start_date: apiItem?.start_date ? String(apiItem.start_date).slice(0, 10) : '',
		end_date: apiItem?.end_date ? String(apiItem.end_date).slice(0, 10) : '',
		item_description: apiItem?.description || '',
	};
};
