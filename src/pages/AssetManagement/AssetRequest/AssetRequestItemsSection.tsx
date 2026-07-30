import React from 'react';
import PropTypes from 'prop-types';
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import Button from '../../../components/bootstrap/Button';
import AssetRequestItemRow from './AssetRequestItemRow';
import { emptyAssetRequestItem, type AssetTypeOption } from './assetRequestItemUtils';

type AssetRequestItemsSectionProps = {
	control: Control<any>;
	register: UseFormRegister<any>;
	errors: FieldErrors<any>;
	getValues: any;
	setValue: UseFormSetValue<any>;
	assetTypeOptions: AssetTypeOption[];
};

const AssetRequestItemsSection = ({
	control,
	register,
	errors,
	getValues,
	setValue,
	assetTypeOptions,
}: AssetRequestItemsSectionProps) => {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'items',
	});

	return (
		<div className='col-12 mt-2 pt-3 border-top'>
			<h6 className='fw-bold text-warning mb-3'>Assets Required</h6>

			{fields.map((field, index) => (
				<AssetRequestItemRow
					key={field.id}
					index={index}
					control={control}
					register={register}
					errors={errors}
					getValues={getValues}
					setValue={setValue}
					assetTypeOptions={assetTypeOptions}
					onRemove={() => remove(index)}
					canRemove={fields.length > 1}
				/>
			))}

			<Button
				type='button'
				color='warning'
				isOutline
				size='sm'
				onClick={() => append(emptyAssetRequestItem())}>
				Add item
			</Button>
		</div>
	);
};

AssetRequestItemsSection.propTypes
 = {
	control: PropTypes.object.isRequired,
	register: PropTypes.func.isRequired,
	errors: PropTypes.object.isRequired,
	getValues: PropTypes.func.isRequired,
	setValue: PropTypes.func.isRequired,
	assetTypeOptions: PropTypes.array.isRequired,
};

export default AssetRequestItemsSection;
