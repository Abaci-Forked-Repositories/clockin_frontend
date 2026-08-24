import React from 'react';
import classNames from 'classnames';
import { Controller } from 'react-hook-form';
import GradientToggleSwitch from './GradientToggleSwitch';

const CheckboxWithLabel = ({
	control,
	name,
	label,
	labelFirst = false,
	layout = 'inline',
	className,
	size = 'md',
}: any) => {
	const switchNode = (
		<Controller
			name={name}
			control={control}
			rules={{
				required: false,
			}}
			render={({ field }: any) => (
				<GradientToggleSwitch
					id={name}
					checked={Boolean(field.value)}
					onChange={field.onChange}
					size={size}
				/>
			)}
		/>
	);

	if (layout === 'form-field') {
		return (
			<div className={classNames('hr-settings-toggle-row', className)}>
				<label htmlFor={name} className='hr-settings-toggle-row__label'>
					{label}
				</label>
				<div className='hr-settings-toggle-row__control'>{switchNode}</div>
			</div>
		);
	}

	const labelNode = (
		<label
			className='mb-0'
			style={{ fontWeight: 450, color: '#6C757D', cursor: 'pointer', userSelect: 'none' }}
			htmlFor={name}>
			{label}
		</label>
	);

	return (
		<div
			className={classNames(
				'd-flex align-items-center gap-2 mb-2',
				labelFirst && 'justify-content-between w-100',
				className,
			)}>
			{labelFirst ? (
				<>
					{labelNode}
					{switchNode}
				</>
			) : (
				<>
					{switchNode}
					{labelNode}
				</>
			)}
		</div>
	);
};

export default CheckboxWithLabel;
