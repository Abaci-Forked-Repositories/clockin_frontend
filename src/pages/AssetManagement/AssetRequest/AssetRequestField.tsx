import React from 'react';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import AssetRequestItemsSection from './AssetRequestItemsSection';
import { type AssetTypeOption } from './assetRequestItemUtils';

type AssetRequestFieldProps = {
	register: any;
	control: any;
	getValues: any;
	setValue: any;
	errors: any;
	assetTypeOptions: AssetTypeOption[];
};

const AssetRequestField = ({
	register,
	control,
	getValues,
	setValue,
	errors,
	assetTypeOptions,
}: AssetRequestFieldProps) => (
	<div className='row'>
		<div className='col-12 mb-3'>
			<FormGroup label='Description *'>
				<textarea
					className='form-control'
					rows={4}
					style={{ minHeight: '120px' }}
					{...register('description', { required: true })}
				/>
				{errors.description?.type && (
					<span className='text-danger small'>*This field is required</span>
				)}
			</FormGroup>
		</div>

		<AssetRequestItemsSection
			control={control}
			register={register}
			errors={errors}
			getValues={getValues}
			setValue={setValue}
			assetTypeOptions={assetTypeOptions}
		/>
	</div>
);

export default AssetRequestField;
