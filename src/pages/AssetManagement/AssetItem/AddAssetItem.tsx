import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'reactstrap';
import { useForm, useWatch } from 'react-hook-form';
import OffCanvasComponent from '../../../components/OffCanvasComponent';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import SaveButton from '../../../components/CustomComponent/Buttons/SaveButton';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AssetItemFields from './AssetItemFields';

type SelectOption = {
	label: string;
	value: number;
	is_consumable?: boolean;
};

type AssetItemFormValues = {
	name: string;
	asset_type: SelectOption | null;
	asset_code: string;
	serial_number: string;
	brand: string;
	model: string;
	site: SelectOption | null;
	quantity: string;
};

const defaultValues: AssetItemFormValues = {
	name: '',
	asset_type: null,
	asset_code: '',
	serial_number: '',
	brand: '',
	model: '',
	site: null,
	quantity: '',
};

const toList = (data: any): any[] => {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.results)) return data.results;
	return [];
};

const resolveRelatedId = (value: any): number | null => {
	if (value == null) return null;
	if (typeof value === 'object') {
		const id = Number(value.id ?? value.value);
		return Number.isNaN(id) ? null : id;
	}
	const id = Number(value);
	return Number.isNaN(id) ? null : id;
};

const resolveRelatedLabel = (value: any, fallbackPrefix: string): string => {
	if (value != null && typeof value === 'object') {
		return String(value.name || value.label || `${fallbackPrefix} ${value.id}`);
	}
	return value != null ? `${fallbackPrefix} ${value}` : '';
};

const isConsumableOption = (option: SelectOption | null | undefined) =>
	Boolean(option?.is_consumable);

const buildPayload = (data: AssetItemFormValues, includeQuantity: boolean) => {
	const payload: Record<string, unknown> = {
		name: String(data?.name || '').trim(),
		asset_type: Number(data?.asset_type?.value),
		asset_code: String(data?.asset_code || '').trim(),
		serial_number: String(data?.serial_number || '').trim(),
		brand: String(data?.brand || '').trim(),
		model: String(data?.model || '').trim(),
		site: Number(data?.site?.value),
	};

	if (includeQuantity) {
		payload.quantity = Number(data?.quantity);
	}

	return payload;
};

const AddAssetItem = ({ isOpen, setIsOpen, tableRef, title, id }: any) => {
	const {
		register,
		handleSubmit,
		reset,
		control,
		getValues,
		formState: { errors },
	} = useForm<AssetItemFormValues>({
		defaultValues,
	});

	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [assetTypeOptions, setAssetTypeOptions] = useState<SelectOption[]>([]);
	const [siteOptions, setSiteOptions] = useState<SelectOption[]>([]);
	const { showErrorNotification } = useToasterNotification();
	const isEdit = Boolean(id);

	const selectedAssetType = useWatch({ control, name: 'asset_type' });
	const showQuantity = isConsumableOption(selectedAssetType);

	useEffect(() => {
		if (!isOpen) return undefined;

		let cancelled = false;
		setIsLoading(true);

		const assetTypesReq = authAxios.get('/api/hr/asset-types/', {
			params: { paginate: 'off' },
		});
		const sitesReq = authAxios.get('/api/hr/sites/', { params: { paginate: 'off' } });
		const itemReq = isEdit
			? authAxios.get(`/api/hr/asset-items/${id}/`)
			: Promise.resolve(null);

		Promise.all([assetTypesReq, sitesReq, itemReq])
			.then(([assetTypesRes, sitesRes, itemRes]) => {
				if (cancelled) return;

				const typeOpts: SelectOption[] = toList(assetTypesRes?.data).map((item: any) => ({
					label: String(item?.name || `Asset type ${item?.id}`),
					value: Number(item.id),
					is_consumable: Boolean(item?.is_consumable),
				}));
				setAssetTypeOptions(typeOpts);

				const siteOpts: SelectOption[] = toList(sitesRes?.data).map((item: any) => ({
					label: String(item?.name || `Site ${item?.id}`),
					value: Number(item.id),
				}));
				setSiteOptions(siteOpts);

				if (!isEdit) {
					reset(defaultValues);
					return;
				}

				const data = itemRes?.data ?? {};
				const typeId = resolveRelatedId(data.asset_type);
				const siteId = resolveRelatedId(data.site);
				const typeFromList = typeOpts.find((o) => Number(o.value) === Number(typeId));
				const siteFromList = siteOpts.find((o) => Number(o.value) === Number(siteId));

				const assetTypeOption =
					typeFromList ||
					(typeId != null
						? {
								label: resolveRelatedLabel(data.asset_type, 'Asset type'),
								value: typeId,
								is_consumable: Boolean(
									typeof data.asset_type === 'object'
										? data.asset_type?.is_consumable
										: data.is_consumable,
								),
							}
						: null);

				const siteOption =
					siteFromList ||
					(siteId != null
						? {
								label: resolveRelatedLabel(data.site, 'Site'),
								value: siteId,
							}
						: null);

				reset({
					name: data?.name || '',
					asset_type: assetTypeOption,
					asset_code: data?.asset_code || '',
					serial_number: data?.serial_number || '',
					brand: data?.brand || '',
					model: data?.model || '',
					site: siteOption,
					quantity: data?.quantity != null ? String(data.quantity) : '',
				});
			})
			.catch((err) => {
				if (!cancelled) showErrorNotification(err);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, id, isEdit]);

	const onSubmit = (data: AssetItemFormValues) => {
		const includeQuantity = isConsumableOption(data.asset_type);
		setWaitingForAxios(true);
		const payload = buildPayload(data, includeQuantity);

		const req = isEdit
			? authAxios.patch(`/api/hr/asset-items/${id}/`, payload)
			: authAxios.post('/api/hr/asset-items/', payload);

		req
			.then(() => {
				setWaitingForAxios(false);
				tableRef?.current?.onQueryChange?.();
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
								<AssetItemFields
									register={register}
									control={control}
									getValues={getValues}
									errors={errors}
									assetTypeOptions={assetTypeOptions}
									siteOptions={siteOptions}
									showQuantity={showQuantity}
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

AddAssetItem.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	tableRef: PropTypes.object.isRequired,
	title: PropTypes.string.isRequired,
	id: PropTypes.any,
};

AddAssetItem.defaultProps = {
	id: null,
};

export default AddAssetItem;
