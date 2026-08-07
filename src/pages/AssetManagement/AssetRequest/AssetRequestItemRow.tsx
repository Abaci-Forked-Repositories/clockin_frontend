import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import Select from 'react-select';
import {
	type Control,
	Controller,
	type FieldErrors,
	type UseFormRegister,
	type UseFormSetValue,
	useWatch,
} from 'react-hook-form';
import { authAxios } from '../../../axiosInstance';
import useSelectStyles from '../../../hooks/useSelectStyle';
import useToasterNotification from '../../../hooks/useToasterNotification';
import ReactSelectComponent from '../../../components/CustomComponent/Select/ReactSelectComponent';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Button from '../../../components/bootstrap/Button';
import {
	type AssetItemOption,
	type AssetTypeOption,
	mapAssetItemToOption,
	toList,
} from './assetRequestItemUtils';

type AssetRequestItemRowProps = {
	index: number;
	control: Control<any>;
	register: UseFormRegister<any>;
	errors: FieldErrors<any>;
	getValues: any;
	setValue: UseFormSetValue<any>;
	assetTypeOptions: AssetTypeOption[];
	onRemove: () => void;
	canRemove: boolean;
};

const AssetRequestItemRow = ({
	index,
	control,
	register,
	errors,
	getValues,
	setValue,
	assetTypeOptions,
	onRemove,
	canRemove,
}: AssetRequestItemRowProps) => {
	const { showErrorNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;
	const reactSelectStyle = useSelectStyles(false);
	const [assetItemOptions, setAssetItemOptions] = useState<AssetItemOption[]>([]);
	const [loadingItems, setLoadingItems] = useState(false);
	const previousTypeIdRef = useRef<number | null>(null);
	const fetchedTypeIdRef = useRef<number | null>(null);

	const selectedType = useWatch({
		control,
		name: `items.${index}.asset_type`,
	}) as AssetTypeOption | null;

	const selectedTypeId = selectedType?.value ?? null;
	const selectedAssetItem = useWatch({
		control,
		name: `items.${index}.asset_item`,
	}) as AssetItemOption | null;
	const userSelectsItem = Boolean(selectedType?.user_selects_item);
	const isConsumable = Boolean(selectedType?.is_consumable);
	const isBookable = Boolean(selectedType?.is_bookable);

	useEffect(() => {
		const currentTypeId = selectedTypeId;
		if (
			previousTypeIdRef.current != null &&
			currentTypeId != null &&
			previousTypeIdRef.current !== currentTypeId
		) {
			setValue(`items.${index}.asset_item`, null);
			setValue(`items.${index}.qty`, '');
			setValue(`items.${index}.start_date`, '');
			setValue(`items.${index}.end_date`, '');
			setValue(`items.${index}.item_description`, '');
			fetchedTypeIdRef.current = null;
		}
		previousTypeIdRef.current = currentTypeId;
	}, [selectedTypeId, index, setValue]);

	useEffect(() => {
		if (!selectedTypeId || !userSelectsItem) {
			setAssetItemOptions([]);
			setLoadingItems(false);
			fetchedTypeIdRef.current = null;
			return undefined;
		}

		if (fetchedTypeIdRef.current === selectedTypeId) {
			return undefined;
		}

		let cancelled = false;
		fetchedTypeIdRef.current = selectedTypeId;
		setLoadingItems(true);

		authAxios
			.get('/api/hr/asset-items/', {
				params: {
					asset_type: selectedTypeId,
					paginate: 'off',
				},
			})
			.then((res) => {
				if (cancelled) return;
				setAssetItemOptions(toList(res?.data).map(mapAssetItemToOption));
			})
			.catch((err) => {
				if (!cancelled) {
					fetchedTypeIdRef.current = null;
					setAssetItemOptions([]);
					showErrorRef.current(err);
				}
			})
			.finally(() => {
				if (!cancelled) setLoadingItems(false);
			});

		return () => {
			cancelled = true;
		};
	}, [selectedTypeId, userSelectsItem]);

	const rowErrors = (errors as any)?.items?.[index];

	return (
		<div className='rounded-3 border border-secondary border-opacity-25 p-3 mb-3'>
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<span className='fw-semibold small text-uppercase text-muted'>Item {index + 1}</span>
				{canRemove && (
					<Tooltip arrow title='Remove item' placement='top'>
						<Button
							type='button'
							color='danger'
							isLight
							size='sm'
							icon='Delete'
							onClick={onRemove}
						/>
					</Tooltip>
				)}
			</div>

			<div className='row g-3'>
				<div className='col-12'>
					<ReactSelectComponent
						control={control}
						name='Asset type *'
						field_name={`items.${index}.asset_type`}
						getValues={getValues}
						errors={errors}
						options={assetTypeOptions}
						isRequired
					/>
				</div>

				{selectedType && userSelectsItem && (
					<div className='col-12'>
						<FormGroup label='Asset item *'>
							<Controller
								name={`items.${index}.asset_item`}
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<Select
										placeholder=''
										onChange={(value) => field.onChange(value)}
										className='react-select'
										isClearable
										styles={reactSelectStyle}
										options={assetItemOptions}
										value={field.value ?? null}
										isDisabled={loadingItems}
										formatOptionLabel={(option, { context }) => {
											const item = option as AssetItemOption;
											if (context === 'menu' && item.site_timezone) {
												return (
													<div>
														<div>{item.label}</div>
														<div className='small text-muted'>
															{item.site_name
																? `${item.site_name} · `
																: ''}
															{item.site_timezone}
														</div>
													</div>
												);
											}
											return item.label;
										}}
									/>
								)}
							/>
							{rowErrors?.asset_item?.type ? (
								<span className='text-danger small'>*This field is required</span>
							) : null}
							{selectedAssetItem?.site_timezone ? (
								<div className='small text-muted mt-1'>
									Times use site timezone: {selectedAssetItem.site_timezone}
								</div>
							) : null}
						</FormGroup>
					</div>
				)}

				{selectedType && isConsumable && (
					<div className='col-md-12'>
						<FormGroup label='Quantity *'>
							<input
								type='number'
								min='0'
								step='0.01'
								className='form-control'
								style={{ height: '40px' }}
								placeholder='e.g. 5.00'
								{...register(`items.${index}.qty`, { required: true })}
							/>
							{rowErrors?.qty?.type && (
								<span className='text-danger small'>*Enter quantity</span>
							)}
						</FormGroup>
					</div>
				)}

				{selectedType && isBookable && (
					<>
						<div className='col-12'>
							<FormGroup label='Start date & time *'>
								<input
									type='datetime-local'
									step={60}
									className='form-control'
									{...register(`items.${index}.start_date`, { required: true })}
								/>
								{rowErrors?.start_date?.type && (
									<span className='text-danger small'>*Required</span>
								)}
							</FormGroup>
						</div>
						<div className='col-12'>
							<FormGroup label='End date & time *'>
								<input
									type='datetime-local'
									step={60}
									className='form-control'
									{...register(`items.${index}.end_date`, { required: true })}
								/>
								{rowErrors?.end_date?.type && (
									<span className='text-danger small'>*Required</span>
								)}
							</FormGroup>
						</div>
						<div className='col-12'>
							<FormGroup label='Item notes'>
								<textarea
									className='form-control'
									rows={2}
									placeholder='e.g. Need laptop with min 8gb ram'
									{...register(`items.${index}.item_description`)}
								/>
							</FormGroup>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

AssetRequestItemRow.propTypes = {
	index: PropTypes.number.isRequired,
	control: PropTypes.object.isRequired,
	register: PropTypes.func.isRequired,
	errors: PropTypes.object.isRequired,
	getValues: PropTypes.func.isRequired,
	setValue: PropTypes.func.isRequired,
	assetTypeOptions: PropTypes.array.isRequired,
	onRemove: PropTypes.func.isRequired,
	canRemove: PropTypes.bool.isRequired,
};

export default AssetRequestItemRow;
