import React, { MutableRefObject } from 'react';
import Swal from 'sweetalert2';
import classNames from 'classnames';
import Button from '../../../components/bootstrap/Button';
import { authAxios } from '../../../axiosInstance';
import { buttonColor } from '../../../helpers/constants';
import { extractApiErrorMessage } from '../../../hooks/useErrorHandler';
import {
	assetRequestActionUrl,
	assetRequestItemActionUrl,
	type AssetRequestAction,
} from './assetRequestUtils';

const getActionConfirmText = (action: AssetRequestAction): string => {
	switch (action) {
		case 'approve':
			return 'The request will be approved and the requester will be notified.';
		case 'reject':
			return 'The request will be rejected and the requester will be notified.';
		case 'cancel':
			return 'This will cancel the request. This action cannot be undone.';
		case 'return':
			return 'This will mark the asset as returned.';
		default:
			return 'Please confirm to continue.';
	}
};

type AssetRequestActionButtonsProps = {
	id: number | string;
	itemId?: number | string | null;
	tableRef?: MutableRefObject<any> | null;
	onActionSuccess?: () => void;
	canApprove?: boolean;
	canReject?: boolean;
	canCancel?: boolean;
	canReturn?: boolean;
};

const AssetRequestActionButtons: React.FC<AssetRequestActionButtonsProps> = ({
	id,
	itemId = null,
	tableRef = null,
	onActionSuccess,
	canApprove,
	canReject,
	canCancel,
	canReturn,
}) => {
	const showApprove = Boolean(canApprove);
	const showReject = Boolean(canReject);
	const showCancel = Boolean(canCancel);
	const showReturn = Boolean(canReturn);

	if (!showApprove && !showReject && !showCancel && !showReturn) {
		return null;
	}

	const runAction = (label: string, colorIndex: number, action: AssetRequestAction) => {
		Swal.fire({
			title: `${label} item?`,
			icon: 'question',
			text: getActionConfirmText(action),
			showCancelButton: true,
			iconColor: buttonColor[4],
			confirmButtonColor: buttonColor[colorIndex],
			cancelButtonColor: buttonColor[0],
			confirmButtonText: label,
			cancelButtonText: 'Close',
			showLoaderOnConfirm: true,
			allowOutsideClick: () => !Swal.isLoading(),
			heightAuto: false,
			preConfirm: async () => {
				try {
					const url =
						itemId != null
							? assetRequestItemActionUrl(id, itemId, action)
							: assetRequestActionUrl(id, action);
					const response = await authAxios.post(url);
					if (onActionSuccess) {
						onActionSuccess();
					} else {
						tableRef?.current?.onQueryChange?.();
					}
					return response.data;
				} catch (error) {
					const apiMessage = extractApiErrorMessage(error);
					Swal.showValidationMessage(
						apiMessage ? `Request failed: ${apiMessage}` : 'Request failed. Please try again.',
					);
				}
			},
		});
	};

	return (
		<div className='d-inline-flex flex-row flex-nowrap gap-1 align-items-center'>
			{showApprove && (
				<Button
					isOutline={false}
					isLight
					size='sm'
					color='success'
					className={classNames('text-nowrap', { 'border-light': false })}
					icon='Done'
					onClick={() => runAction('Approve', 5, 'approve')}>
					Approve
				</Button>
			)}
			{showReject && (
				<Button
					isOutline={false}
					color='warning'
					isLight
					size='sm'
					className={classNames('text-nowrap', { 'border-light': false })}
					icon='Close'
					onClick={() => runAction('Reject', 4, 'reject')}>
					Reject
				</Button>
			)}
			{showCancel && (
				<Button
					isOutline={false}
					color='danger'
					isLight
					size='sm'
					className={classNames('text-nowrap', { 'border-light': false })}
					icon='Cancel'
					onClick={() => runAction('Cancel', 0, 'cancel')}>
					Cancel
				</Button>
			)}
			{showReturn && (
				<Button
					isOutline={false}
					color='info'
					isLight
					size='sm'
					className={classNames('text-nowrap', { 'border-light': false })}
					icon='AssignmentReturn'
					onClick={() => runAction('Return', 3, 'return')}>
					Return
				</Button>
			)}
		</div>
	);
};

export default AssetRequestActionButtons;
