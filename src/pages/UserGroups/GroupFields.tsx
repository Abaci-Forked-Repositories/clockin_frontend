import React from 'react';
import { useWatch } from 'react-hook-form';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import ReactSelectComponent from '../../components/CustomComponent/Select/ReactSelectComponent';
import CheckboxWithLabel from '../../components/CustomComponent/CheckboxWithLabel';

const groupTypeOptions = [
	{ label: 'Department', value: 'Department' },
	{ label: 'Project Group', value: 'Project Group' },
	{ label: 'Other Group', value: 'Other Group' },
];

const GroupFields = ({
	register,
	errors,
	control,
	getValues,
	parentGroupOptions,
	leadOptions,
	scheduleOptions,
	sitesOptions,
	leaveTypeOptions,
	defaultTimezone,
}: any) => {
	const attendanceEmailingEnabled = Boolean(
		useWatch({ control, name: 'attendance_emailing_enabled' }),
	);

	return (
		<div className='row g-3'>
			<div className='col-12'>
				<FormGroup label='Group Name *'>
					<input
						type='text'
						className='form-control'
						{...register('name', { required: true })}
					/>
					{errors?.name?.type === 'required' ? (
						<span style={{ color: 'red' }}>*This field is required</span>
					) : null}
				</FormGroup>
			</div>

			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='Group Type *'
					isMulti={false}
					field_name='group_type'
					getValues={getValues}
					errors={errors}
					options={groupTypeOptions}
					isRequired
				/>
			</div>

			<div className='col-12'>
				<FormGroup label='Priority *'>
					<input
						type='number'
						className='form-control'
						min='0'
						{...register('priority_choice_number', {
							required: true,
							valueAsNumber: true,
						})}
					/>
					{errors?.priority_choice_number?.type === 'required' ? (
						<span style={{ color: 'red' }}>*This field is required</span>
					) : null}
				</FormGroup>
			</div>

			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='Parent Group'
					isMulti={false}
					field_name='parent_group'
					getValues={getValues}
					errors={errors}
					options={parentGroupOptions}
					isRequired={false}
					isClearable
				/>
			</div>

			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='Primary Contact'
					isMulti={false}
					field_name='lead_one'
					getValues={getValues}
					errors={errors}
					options={leadOptions}
					isRequired={false}
					isClearable
				/>
			</div>

			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='Secondary Contact'
					isMulti={false}
					field_name='lead_two'
					getValues={getValues}
					errors={errors}
					options={leadOptions}
					isRequired={false}
					isClearable
				/>
			</div>

			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='Schedule'
					isMulti
					field_name='schedule'
					getValues={getValues}
					errors={errors}
					options={scheduleOptions}
					isRequired={false}
					isClearable
				/>
			</div>

			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='Sites'
					isMulti
					field_name='sites'
					getValues={getValues}
					errors={errors}
					options={sitesOptions}
					isRequired={false}
					isClearable
				/>
			</div>

			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='Leave types'
					isMulti
					field_name='leave_types'
					getValues={getValues}
					errors={errors}
					options={leaveTypeOptions}
					isRequired={false}
					isClearable
				/>
			</div>

			<div className='col-12'>
				<CheckboxWithLabel
					control={control}
					name='attendance_emailing_enabled'
					label='Send daily attendance email'
					labelFirst
					layout='form-field'
				/>
			</div>

			{attendanceEmailingEnabled ? (
				<div className='col-12'>
					<FormGroup label='Send at'>
						<input
							type='time'
							className='form-control'
							step={60}
							{...register('attendance_emailing_time', {
								required: attendanceEmailingEnabled,
							})}
						/>
						{defaultTimezone ? (
							<small className='text-muted d-block mt-1'>
								Timezone: {defaultTimezone}
							</small>
						) : null}
						{errors?.attendance_emailing_time?.type === 'required' ? (
							<span style={{ color: 'red' }}>*This field is required</span>
						) : null}
					</FormGroup>
				</div>
			) : null}
		</div>
	);
};

export default GroupFields;
