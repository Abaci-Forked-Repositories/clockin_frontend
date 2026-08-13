import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubheaderSeparator } from '../../../layout/SubHeader/SubHeader';
import { CardTitle } from '../../../components/bootstrap/Card';
import Page from '../../../layout/Page/Page';
import BackButton from '../../../components/CustomComponent/Buttons/BackButton';
import AbaciLoader from '../../../components/AbaciLoader/AbaciLoader';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AssetItemDetails from './AssetItemDetails';
import AssetItemMovementsSection from './AssetItemMovementsSection';
import AssetBookingCalendarSection from './AssetBookingCalendarSection';
import { isAssetBookable } from './assetBookingCalendarUtils';
import { allRoutesObject } from '../../../routes/RoutesMenu';

const AssetItemDetailPage = () => {
	const { id } = useParams();
	const [asset, setAsset] = useState<Record<string, unknown> | null>(null);
	const [loading, setLoading] = useState(true);
	const { showErrorNotification } = useToasterNotification();

	useEffect(() => {
		if (!id) {
			setAsset(null);
			setLoading(false);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);
		authAxios
			.get(`/api/hr/asset-items/${id}/`)
			.then((res) => {
				if (!cancelled) setAsset(res?.data ?? null);
			})
			.catch((err) => {
				if (!cancelled) showErrorNotification(err);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const showBookingCalendar = isAssetBookable(asset);

	return (
		<PageWrapper title='Asset details'>
			<SubHeader>
				<SubHeaderLeft>
					<BackButton to={allRoutesObject.Assets.path} />
					<SubheaderSeparator />
					<CardTitle tag='div' className='h6'>
						{String(asset?.name || 'Asset Details')}
					</CardTitle>
				</SubHeaderLeft>
			</SubHeader>
			<Page container='fluid' className='position-relative'>
				{loading && (
					<div
						className='d-flex justify-content-center align-items-center py-5'
						style={{ minHeight: '40vh' }}>
						<AbaciLoader />
					</div>
				)}
				{!loading && (
					<div className='row g-4'>
						<div className='col-12'>
							<AssetItemDetails asset={asset} />
						</div>
						{showBookingCalendar && id ? (
							<div className='col-12'>
								<AssetBookingCalendarSection assetId={id} asset={asset} />
							</div>
						) : null}
						{id ? (
							<div className='col-12'>
								<AssetItemMovementsSection assetId={String(id)} />
							</div>
						) : null}
					</div>
				)}
			</Page>
		</PageWrapper>
	);
};

export default AssetItemDetailPage;
