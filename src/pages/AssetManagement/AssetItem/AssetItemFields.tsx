import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import ReactSelectComponent from '../../../components/CustomComponent/Select/ReactSelectComponent';

type SelectOption = {
	label: string;
	value: number;
	is_consumable?: boolean;
};

type AssetItemFieldsProps = {
	register: any;
	control: any;
	getValues: any;
	errors: any;
	assetTypeOptions: SelectOption[];
	siteOptions: SelectOption[];
	showQuantity: boolean;
};

const AssetItemFields = ({
	register,
	control,
	getValues,
	errors,
	assetTypeOptions,
	siteOptions,
	showQuantity,
}: AssetItemFieldsProps) => (
	<div className='row g-3'>
		<div className='col-md-12'>
			<FormGroup label='Name *'>
				<input
					type='text'
					{...register('name', { required: true })}
					className='form-control'
					style={{ height: '40px' }}
					placeholder='e.g. Bluetooth Speaker - Unit A'
				/>
				{errors?.name?.type ? (
					<span style={{ color: 'red' }}>*This field is required</span>
				) : (
					<p />
				)}
			</FormGroup>
		</div>

		<div className='col-md-12'>
			<ReactSelectComponent
				control={control}
				name='Asset type *'
				field_name='asset_type'
				getValues={getValues}
				errors={errors}
				options={assetTypeOptions}
				isRequired
			/>
		</div>

		<div className='col-md-12'>
			<FormGroup label='Asset code *'>
				<input
					type='text'
					{...register('asset_code', { required: true })}
					className='form-control'
					style={{ height: '40px' }}
					placeholder='e.g. ASG-BTS-001'
				/>
				{errors?.asset_code?.type ? (
					<span style={{ color: 'red' }}>*This field is required</span>
				) : (
					<p />
				)}
			</FormGroup>
		</div>

		<div className='col-md-12'>
			<FormGroup label='Serial number'>
				<input
					type='text'
					{...register('serial_number')}
					className='form-control'
					style={{ height: '40px' }}
					placeholder='e.g. BTS-ASG-001'
				/>
			</FormGroup>
		</div>

		<div className='col-md-12'>
			<FormGroup label='Brand'>
				<input
					type='text'
					{...register('brand')}
					className='form-control'
					style={{ height: '40px' }}
					placeholder='e.g. JBL'
				/>
			</FormGroup>
		</div>

		<div className='col-md-12'>
			<FormGroup label='Model'>
				<input
					type='text'
					{...register('model')}
					className='form-control'
					style={{ height: '40px' }}
					placeholder='e.g. Flip 6'
				/>
			</FormGroup>
		</div>

		<div className='col-md-12'>
			<ReactSelectComponent
				control={control}
				name='Site *'
				field_name='site'
				getValues={getValues}
				errors={errors}
				options={siteOptions}
				isRequired
			/>
		</div>

		{showQuantity && (
				<div className='col-md-12'>
				<FormGroup label='Quantity (stock) *'>
					<input
						type='number'
						min='0'
						step='1'
						{...register('quantity', {
							required: showQuantity,
							validate: (value: string | number) => {
								if (!showQuantity) return true;
								const n = Number(value);
								return Number.isFinite(n) && n >= 0;
							},
						})}
						className='form-control'
						style={{ height: '40px' }}
						placeholder='e.g. 10'
					/>
					{errors?.quantity?.type ? (
						<span style={{ color: 'red' }}>*Enter a valid quantity</span>
					) : (
						<p />
					)}
				</FormGroup>
			</div>
		)}
	</div>
);

AssetItemFields.propTypes = {
	register: PropTypes.func.isRequired,
	control: PropTypes.object.isRequired,
	getValues: PropTypes.func.isRequired,
	errors: PropTypes.object.isRequired,
	assetTypeOptions: PropTypes.array.isRequired,
	siteOptions: PropTypes.array.isRequired,
	showQuantity: PropTypes.bool.isRequired,
};

export default AssetItemFields;
