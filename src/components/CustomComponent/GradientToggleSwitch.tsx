import React, { FC, KeyboardEvent } from 'react';
import classNames from 'classnames';

type GradientToggleSwitchProps = {
	id?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
	size?: 'sm' | 'md';
};

const GradientToggleSwitch: FC<GradientToggleSwitchProps> = ({
	id,
	checked,
	onChange,
	disabled = false,
	className,
	size = 'md',
}) => {
	const handleToggle = () => {
		if (!disabled) onChange(!checked);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (disabled) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onChange(!checked);
		}
	};

	return (
		<button
			type='button'
			role='switch'
			aria-checked={checked}
			id={id}
			disabled={disabled}
			className={classNames(
				'gradient-toggle-switch',
				size === 'sm' && 'gradient-toggle-switch--sm',
				checked && 'gradient-toggle-switch--checked',
				className,
			)}
			onClick={handleToggle}
			onKeyDown={handleKeyDown}>
			<span className='gradient-toggle-switch__thumb' />
		</button>
	);
};

export default GradientToggleSwitch;
