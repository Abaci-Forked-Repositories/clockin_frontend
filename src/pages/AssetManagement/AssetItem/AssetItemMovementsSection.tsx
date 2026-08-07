import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../components/bootstrap/Card';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import { authAxios } from '../../../axiosInstance';
import useDarkMode from '../../../hooks/useDarkMode';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AssetMovementCard from './AssetMovementCard';
import { sortMovementsNewestFirst, toMovementList } from './assetMovementUtils';

type AssetItemMovementsSectionProps = {
	assetId: string;
};

const AssetItemMovementsSection = ({ assetId }: AssetItemMovementsSectionProps) => {
	const { darkModeStatus } = useDarkMode();
	const { showErrorNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;

	const [movements, setMovements] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const textPrimary = darkModeStatus ? '#f8f9fa' : '#111827';
	const textMuted = darkModeStatus ? '#9ca3af' : '#6b7280';
	const textSubtle = darkModeStatus ? '#6b7280' : '#9ca3af';
	const cardBg = darkModeStatus ? 'rgba(255,255,255,0.04)' : '#ffffff';
	const border = darkModeStatus ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
	const theme = { textPrimary, textMuted, textSubtle, cardBg, border };

	useEffect(() => {
		if (!assetId) {
			setMovements([]);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);

		authAxios
			.get('/api/hr/asset-movements/', { params: { asset: assetId, paginate: 'off' } })
			.then((res) => {
				if (!cancelled) {
					setMovements(sortMovementsNewestFirst(toMovementList(res?.data)));
				}
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
	}, [assetId]);

	return (
		<Card stretch className='w-100 mb-0 shadow-sm'>
			<CardHeader borderSize={1}>
				<CardLabel icon='SwapHoriz' iconColor='primary'>
					<CardTitle tag='div' className='h5 mb-0'>
						Assignment history
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody>
				{loading ? (
					<div className='d-flex justify-content-center py-4'>
						<CustomSpinner />
					</div>
				) : movements.length === 0 ? (
					<div className='text-muted text-center py-4'>No movements found for this asset.</div>
				) : (
					<div className='d-flex flex-column gap-3'>
						{movements.map((movement, index) => (
							<AssetMovementCard
								key={movement?.id ?? `movement-${index}`}
								movement={movement}
								theme={theme}
							/>
						))}
					</div>
				)}
			</CardBody>
		</Card>
	);
};

AssetItemMovementsSection.propTypes = {
	assetId: PropTypes.string.isRequired,
};

export default AssetItemMovementsSection;
