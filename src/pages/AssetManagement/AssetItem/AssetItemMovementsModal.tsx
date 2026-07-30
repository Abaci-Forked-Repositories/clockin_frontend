import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import Modal, { ModalBody, ModalHeader, ModalTitle } from '../../../components/bootstrap/Modal';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';
import { authAxios } from '../../../axiosInstance';
import useDarkMode from '../../../hooks/useDarkMode';
import useToasterNotification from '../../../hooks/useToasterNotification';

export type AssetItemMovementsContext = {
	assetId?: number | string;
	assetName?: string;
	assetCode?: string;
};

type AssetItemMovementsModalProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	context: AssetItemMovementsContext | null;
};

const labelStyle = (muted: string) => ({
	fontSize: '0.7rem',
	fontWeight: 600,
	letterSpacing: '0.06em',
	textTransform: 'uppercase' as const,
	color: muted,
	marginBottom: 4,
});

const toList = (data: unknown): any[] => {
	if (Array.isArray(data)) return data;
	if (data != null && typeof data === 'object' && Array.isArray((data as { results?: unknown[] }).results)) {
		return (data as { results: unknown[] }).results;
	}
	return [];
};

const resolvePersonName = (value: unknown): string => {
	if (value == null || value === '') return '';
	if (typeof value === 'string') return value.trim();
	if (typeof value === 'number') return `User #${value}`;
	if (typeof value === 'object') {
		const record = value as Record<string, unknown>;
		const name = String(record.name || '').trim();
		if (name) return name;
		const full = [record.first_name, record.last_name].filter(Boolean).join(' ').trim();
		if (full) return full;
		if (record.id != null) return `User #${record.id}`;
	}
	return '';
};

const movementTypeLabel = (movement: any): string =>
	String(movement?.movement_type_display || movement?.movement_type || '').trim() || '----';

const formatMovementDate = (value: unknown): string => {
	const raw = String(value || '').trim();
	if (!raw) return '----';
	const parsed = dayjs(raw);
	return parsed.isValid() ? parsed.format('DD MMM YYYY, HH:mm') : raw.slice(0, 16);
};

const AssetItemMovementsModal = ({
	isOpen,
	setIsOpen,
	context,
}: AssetItemMovementsModalProps) => {
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;

	const [movements, setMovements] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const assetId = context?.assetId;
	const modalTitle =
		context?.assetName?.trim() ||
		context?.assetCode?.trim() ||
		(assetId != null ? `Asset #${assetId}` : 'Asset assignment');

	const textPrimary = darkModeStatus ? '#f8f9fa' : '#111827';
	const textMuted = darkModeStatus ? '#9ca3af' : '#6b7280';
	const textSubtle = darkModeStatus ? '#6b7280' : '#9ca3af';
	const cardBg = darkModeStatus ? 'rgba(255,255,255,0.04)' : '#ffffff';
	const border = darkModeStatus ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

	useEffect(() => {
		if (!isOpen || assetId == null) {
			setMovements([]);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);

		authAxios
			.get('/api/hr/asset-movements/', { params: { asset: assetId, paginate: 'off' } })
			.then((res) => {
				if (cancelled) return;
				const rows = toList(res?.data);
				const sorted = [...rows].sort((a, b) =>
					String(b?.movement_date || b?.created_at || '').localeCompare(
						String(a?.movement_date || a?.created_at || ''),
					),
				);
				setMovements(sorted);
			})
			.catch((err) => {
				if (!cancelled) {
					setMovements([]);
					showErrorRef.current(err);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen, assetId]);

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			isAnimation={false}
			isCentered
			isScrollable
			size='lg'
			titleId='asset-item-movements'>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='asset-item-movements'>{modalTitle}</ModalTitle>
			</ModalHeader>
			<ModalBody className='pt-3 pb-5 px-4 px-md-5'>
				{loading ? (
					<div className='d-flex justify-content-center py-5'>
						<CustomSpinner />
					</div>
				) : movements.length === 0 ? (
					<p className='mb-0 text-center py-5' style={{ color: textMuted, fontSize: '0.9rem' }}>
						No assignment history found for this asset.
					</p>
				) : (
					<div className='d-flex flex-column' style={{ gap: 16 }}>
						{movements.map((movement, index) => {
							const toUser = resolvePersonName(movement?.to_user);
							const fromUser = resolvePersonName(movement?.from_user);
							const performedBy = resolvePersonName(movement?.performed_by);

							return (
								<div
									key={movement?.id ?? `movement-${index}`}
									className='rounded-3 p-3'
									style={{
										backgroundColor: cardBg,
										border: `1px solid ${border}`,
									}}>
									<div className='d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3'>
										<div>
											<div
												style={{
													color: textPrimary,
													fontWeight: 700,
													fontSize: '0.95rem',
												}}>
												{toUser || '----'}
											</div>
											{fromUser ? (
												<div className='small mt-1' style={{ color: textMuted }}>
													From: {fromUser}
												</div>
											) : null}
										</div>
										<StatusBadge
											status={movement?.movement_type}
											label={movementTypeLabel(movement)}
											emptyFallback='----'
										/>
									</div>

									<div className='row g-3'>
										<div className='col-6 col-md-3'>
											<div style={labelStyle(textSubtle)}>Date</div>
											<div style={{ color: textPrimary, fontWeight: 600 }}>
												{formatMovementDate(movement?.movement_date)}
											</div>
										</div>
										{performedBy ? (
											<div className='col-6 col-md-3'>
												<div style={labelStyle(textSubtle)}>Performed by</div>
												<div style={{ color: textPrimary, fontWeight: 600 }}>
													{performedBy}
												</div>
											</div>
										) : null}
										{movement?.quantity != null && movement?.quantity !== '' ? (
											<div className='col-6 col-md-3'>
												<div style={labelStyle(textSubtle)}>Qty</div>
												<div style={{ color: textPrimary, fontWeight: 600 }}>
													{String(movement.quantity)}
												</div>
											</div>
										) : null}
									</div>

									{movement?.remarks ? (
										<div className='mt-3'>
											<div style={labelStyle(textSubtle)}>Remarks</div>
											<div style={{ color: textMuted, fontSize: '0.9rem' }}>
												{String(movement.remarks)}
											</div>
										</div>
									) : null}
								</div>
							);
						})}
					</div>
				)}
			</ModalBody>
		</Modal>
	);
};

AssetItemMovementsModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	context: PropTypes.object,
};

AssetItemMovementsModal.defaultProps = {
	context: null,
};

export default AssetItemMovementsModal;
