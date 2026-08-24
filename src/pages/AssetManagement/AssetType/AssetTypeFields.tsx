import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import CheckboxWithLabel from '../../../components/CustomComponent/CheckboxWithLabel';

type AssetTypeFieldsProps = {
	register: any;
	control: any;
	errors: any;
};

const AssetTypeFields = ({ register, control, errors }: AssetTypeFieldsProps) => (
	<div className='row g-3'>
		<div className='col-md-12'>
			<FormGroup label='Name *'>
				<input
					type='text'
					{...register('name', { required: true })}
					className='form-control'
					style={{ height: '40px' }}
					placeholder='e.g. Laptop'
				/>
				{errors?.name?.type ? (
					<span style={{ color: 'red' }}>*This field is required</span>
				) : (
					<p />
				)}
			</FormGroup>
		</div>

		<div className='col-12'>
			<FormGroup label='Description'>
				<textarea
					{...register('description')}
					className='form-control'
					rows={3}
					placeholder='e.g. Assigned employee laptops'
				/>
			</FormGroup>
		</div>

		<div className='col-md-6'>
			<CheckboxWithLabel
				control={control}
				name='is_consumable'
				label='Consumable'
				labelFirst
				layout='form-field'
				size='sm'
			/>
		</div>

		<div className='col-md-6'>
			<CheckboxWithLabel
				control={control}
				name='is_bookable'
				label='Bookable'
				labelFirst
				layout='form-field'
				size='sm'
			/>
		</div>

		<div className='col-md-6'>
			<CheckboxWithLabel
				control={control}
				name='is_self_requestable'
				label='Self requestable'
				labelFirst
				layout='form-field'
				size='sm'
			/>
		</div>

		<div className='col-md-6'>
			<CheckboxWithLabel
				control={control}
				name='user_selects_item'
				label='User selects item'
				labelFirst
				layout='form-field'
				size='sm'
			/>
		</div>
	</div>
);

AssetTypeFields.propTypes = {
	register: PropTypes.func.isRequired,
	control: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
};

export default AssetTypeFields;
