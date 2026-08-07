export const ASSET_REQUEST_STATUS_LOOKUP: Record<string, string> = {
	PENDING: 'Pending',
	APPLIED: 'Applied',
	APPROVED: 'Approved',
	PARTIAL: 'Partial',
	COMPLETED: 'Completed',
	REJECTED: 'Rejected',
	CANCELLED: 'Cancelled',
};

export type AssetRequestAction = 'approve' | 'reject' | 'cancel' | 'return';

export const assetRequestActionUrl = (
	id: number | string,
	action: AssetRequestAction,
): string => `/api/hr/asset-requests/${id}/${action}/`;

export const assetRequestItemActionUrl = (
	requestId: number | string,
	itemId: number | string,
	action: AssetRequestAction,
): string => `/api/hr/asset-requests/${requestId}/items/${itemId}/${action}/`;

export const assetRequestDetailUrl = (id: number | string): string =>
	`/api/hr/asset-requests/${id}/`;

export type AssetRequestItemActions = {
	can_approve?: boolean;
	can_reject?: boolean;
	can_cancel?: boolean;
	can_assign_item?: boolean;
	can_return?: boolean;
};

export type AssetRequestDetailItem = {
	id?: number | string;
	asset_item?: any;
	asset_type?: any;
	qty?: string | number | null;
	quantity_requested?: string | number | null;
	start_date?: string | null;
	end_date?: string | null;
	start_datetime?: string | null;
	end_datetime?: string | null;
	status?: string;
	status_display?: string;
	reviewed_by?: any;
	review_remarks?: string | null;
	reviewed_at?: string | null;
	cancel_reason?: string | null;
	approval_steps?: any[];
	current_approval_level?: number | null;
	actions?: AssetRequestItemActions;
	description?: string | null;
};

export const resolveAssetRequestItems = (detail: any): AssetRequestDetailItem[] => {
	if (Array.isArray(detail?.items)) return detail.items;
	if (Array.isArray(detail?.request_items)) return detail.request_items;
	return [];
};

export const assetRequestItemLabel = (item: AssetRequestDetailItem): string => {
	const assetItemName =
		typeof item?.asset_item === 'object' && item.asset_item != null
			? String(item.asset_item.name || item.asset_item.asset_code || '').trim()
			: '';
	const assetTypeName =
		typeof item?.asset_type === 'object' && item.asset_type != null
			? String(item.asset_type.name || '').trim()
			: '';
	return assetItemName || assetTypeName || `Item ${item?.id ?? ''}`;
};

export const assetRequestCommandsUrl = (id: number | string): string =>
	`/api/hr/asset-requests/${id}/commands/`;

export type AssetRequestCommand = {
	id?: number | string;
	command?: string;
	response_text?: string;
	command_by?: unknown;
	command_datetime?: string;
	created_at?: string;
};

export const normalizeAssetRequestCommands = (raw: unknown): AssetRequestCommand[] => {
	const source =
		raw != null &&
		typeof raw === 'object' &&
		!Array.isArray(raw) &&
		Array.isArray((raw as { commands?: unknown[] }).commands)
			? (raw as { commands: unknown[] }).commands
			: raw;
	const list = Array.isArray(source) ? source : (source as { results?: unknown[] })?.results || [];
	return [...list]
		.filter((item) => item != null)
		.sort((a, b) => {
			const aTime = String(
				(a as AssetRequestCommand).command_datetime ||
					(a as AssetRequestCommand).created_at ||
					'',
			);
			const bTime = String(
				(b as AssetRequestCommand).command_datetime ||
					(b as AssetRequestCommand).created_at ||
					'',
			);
			return aTime.localeCompare(bTime);
		}) as AssetRequestCommand[];
};

export const assetRequestCommandText = (cmd: AssetRequestCommand): string =>
	String(cmd.command || cmd.response_text || '').trim();

export const formatAssetRequestCommandAuthor = (commandBy: unknown): string | null => {
	if (commandBy == null || commandBy === '') return null;
	if (typeof commandBy === 'string') {
		const value = commandBy.trim();
		return value || null;
	}
	if (typeof commandBy === 'number' && !Number.isNaN(commandBy)) {
		return `User #${commandBy}`;
	}
	if (typeof commandBy === 'object') {
		const record = commandBy as Record<string, unknown>;
		const displayName = String(record.name || '').trim();
		if (displayName) return displayName;
		const first = String(record.first_name || '').trim();
		const last = String(record.last_name || '').trim();
		const full = [first, last].filter(Boolean).join(' ');
		if (full) return full;
		const email = String(record.email || '').trim();
		if (email) return email;
		if (record.id != null && record.id !== '') return `User #${record.id}`;
	}
	return null;
};

export const assetRequestRowStatus = (row: any): string | undefined =>
	row?.status ?? row?.approval_status ?? row?.state ?? row?.meta_data?.status ?? undefined;

export const assetRequestStatusCode = (row: any): string => {
	const code = String(row?.status_code ?? '')
		.trim()
		.toUpperCase();
	if (code) return code;
	return String(row?.status ?? '')
		.trim()
		.toUpperCase();
};

export const isEditableAssetRequestStatus = (
	status: string | undefined | null,
	statusCode?: string | null,
): boolean => {
	const code = String(statusCode ?? '')
		.trim()
		.toUpperCase();
	if (code === 'APPLIED' || code === 'PENDING') return true;

	const key = String(status ?? '')
		.trim()
		.toUpperCase();
	return key === 'APPLIED' || key === 'PENDING' || key.startsWith('PENDING');
};
