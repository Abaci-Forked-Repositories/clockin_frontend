import React, { useEffect, useRef, useState } from 'react';
import Modal, { ModalBody, ModalHeader, ModalTitle } from '../../../components/bootstrap/Modal';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';
import { authAxios } from '../../../axiosInstance';
import useDarkMode from '../../../hooks/useDarkMode';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AssetRequestActionButtons from './AssetRequestActionButtons';
import AssetRequestAssignItemControl from './AssetRequestAssignItemControl';
import {
	assetRequestDetailUrl,
	assetRequestItemLabel,
	resolveAssetRequestItems,
	type AssetRequestDetailItem,
} from './assetRequestUtils';

export type AssetRequestItemsModalContext = {
	assetRequestId?: number | string;
	employeeName?: string;
	description?: string;
	overallStatus?: string;
};

type AssetRequestItemsModalProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	context: AssetRequestItemsModalContext | null;
	tableRef?: React.MutableRefObject<any> | null;
	/** When false (e.g. Self mode), hide assign / approve / reject / cancel / return. */
	showItemActions?: boolean;
};

const labelStyle = (muted: string) => ({
	fontSize: '0.7rem',
	fontWeight: 600,
	letterSpacing: '0.06em',
	textTransform: 'uppercase' as const,
	color: muted,
	marginBottom: 4,
});

const AssetRequestItemsModal = ({
	isOpen,
	setIsOpen,
	context,
	tableRef = null,
	showItemActions = true,
}: AssetRequestItemsModalProps) => {
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;

	const [items, setItems] = useState<AssetRequestDetailItem[]>([]);
	const [detail, setDetail] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);

	const requestId = context?.assetRequestId;

	useEffect(() => {
		if (!isOpen || requestId == null) {
			setItems([]);
			setDetail(null);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);

		authAxios
			.get(assetRequestDetailUrl(requestId))
			.then((res) => {
				if (cancelled) return;
				const data = res?.data ?? {};
				setDetail(data);
				setItems(resolveAssetRequestItems(data));
			})
			.catch((err) => {
				if (!cancelled) {
					setDetail(null);
					setItems([]);
					showErrorRef.current(err);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [isOpen, requestId, reloadKey]);

	const textPrimary = darkModeStatus ? '#f8f9fa' : '#111827';
	const textMuted = darkModeStatus ? '#9ca3af' : '#6b7280';
	const textSubtle = darkModeStatus ? '#6b7280' : '#9ca3af';
	const surface = darkModeStatus ? 'rgba(255,255,255,0.06)' : '#f3f4f6';
	const cardBg = darkModeStatus ? 'rgba(255,255,255,0.04)' : '#ffffff';
	const border = darkModeStatus ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

	const modalTitle = context?.employeeName?.trim() || 'Asset request';
	const overallStatusCode = String(
		detail?.status || detail?.status_code || context?.overallStatus || '',
	).trim();
	const overallStatusLabel = String(
		detail?.status_display || overallStatusCode || '',
	).trim();
	const description = detail?.description || context?.description || '';

	const refreshAfterAction = () => {
		setReloadKey((prev) => prev + 1);
		tableRef?.current?.onQueryChange?.();
	};

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			isStaticBackdrop
			isAnimation={false}
			isCentered
			isScrollable
			size='lg'
			titleId='asset-request-items'>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='asset-request-items'>{modalTitle}</ModalTitle>
			</ModalHeader>
			<ModalBody className='pt-3 pb-5 px-4 px-md-5'>
				{(description || overallStatusCode) && (
					<div
						className='rounded-3 p-4 mb-4'
						style={{
							backgroundColor: surface,
							border: `1px solid ${border}`,
						}}>
						<div className='row g-4 align-items-start'>
							{description ? (
								<div className='col'>
									<div style={labelStyle(textSubtle)}>Description</div>
									<div style={{ color: textPrimary, fontSize: '1rem', fontWeight: 600 }}>
										{description}
									</div>
								</div>
							) : null}
							{overallStatusCode ? (
								<div
									className={description ? 'col-auto ms-auto text-end' : 'col-12 text-end'}>
									<div style={labelStyle(textSubtle)}>Request status</div>
									<div className='d-flex justify-content-end'>
										<StatusBadge
											status={overallStatusCode}
											label={overallStatusLabel}
											emptyFallback='----'
										/>
									</div>
								</div>
							) : null}
						</div>
					</div>
				)}

				{loading && items.length === 0 ? (
					<div className='d-flex justify-content-center py-5'>
						<CustomSpinner />
					</div>
				) : items.length === 0 ? (
					<p className='mb-0 text-center py-5' style={{ color: textMuted, fontSize: '0.9rem' }}>
						No requested items found.
					</p>
				) : (
					<div className='d-flex flex-column position-relative' style={{ gap: 16 }}>
						{loading ? (
							<div
								className='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-3'
								style={{
									backgroundColor: darkModeStatus
										? 'rgba(0,0,0,0.35)'
										: 'rgba(255,255,255,0.7)',
									zIndex: 2,
								}}>
								<CustomSpinner />
							</div>
						) : null}
						<div style={labelStyle(textSubtle)}>Requested items</div>
						{items.map((item, index) => {
							const qty = item?.qty ?? item?.quantity_requested;
							const assetTypeName =
								typeof item?.asset_type === 'object' && item.asset_type != null
									? String(item.asset_type.name || '')
									: '';
							const assetItemName =
								typeof item?.asset_item === 'object' && item.asset_item != null
									? String(
											item.asset_item.name ||
												item.asset_item.asset_code ||
												'',
										)
									: '';

							return (
								<div
									key={item?.id ?? `item-${index}`}
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
												{assetRequestItemLabel(item)}
											</div>
											{assetItemName && assetTypeName ? (
												<div className='small mt-1' style={{ color: textMuted }}>
													Type: {assetTypeName}
												</div>
											) : null}
										</div>
										<StatusBadge
											status={item?.status}
											label={item?.status_display || item?.status}
											emptyFallback='----'
										/>
									</div>

									{(qty != null && qty !== '') ||
									item?.start_date ||
									item?.end_date ? (
										<div className='row g-3 mb-3'>
											{qty != null && qty !== '' ? (
												<div className='col-6 col-md-3'>
													<div style={labelStyle(textSubtle)}>Qty</div>
													<div style={{ color: textPrimary, fontWeight: 600 }}>
														{String(qty)}
													</div>
												</div>
											) : null}
											{item?.start_date ? (
												<div className='col-6 col-md-3'>
													<div style={labelStyle(textSubtle)}>Start</div>
													<div style={{ color: textPrimary, fontWeight: 600 }}>
														{String(item.start_date).slice(0, 10)}
													</div>
												</div>
											) : null}
											{item?.end_date ? (
												<div className='col-6 col-md-3'>
													<div style={labelStyle(textSubtle)}>End</div>
													<div style={{ color: textPrimary, fontWeight: 600 }}>
														{String(item.end_date).slice(0, 10)}
													</div>
												</div>
											) : null}
										</div>
									) : null}

									{(() => {
										if (!showItemActions) return null;

										const actions = item?.actions;
										const canAssignItem = Boolean(actions?.can_assign_item);
										const canApprove =
											Boolean(actions?.can_approve) && !canAssignItem;
										const canReject = Boolean(actions?.can_reject);
										const canCancel = Boolean(actions?.can_cancel);
										const itemStatus = String(item?.status || '')
											.trim()
											.toUpperCase();
										const assetItemStatus = String(
											(typeof item?.asset_item === 'object' &&
												item.asset_item != null
												? item.asset_item.status
												: '') || '',
										)
											.trim()
											.toUpperCase();
										const hasAssetItem =
											(typeof item?.asset_item === 'object' &&
												item.asset_item != null &&
												item.asset_item.id != null) ||
											(item?.asset_item != null && item?.asset_item !== '');
										const isConsumable = Boolean(
											typeof item?.asset_type === 'object' &&
											item.asset_type != null
												? item.asset_type.is_consumable
												: false,
										);
										const canReturn =
											!isConsumable &&
											hasAssetItem &&
											(itemStatus === 'ASSIGNED' ||
												itemStatus === 'APPROVED' ||
												assetItemStatus === 'ASSIGNED');
										const hasActions =
											canApprove ||
											canReject ||
											canCancel ||
											canAssignItem ||
											canReturn;
										if (!hasActions || requestId == null || item?.id == null) {
											return null;
										}

										const assetTypeId =
											typeof item?.asset_type === 'object' &&
											item.asset_type != null
												? item.asset_type.id
												: item?.asset_type;

										return (
											<div className='d-flex flex-column gap-3'>
												{canAssignItem ? (
													<AssetRequestAssignItemControl
														requestId={requestId}
														itemId={item.id}
														assetTypeId={assetTypeId ?? null}
														onAssigned={refreshAfterAction}
													/>
												) : null}
												{(canApprove || canReject || canCancel || canReturn) && (
													<div className='d-flex justify-content-end'>
														<AssetRequestActionButtons
															id={requestId}
															itemId={item.id}
															tableRef={tableRef}
															onActionSuccess={refreshAfterAction}
															canApprove={canApprove}
															canReject={canReject}
															canCancel={canCancel}
															canReturn={canReturn}
														/>
													</div>
												)}
											</div>
										);
									})()}
								</div>
							);
						})}
					</div>
				)}
			</ModalBody>
		</Modal>
	);
};

export default AssetRequestItemsModal;
