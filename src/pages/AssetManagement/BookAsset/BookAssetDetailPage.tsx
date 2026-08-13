import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import { CardTitle } from '../../../components/bootstrap/Card';
import Page from '../../../layout/Page/Page';
import BackButton from '../../../components/CustomComponent/Buttons/BackButton';
import AddButton from '../../../components/CustomComponent/Buttons/AddButton';
import AbaciLoader from '../../../components/AbaciLoader/AbaciLoader';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AssetItemDetails from '../AssetItem/AssetItemDetails';
import AssetBookingCalendarSection from '../AssetItem/AssetBookingCalendarSection';
import { isAssetBookable } from '../AssetItem/assetBookingCalendarUtils';
import AddAssetRequest from '../AssetRequest/AddAssetRequest';
import { allRoutesObject } from '../../../routes/RoutesMenu';

const BookAssetDetailPage = () => {
	const { id } = useParams();
	const [asset, setAsset] = useState<Record<string, unknown> | null>(null);
	const [loading, setLoading] = useState(true);
	const [isRequestOpen, setIsRequestOpen] = useState(false);
	const { showErrorNotification } = useToasterNotification();
	const showBookingCalendar = isAssetBookable(asset);

	useEffect(() => {
		if (!id) {
			setAsset(null);
			setLoading(false);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);
		setIsRequestOpen(false);
		authAxios
			.get(`/api/hr/asset-items/${id}/`)
			.then((res) => {
				if (cancelled) return;
				setAsset(res?.data ?? null);
			})
			.catch((err) => {
				if (!cancelled) {
					setAsset(null);
					showErrorNotification(err);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	return (
		<>
			{isRequestOpen && asset && !showBookingCalendar ? (
				<AddAssetRequest
					isOpen={isRequestOpen}
					setIsOpen={setIsRequestOpen}
					title='Add Asset Request'
					prefillAsset={asset}
				/>
			) : null}
			<PageWrapper title='Asset Inventory'>
				<SubHeader>
					<SubHeaderLeft>
						<BackButton to={allRoutesObject.BookAsset.path} />
						<SubheaderSeparator />
						<CardTitle tag='div' className='h6'>
							{String(asset?.name || 'Asset Inventory')}
						</CardTitle>
					</SubHeaderLeft>
					{!loading && asset && !showBookingCalendar ? (
						<SubHeaderRight>
							<AddButton
								name='Add Asset Request'
								modalShow={() => setIsRequestOpen(true)}
							/>
						</SubHeaderRight>
					) : null}
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
									<AssetBookingCalendarSection
										assetId={id}
										asset={asset}
										allowBooking
									/>
								</div>
							) : null}
						</div>
					)}
				</Page>
			</PageWrapper>
		</>
	);
};

export default BookAssetDetailPage;
