import React from 'react';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';
import {
	formatMovementDate,
	movementQuantityLabel,
	movementRequestStatus,
	movementRequestStatusLabel,
	movementSiteLabel,
	movementTypeLabel,
	movementTypeStatus,
	resolvePersonName,
} from './assetMovementUtils';

type MovementCardTheme = {
	textPrimary: string;
	textMuted: string;
	textSubtle: string;
	cardBg: string;
	border: string;
};

type AssetMovementCardProps = {
	movement: any;
	theme: MovementCardTheme;
};

const labelStyle = (muted: string) => ({
	fontSize: '0.7rem',
	fontWeight: 600,
	letterSpacing: '0.06em',
	textTransform: 'uppercase' as const,
	color: muted,
	marginBottom: 4,
});

const AssetMovementCard = ({ movement, theme }: AssetMovementCardProps) => {
	const { textPrimary, textMuted, textSubtle, cardBg, border } = theme;
	const fromUser = resolvePersonName(movement?.from_user);
	const toUser = resolvePersonName(movement?.to_user);
	const performedBy = resolvePersonName(movement?.performed_by);
	const quantity = movementQuantityLabel(movement);
	const remarks = String(movement?.remarks || '').trim();
	const requestStatus = movementRequestStatus(movement);
	const requestStatusLabel = movementRequestStatusLabel(movement);
	const fromSite = movementSiteLabel(movement?.from_site);
	const toSite = movementSiteLabel(movement?.to_site);
	const typeStatus = movementTypeStatus(movement);

	const headline =
		toUser ||
		(String(movement?.movement_type || '').toUpperCase() === 'RETURNED'
			? fromUser || 'Returned'
			: '----');

	return (
		<div
			className='rounded-3 p-3'
			style={{
				backgroundColor: cardBg,
				border: `1px solid ${border}`,
			}}>
			<div className='d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3'>
				<div>
					<div style={{ color: textPrimary, fontWeight: 700, fontSize: '0.95rem' }}>
						{headline}
					</div>
					{fromUser && toUser ? (
						<div className='small mt-1' style={{ color: textMuted }}>
							From: {fromUser}
						</div>
					) : null}
				</div>
				{typeStatus ? (
					<StatusBadge
						status={typeStatus}
						label={movementTypeLabel(movement)}
						emptyFallback='----'
					/>
				) : (
					<span className='text-muted'>{movementTypeLabel(movement)}</span>
				)}
			</div>

			<div className='row g-3'>
				<div className='col-6 col-md-3'>
					<div style={labelStyle(textSubtle)}>Date</div>
					<div style={{ color: textPrimary, fontWeight: 600 }}>
						{formatMovementDate(movement?.movement_date || movement?.created_at)}
					</div>
				</div>
				<div className='col-6 col-md-3'>
					<div style={labelStyle(textSubtle)}>From</div>
					<div style={{ color: textPrimary, fontWeight: 600 }}>{fromUser || '—'}</div>
				</div>
				<div className='col-6 col-md-3'>
					<div style={labelStyle(textSubtle)}>To</div>
					<div style={{ color: textPrimary, fontWeight: 600 }}>{toUser || '—'}</div>
				</div>
				{performedBy ? (
					<div className='col-6 col-md-3'>
						<div style={labelStyle(textSubtle)}>Performed by</div>
						<div style={{ color: textPrimary, fontWeight: 600 }}>{performedBy}</div>
					</div>
				) : null}
				{quantity ? (
					<div className='col-6 col-md-3'>
						<div style={labelStyle(textSubtle)}>Qty</div>
						<div style={{ color: textPrimary, fontWeight: 600 }}>{quantity}</div>
					</div>
				) : null}
				{fromSite ? (
					<div className='col-6 col-md-3'>
						<div style={labelStyle(textSubtle)}>From site</div>
						<div style={{ color: textPrimary, fontWeight: 600 }}>{fromSite}</div>
					</div>
				) : null}
				{toSite ? (
					<div className='col-6 col-md-3'>
						<div style={labelStyle(textSubtle)}>To site</div>
						<div style={{ color: textPrimary, fontWeight: 600 }}>{toSite}</div>
					</div>
				) : null}
				{requestStatus ? (
					<div className='col-6 col-md-3'>
						<div style={labelStyle(textSubtle)}>Asset request</div>
						<div>
							<StatusBadge
								status={requestStatus}
								label={requestStatusLabel || undefined}
								emptyFallback='—'
							/>
						</div>
					</div>
				) : null}
			</div>

			{remarks ? (
				<div className='mt-3'>
					<div style={labelStyle(textSubtle)}>Remarks</div>
					<div style={{ color: textMuted, fontSize: '0.9rem' }}>{remarks}</div>
				</div>
			) : null}
		</div>
	);
};

export default AssetMovementCard;
