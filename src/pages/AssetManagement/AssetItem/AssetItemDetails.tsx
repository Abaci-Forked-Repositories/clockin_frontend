import React from 'react';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../components/bootstrap/Card';
import Icon from '../../../components/icon/Icon';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';

const DetailRow = ({
	label,
	value,
	span,
}: {
	label: string;
	value?: React.ReactNode;
	span?: 2;
}) => {
	const hasValue = value != null && value !== '';
	return (
		<div
			className={`asset-detail-card__field${
				span === 2 ? ' asset-detail-card__field--span-2' : ''
			}`}>
			<div className='asset-detail-card__label'>{label}</div>
			<div className='asset-detail-card__value'>{hasValue ? value : '—'}</div>
		</div>
	);
};

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

	const assetTypeName = resolveRelatedName(asset?.asset_type, asset?.asset_type_name as string);
	const siteName = resolveRelatedName(asset?.site, asset?.site_name as string);
	const assetCode = displayOrEmpty(asset?.asset_code);

	return (
		<Card stretch className='w-100 mb-0 asset-detail-card'>
			<CardHeader className='asset-detail-card__header'>
				<CardLabel icon='DevicesOther' iconColor='warning'>
					<CardTitle tag='div' className='h5 text-warning mb-0'>
						Asset details
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody className='asset-detail-card__body pt-0'>
				<div className='asset-detail-card__hero'>
					<span className='asset-detail-card__hero-icon' aria-hidden>
						<Icon icon='DevicesOther' size='lg' color='warning' />
					</span>
					<div className='asset-detail-card__hero-text'>
						<div className='asset-detail-card__name'>
							{displayOrEmpty(asset?.name) || '—'}
						</div>
						<div className='asset-detail-card__subtitle'>
							{[assetTypeName, assetCode].filter(Boolean).join(' · ') || '—'}
						</div>
						{asset?.status ? (
							<span className='asset-detail-card__status'>
								<StatusBadge
									status={String(asset.status)}
									label={
										asset.status_display != null
											? String(asset.status_display)
											: undefined
									}
									emptyFallback='—'
								/>
							</span>
						) : null}
					</div>
				</div>

				<div className='asset-detail-card__fields'>
					<DetailRow label='Asset type' value={assetTypeName} />
					<DetailRow label='Asset code' value={assetCode} />
					<DetailRow label='Serial number' value={displayOrEmpty(asset?.serial_number)} />
					<DetailRow label='Brand' value={displayOrEmpty(asset?.brand)} />
					<DetailRow label='Model' value={displayOrEmpty(asset?.model)} />
					<DetailRow label='Site' value={siteName} />
					<DetailRow label='Assigned to' value={resolveRelatedName(asset?.assigned_to)} />
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
