import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import OffCanvasComponent from '../../../components/OffCanvasComponent';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import SaveButton from '../../../components/CustomComponent/Buttons/SaveButton';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AssetRequestField from './AssetRequestField';
import {
	buildAssetRequestItemsPayload,
	emptyAssetRequestItem,
	mapApiItemToForm,
	mapAssetItemToOption,
	mapAssetTypeToOption,
	toList,
	validateAssetRequestItems,
	type AssetItemOption,
	type AssetTypeOption,
} from './assetRequestItemUtils';

const buildAssetRequestPayload = (data: any) => ({
	description: data?.description || '',
	items: buildAssetRequestItemsPayload(data?.items),
});

const fetchAssetItemsForType = async (typeId: number): Promise<AssetItemOption[]> => {
	const res = await authAxios.get('/api/hr/asset-items/', {
		params: { asset_type: typeId, paginate: 'off' },
	});
	return toList(res?.data).map(mapAssetItemToOption);
};

const AddAssetRequest = ({
	isOpen,
	setIsOpen,
	tableRef,
	title,
	id,
	prefillAsset = null,
	onSuccess,
}: any) => {
	const {
		register,
		handleSubmit,
		reset,
		control,
		getValues,
		setValue,
	formState: { errors },
	} = useForm({
		defaultValues: {
			description: '',
			items: [emptyAssetRequestItem()],
		},
	});

	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [assetTypeOptions, setAssetTypeOptions] = useState<AssetTypeOption[]>([]);
	const { showErrorNotification, showNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;
	const isEdit = Boolean(id);

	const buildPrefillItem = (
		asset: Record<string, unknown>,
		typeOpts: AssetTypeOption[],
	) => {
		const typeRaw =
			asset.asset_type != null && typeof asset.asset_type === 'object'
				? (asset.asset_type as Record<string, unknown>)
				: null;
		const typeId = typeRaw?.id ?? asset.asset_type;
		const typeFromList = typeOpts.find((o) => Number(o.value) === Number(typeId));
		const assetType: AssetTypeOption | null =
			typeFromList ||
			(typeId != null
				? mapAssetTypeToOption({
						id: typeId,
						name: typeRaw?.name || `Asset type ${typeId}`,
						is_consumable: typeRaw?.is_consumable ?? asset.is_consumable,
						is_bookable: typeRaw?.is_bookable ?? asset.is_bookable,
						user_selects_item: typeRaw?.user_selects_item ?? true,
						is_self_requestable: typeRaw?.is_self_requestable,
					})
				: null);

		// Keep a specific inventory item selected for submit.
		const typeForForm = assetType
			? { ...assetType, user_selects_item: true }
			: null;

		return {
			...emptyAssetRequestItem(),
			asset_type: typeForForm,
			asset_item: mapAssetItemToOption(asset),
		};
	};

	useEffect(() => {
		if (!isOpen) return undefined;

		let cancelled = false;
		setIsLoading(true);

		const assetTypesReq = authAxios.get('/api/hr/asset-types/', { params: { paginate: 'off' } });
		const requestReq = isEdit
			? authAxios.get(`/api/hr/asset-requests/${id}/`)
			: Promise.resolve(null);

		Promise.all([assetTypesReq, requestReq])
			.then(async ([typesRes, requestRes]) => {
				if (cancelled) return;

				const typeOpts = toList(typesRes?.data).map(mapAssetTypeToOption);
				setAssetTypeOptions(typeOpts);

				if (!isEdit) {
					const prefilled =
						prefillAsset != null && typeof prefillAsset === 'object'
							? buildPrefillItem(prefillAsset as Record<string, unknown>, typeOpts)
							: emptyAssetRequestItem();
					reset({
						description: '',
						items: [prefilled],
					});
					return;
				}

				const requestData = requestRes?.data ?? {};
				const apiItems = Array.isArray(requestData.items) ? requestData.items : [];
				const assetItemOptionsByType: Record<number, AssetItemOption[]> = {};

				await Promise.all(
					apiItems.map(async (apiItem: any) => {
						const typeId =
							apiItem?.asset_type?.id ??
							apiItem?.asset_type ??
							apiItem?.asset_item?.asset_type?.id ??
							apiItem?.asset_item?.asset_type;
						if (typeId == null || assetItemOptionsByType[Number(typeId)]) return;
						assetItemOptionsByType[Number(typeId)] = await fetchAssetItemsForType(
							Number(typeId),
						);
					}),
				);

				const items = apiItems.length
					? apiItems.map((apiItem: any) =>
							mapApiItemToForm(apiItem, typeOpts, assetItemOptionsByType),
						)
					: [emptyAssetRequestItem()];

				reset({
					description: requestData?.description || '',
					items,
				});
			})
			.catch((err) => {
				if (!cancelled) showErrorRef.current(err);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, id, isEdit, prefillAsset]);

	const onSubmit = (data: any) => {
		const itemsError = validateAssetRequestItems(data?.items);
		if (itemsError) {
			showNotification('Error', itemsError, 'danger');
			return;
		}

		setWaitingForAxios(true);
		const payload = buildAssetRequestPayload(data);

		const req = isEdit
			? authAxios.patch(`/api/hr/asset-requests/${id}/`, payload)
			: authAxios.post('/api/hr/asset-requests/', payload);

		req
			.then(() => {
				setWaitingForAxios(false);
				tableRef?.current?.onQueryChange?.();
				onSuccess?.();
				setIsOpen(false);
			})
			.catch((err) => {
				setWaitingForAxios(false);
				showErrorNotification(err);
			});
	};

	return (
		<OffCanvasComponent isOpen={isOpen} placement='end' title={title} setOpen={setIsOpen}>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Card>
					<CardBody>
						{isLoading ? (
							<CustomSpinner />
						) : (
							<>
								<AssetRequestField
									register={register}
									control={control}
									getValues={getValues}
									setValue={setValue}
									errors={errors}
									assetTypeOptions={assetTypeOptions}
								/>
								<div className='row m-0'>
									<div className='col-12 p-3'>
										<SaveButton state={waitingForAxios} />
									</div>
								</div>
							</>
						)}
					</CardBody>
				</Card>
			</Form>
		</OffCanvasComponent>
	);
};

AddAssetRequest.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	tableRef: PropTypes.object,
	title: PropTypes.string.isRequired,
	id: PropTypes.any,
	prefillAsset: PropTypes.object,
	onSuccess: PropTypes.func,
};

AddAssetRequest.defaultProps = {
	id: null,
	tableRef: null,
	prefillAsset: null,
	onSuccess: undefined,
};

export default AddAssetRequest;
