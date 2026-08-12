import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import useDarkMode from '../../hooks/useDarkMode';
import Icon from '../icon/Icon';
import { TIcons } from '../../type/icons-type';

type PillStyle = {
	bg: string;
	color: string;
};

type StatusConfig = {
	styleKey: string;
	icon: TIcons;
	label?: string;
};

const normalizeStatusKey = (value: unknown) =>
	String(value || '')
		.toLowerCase()
		.trim()
		.replace(/[\s-]+/g, '_')
		.replace(/_+/g, '_');

const toTitleCase = (value: string) =>
	value
		.replace(/_/g, ' ')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());

/** Clock-in / platform admin status keys → pill style + icon */
const STATUS_CONFIG: Record<string, StatusConfig> = {
	active: { styleKey: 'Active', icon: 'CheckCircle' },
	blocked: { styleKey: 'Cancelled', icon: 'Block', label: 'Blocked' },
	inactive: { styleKey: 'Inactive', icon: 'Block' },
	pending: { styleKey: 'Scheduled', icon: 'Schedule' },
	pending_hr: { styleKey: 'Scheduled', icon: 'Schedule', label: 'Pending - HR' },
	expired: { styleKey: 'Cancelled', icon: 'Cancel', label: 'Expired' },
	cancelled: { styleKey: 'Cancelled', icon: 'Cancel', label: 'Cancelled' },
	canceled: { styleKey: 'Cancelled', icon: 'Cancel', label: 'Cancelled' },
	approved: { styleKey: 'Completed', icon: 'TaskAlt', label: 'Approved' },
	rejected: { styleKey: 'Cancelled', icon: 'Cancel', label: 'Rejected' },
	invited: { styleKey: 'Scheduled', icon: 'AppRegistration', label: 'Invited' },
	disabled: { styleKey: 'Inactive', icon: 'Block' },
	online: { styleKey: 'Active', icon: 'CheckCircle', label: 'Online' },
	offline: { styleKey: 'Cancelled', icon: 'CloudOff', label: 'Offline' },
	maintenance: { styleKey: 'Scheduled', icon: 'Build', label: 'Maintenance' },
	unknown: { styleKey: 'Check', icon: 'HelpOutline', label: 'Unknown' },
	requested: { styleKey: 'Scheduled', icon: 'Schedule', label: 'Requested' },
	applied: { styleKey: 'Scheduled', icon: 'Schedule', label: 'Applied' },
	partial: { styleKey: 'Inactive', icon: 'Timelapse', label: 'Partial' },
	partially_approved: { styleKey: 'Inactive', icon: 'Timelapse', label: 'Partial' },
	partial_approved: { styleKey: 'Inactive', icon: 'Timelapse', label: 'Partial' },
	request_cancelled: { styleKey: 'Cancelled', icon: 'Cancel', label: 'Request Cancelled' },
	scheduled: { styleKey: 'Scheduled', icon: 'Schedule', label: 'Scheduled' },
	// Asset item statuses
	available: { styleKey: 'Active', icon: 'CheckCircle', label: 'Available' },
	assigned: { styleKey: 'Completed', icon: 'Person', label: 'Assigned' },
	booked: { styleKey: 'Completed', icon: 'EventAvailable', label: 'Booked' },
	returned: { styleKey: 'Scheduled', icon: 'AssignmentReturn', label: 'Returned' },
	in_use: { styleKey: 'Scheduled', icon: 'Laptop', label: 'In Use' },
	under_maintenance: { styleKey: 'Inactive', icon: 'Build', label: 'Under Maintenance' },
	damaged: { styleKey: 'Cancelled', icon: 'BrokenImage', label: 'Damaged' },
	lost: { styleKey: 'Cancelled', icon: 'SearchOff', label: 'Lost' },
	disposed: { styleKey: 'Check', icon: 'DeleteForever', label: 'Disposed' },
	completed: { styleKey: 'Completed', icon: 'TaskAlt', label: 'Completed' },
	upcoming: { styleKey: 'Scheduled', icon: 'Event', label: 'Upcoming' },
	past: { styleKey: 'Check', icon: 'History', label: 'Past' },
	in_progress: { styleKey: 'Active', icon: 'Timelapse', label: 'In Progress' },
	ongoing: { styleKey: 'Active', icon: 'Timelapse', label: 'Ongoing' },
	yes: { styleKey: 'Active', icon: 'CheckCircle', label: 'Yes' },
	no: { styleKey: 'Cancelled', icon: 'Cancel', label: 'No' },
};

const getPillStyles = (styleKey: string, themeStatus: string): PillStyle => {
	const styles: Record<string, PillStyle> = {
		Active: {
			bg:
				themeStatus === 'dark'
					? 'inherit'
					: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
			color: '#059669',
		},
		Completed: {
			bg:
				themeStatus === 'dark'
					? 'inherit'
					: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
			color: '#059669',
		},
		Scheduled: {
			bg:
				themeStatus === 'dark'
					? 'inherit'
					: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
			color: '#2563EB',
		},
		Inactive: {
			bg:
				themeStatus === 'dark'
					? 'inherit'
					: 'linear-gradient(135deg, #FFF4E6 0%, #FFE8CC 100%)',
			color: '#D97706',
		},
		Cancelled: {
			bg:
				themeStatus === 'dark'
					? 'inherit'
					: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
			color: '#DC2626',
		},
		Check: {
			bg:
				themeStatus === 'dark'
					? 'inherit'
					: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
			color: '#6B7280',
		},
	};

	return (
		styles[styleKey] || {
			bg:
				themeStatus === 'dark'
					? 'linear-gradient(135deg, #1F2128 0%, #2F3138 100%)'
					: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
			color: '#4B5563',
		}
	);
};

type StatusBadgeProps = {
	status?: string | null;
	label?: string | null;
	is_active?: boolean;
	isAvailable?: boolean;
	emptyFallback?: string;
};

const StatusBadge = ({
	status,
	label: labelOverride,
	is_active,
	isAvailable,
	emptyFallback,
}: StatusBadgeProps) => {
	const { themeStatus } = useDarkMode();
	const normalizedFromStatus = status ? normalizeStatusKey(status) : '';

	if (
		!normalizedFromStatus &&
		is_active === undefined &&
		isAvailable === undefined &&
		emptyFallback != null
	) {
		return <span className='text-muted small'>{emptyFallback}</span>;
	}

	let normalized = 'unknown';
	let label = '----';
	let styleKey = 'Check';
	let icon: TIcons = 'HelpOutline';

	if (normalizedFromStatus) {
		normalized = normalizedFromStatus;
		const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.unknown;
		styleKey = config.styleKey;
		icon = config.icon;
		label =
			(labelOverride && String(labelOverride).trim()) ||
			config.label ||
			toTitleCase(normalized);
	} else if (typeof is_active === 'boolean') {
		normalized = is_active ? 'active' : 'inactive';
		const config = STATUS_CONFIG[normalized];
		styleKey = config.styleKey;
		icon = config.icon;
		label = is_active ? 'Active' : 'Inactive';
	} else if (typeof isAvailable === 'boolean') {
		normalized = isAvailable ? 'active' : 'blocked';
		const config = STATUS_CONFIG[normalized];
		styleKey = config.styleKey;
		icon = config.icon;
		label = isAvailable ? 'Active' : 'Blocked';
	} else {
		const config = STATUS_CONFIG.unknown;
		styleKey = config.styleKey;
		icon = config.icon;
		label = (labelOverride && String(labelOverride).trim()) || config.label || 'Unknown';
	}

	const badgeStyles = getPillStyles(styleKey, themeStatus);

	return (
		<Tooltip title={label} arrow placement='top'>
			<span
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: '4px',
					padding: '2px 8px',
					background: badgeStyles.bg,
					color: badgeStyles.color,
					borderRadius: '12px',
					fontSize: '11px',
					fontWeight: 600,
					letterSpacing: '0.2px',
					lineHeight: 1.4,
					whiteSpace: 'nowrap',
				}}>
				<Icon
					icon={icon}
					className='flex-shrink-0'
					style={{
						fontSize: '13px',
						width: '1em',
						height: '1em',
						color: badgeStyles.color,
					}}
				/>
				{label}
			</span>
		</Tooltip>
	);
};

/* eslint-disable react/forbid-prop-types */
StatusBadge.propTypes = {
	status: PropTypes.string,
	label: PropTypes.string,
	is_active: PropTypes.bool,
	isAvailable: PropTypes.bool,
	emptyFallback: PropTypes.string,
};
/* eslint-enable react/forbid-prop-types */

StatusBadge.defaultProps = {
	status: null,
	label: null,
	is_active: undefined,
	isAvailable: undefined,
	emptyFallback: undefined,
};

export default StatusBadge;
