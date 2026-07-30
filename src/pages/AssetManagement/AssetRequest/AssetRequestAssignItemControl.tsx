import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import Button from '../../../components/bootstrap/Button';
import { authAxios } from '../../../axiosInstance';
import { buttonColor } from '../../../helpers/constants';
import { extractApiErrorMessage } from '../../../hooks/useErrorHandler';
import useSelectStyles from '../../../hooks/useSelectStyle';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	mapAssetItemToOption,
	toList,
	type AssetItemOption,
} from './assetRequestItemUtils';
import { assetRequestItemActionUrl } from './assetRequestUtils';

type AssignAssetItemOption = AssetItemOption & {
	status?: string;
	status_display?: string;
	isDisabled?: boolean;
};

const isAssetItemAvailable = (status: unknown) =>
	String(status || '')
		.trim()
		.toUpperCase() === 'AVAILABLE';

const mapAssignAssetItemOption = (item: any): AssignAssetItemOption => {
	const base = mapAssetItemToOption(item);
	const status = String(item?.status || item?.status_code || '')
		.trim()
		.toUpperCase();
	const statusDisplay =
		String(item?.status_display || item?.status || status || '')
			.trim() || '----';
	const available = isAssetItemAvailable(status);

	return {
		...base,
		status,
		status_display: statusDisplay,
		isDisabled: !available,
	};
};

type AssetRequestAssignItemControlProps = {
	requestId: number | string;
	itemId: number | string;
	assetTypeId: number | string | null;
	onAssigned: () => void;
};

const AssetRequestAssignItemControl = ({
	requestId,
	itemId,
	assetTypeId,
	onAssigned,
}: AssetRequestAssignItemControlProps) => {
	const { showErrorNotification } = useToasterNotification();
	const showErrorRef = useRef(showErrorNotification);
	showErrorRef.current = showErrorNotification;
	const reactSelectStyle = useSelectStyles(false);
	const selectStyles = useMemo(() => {
		const existingMenuPortal = (reactSelectStyle as { menuPortal?: (base: any) => any })
			.menuPortal;
		return {
			...reactSelectStyle,
			menuPortal: (base: Record<string, unknown>) => ({
				...(typeof existingMenuPortal === 'function' ? existingMenuPortal(base) : base),
				zIndex: 9999,
			}),
			option: (base: Record<string, unknown>, state: { isDisabled?: boolean }) => {
				const optionStyle =
					typeof (reactSelectStyle as { option?: Function }).option === 'function'
						? (reactSelectStyle as { option: Function }).option(base, state)
						: base;
				return {
					...optionStyle,
					...(state.isDisabled
						? { opacity: 0.55, cursor: 'not-allowed' }
						: { cursor: 'pointer' }),
				};
			},
		};
	}, [reactSelectStyle]);

	const [options, setOptions] = useState<AssignAssetItemOption[]>([]);
	const [selected, setSelected] = useState<AssignAssetItemOption | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (assetTypeId == null || assetTypeId === '') {
			setOptions([]);
			setSelected(null);
			return undefined;
		}

		let cancelled = false;
		setLoading(true);
		setSelected(null);

		authAxios
			.get('/api/hr/asset-items/', {
				params: { asset_type: assetTypeId, paginate: 'off' },
			})
			.then((res) => {
				if (cancelled) return;
				setOptions(toList(res?.data).map(mapAssignAssetItemOption));
			})
			.catch((err) => {
				if (!cancelled) {
					setOptions([]);
					showErrorRef.current(err);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [assetTypeId]);

	const handleAssign = () => {
		if (!selected?.value || selected.isDisabled) {
			Swal.fire({
				icon: 'warning',
				title: 'Select an available asset',
				text: 'Only assets with status Available can be assigned.',
				confirmButtonColor: buttonColor[4],
				heightAuto: false,
			});
			return;
		}

		Swal.fire({
			title: 'Assign item?',
			icon: 'question',
			text: `Assign “${selected.label}” to this request item.`,
			showCancelButton: true,
			iconColor: buttonColor[4],
			confirmButtonColor: buttonColor[5],
			cancelButtonColor: buttonColor[0],
			confirmButtonText: 'Assign',
			cancelButtonText: 'Close',
			showLoaderOnConfirm: true,
			allowOutsideClick: () => !Swal.isLoading(),
			heightAuto: false,
			preConfirm: async () => {
				try {
					const response = await authAxios.post(
						assetRequestItemActionUrl(requestId, itemId, 'approve'),
						{ asset_item: selected.value },
					);
					onAssigned();
					return response.data;
				} catch (error) {
					const apiMessage = extractApiErrorMessage(error);
					Swal.showValidationMessage(
						apiMessage
							? `Request failed: ${apiMessage}`
							: 'Request failed. Please try again.',
					);
				}
			},
		});
	};

	return (
		<div className='d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 w-100'>
			<div className='flex-grow-1' style={{ minWidth: 0 }}>
				<Select
					className='react-select'
					classNamePrefix='react-select'
					placeholder={loading ? 'Loading assets…' : 'Select asset to assign'}
					isLoading={loading}
					isClearable
					options={options}
					value={selected}
					isOptionDisabled={(opt) => Boolean((opt as AssignAssetItemOption).isDisabled)}
					formatOptionLabel={(option, { context }) => {
						const item = option as AssignAssetItemOption;
						if (context === 'menu' && item.status_display) {
							return `${item.label} — ${item.status_display}`;
						}
						return item.label;
					}}
					onChange={(opt) => setSelected((opt as AssignAssetItemOption) || null)}
					menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
					styles={selectStyles}
				/>
			</div>
			<Button
				isOutline={false}
				isLight
				size='sm'
				color='info'
				className='text-nowrap align-self-md-center'
				icon='Assignment'
				onClick={handleAssign}>
				Assign
			</Button>
		</div>
	);
};

export default AssetRequestAssignItemControl;
