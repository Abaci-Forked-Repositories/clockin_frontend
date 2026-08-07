import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalBody, ModalHeader, ModalTitle } from '../../../components/bootstrap/Modal';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import { authAxios } from '../../../axiosInstance';
import useDarkMode from '../../../hooks/useDarkMode';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AssetMovementCard from './AssetMovementCard';
import { sortMovementsNewestFirst, toMovementList } from './assetMovementUtils';

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
	const theme = { textPrimary, textMuted, textSubtle, cardBg, border };

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
				setMovements(sortMovementsNewestFirst(toMovementList(res?.data)));
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
						{movements.map((movement, index) => (
							<AssetMovementCard
								key={movement?.id ?? `movement-${index}`}
								movement={movement}
								theme={theme}
							/>
						))}
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
