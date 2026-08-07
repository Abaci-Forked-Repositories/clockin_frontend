import React from 'react';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../components/bootstrap/Card';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
	<div className='col-md-6 py-2'>
		<div className='text-muted small mb-1' style={{ fontSize: '0.78rem' }}>
			{label}
		</div>
		<div className='fw-semibold' style={{ wordBreak: 'break-word' }}>
			{value != null && value !== '' ? value : '—'}
		</div>
	</div>
);

const resolveRelatedName = (value: unknown, fallback?: string): string => {
	if (value != null && typeof value === 'object') {
		const record = value as Record<string, unknown>;
		const pref = String(record.preferred_name || '').trim();
		if (pref) return pref;
		const full = [record.first_name, record.last_name].filter(Boolean).join(' ').trim();
		if (full) return full;
		return String(record.name || record.label || fallback || '');
	}
	if (value != null && value !== '') return String(value);
	return fallback || '';
};

const displayOrEmpty = (value: unknown): string | undefined => {
	const text = value != null ? String(value).trim() : '';
	return text || undefined;
};

type AssetItemDetailsProps = {
	asset: Record<string, unknown> | null;
};

const AssetItemDetails = ({ asset }: AssetItemDetailsProps) => {
	if (!asset) return null;

	const isConsumable = Boolean(
		typeof asset.asset_type === 'object'
			? (asset.asset_type as { is_consumable?: boolean })?.is_consumable
			: asset.is_consumable,
	);

	return (
		<Card stretch className='w-100 mb-0 shadow-sm'>
			<CardHeader borderSize={1}>
				<CardLabel icon='DevicesOther' iconColor='warning'>
					<CardTitle tag='div' className='h5 mb-0'>
						{String(asset?.name || 'Asset')}
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody className='pt-3'>
				<div className='row g-1'>
					<DetailRow label='Name' value={displayOrEmpty(asset?.name)} />
					<DetailRow
						label='Asset type'
						value={resolveRelatedName(asset?.asset_type, asset?.asset_type_name as string)}
					/>
					<DetailRow label='Asset code' value={displayOrEmpty(asset?.asset_code)} />
					<DetailRow label='Serial number' value={displayOrEmpty(asset?.serial_number)} />
					<DetailRow label='Brand' value={displayOrEmpty(asset?.brand)} />
					<DetailRow label='Model' value={displayOrEmpty(asset?.model)} />
					<DetailRow
						label='Site'
						value={resolveRelatedName(asset?.site, asset?.site_name as string)}
					/>
					<DetailRow
						label='Status'
						value={
							asset?.status ? (
								<StatusBadge
									status={String(asset.status)}
									label={
										asset.status_display != null
											? String(asset.status_display)
											: undefined
									}
									emptyFallback='—'
								/>
							) : undefined
						}
					/>
					<DetailRow
						label='Assigned to'
						value={resolveRelatedName(asset?.assigned_to)}
					/>
					{typeof asset.asset_type === 'object' &&
					(asset.asset_type as { is_bookable?: boolean })?.is_bookable != null ? (
						<DetailRow
							label='Bookable'
							value={
								<StatusBadge
									status={
										(asset.asset_type as { is_bookable?: boolean }).is_bookable
											? 'yes'
											: 'no'
									}
									emptyFallback='—'
								/>
							}
						/>
					) : null}
					{isConsumable ? (
						<DetailRow
							label='Quantity'
							value={
								asset?.quantity != null && asset?.quantity !== ''
									? String(asset.quantity)
									: undefined
							}
						/>
					) : null}
				</div>
			</CardBody>
		</Card>
	);
};

export default AssetItemDetails;
