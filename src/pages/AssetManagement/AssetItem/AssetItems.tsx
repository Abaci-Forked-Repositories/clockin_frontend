import React, { useMemo, useRef, useState } from 'react';
import ResponsiveMaterialTable from '../../../components/CustomComponent/Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../../../axiosInstance';
import useTablestyle from '../../../hooks/useTablestyles';
import { formatFilters } from '../../../helpers/functions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { buttonColor } from '../../../helpers/constants';
import { extractApiErrorMessage } from '../../../hooks/useErrorHandler';
import EditButton from '../../../components/CustomComponent/Buttons/EditButton';
import Button from '../../../components/bootstrap/Button';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';
import NavigationNameWithTooltip from '../../../components/CustomComponent/NavigationNameWithTooltip';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import AssetItemMovementsModal, {
	type AssetItemMovementsContext,
} from './AssetItemMovementsModal';

type AssetItemsProps = {
	tableRef: React.MutableRefObject<any>;
	editModalToggle: (id: any) => void;
};

const assetDetailPath = (id: string | number) => `/asset-details/${id}`;

const resolveRelatedName = (value: any, fallback?: string): string => {
	if (value != null && typeof value === 'object') {
		const pref = String(value.preferred_name || '').trim();
		if (pref) return pref;
		const full = [value.first_name, value.last_name].filter(Boolean).join(' ').trim();
		if (full) return full;
		return String(value.name || value.label || fallback || '----');
	}
	if (value != null && value !== '') return String(value);
	return fallback || '----';
};

const isConsumableRow = (rowData: any) =>
	Boolean(
		typeof rowData?.asset_type === 'object'
			? rowData.asset_type?.is_consumable
			: rowData?.is_consumable,
	);

const isReturnableAssetStatus = (rowData: any) => {
	const status = String(rowData?.status || '')
		.trim()
		.toUpperCase();
	return status === 'ASSIGNED' || status === 'IN_USE';
};

const canReturnAssetRow = (rowData: any) =>
	isReturnableAssetStatus(rowData) && !isConsumableRow(rowData);

const AssetItems = ({ tableRef, editModalToggle }: AssetItemsProps) => {
	const navigate = useNavigate();
	const urlBackup = useRef('');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const [movementsModalOpen, setMovementsModalOpen] = useState(false);
	const [movementsContext, setMovementsContext] = useState<AssetItemMovementsContext | null>(
		null,
	);
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const goToDetail = (rowData: any) => {
		const rowId = rowData?.id;
		if (rowId == null) return;
		navigate(assetDetailPath(rowId));
	};

	const openMovementsModal = (rowData: any) => {
		setMovementsContext({
			assetId: rowData?.id,
			assetName: rowData?.name,
			assetCode: rowData?.asset_code,
		});
		setMovementsModalOpen(true);
	};

	const handleReturnAsset = (rowData: any) => {
		const assetName = rowData?.name || rowData?.asset_code || `Asset ${rowData?.id}`;
		Swal.fire({
			title: 'Return asset?',
			icon: 'question',
			text: `Return “${assetName}” to available inventory.`,
			showCancelButton: true,
			iconColor: buttonColor[4],
			confirmButtonColor: buttonColor[3],
			cancelButtonColor: buttonColor[0],
			confirmButtonText: 'Return',
			cancelButtonText: 'Close',
			showLoaderOnConfirm: true,
			allowOutsideClick: () => !Swal.isLoading(),
			heightAuto: false,
			preConfirm: async () => {
				try {
					const response = await authAxios.patch(
						`/api/hr/asset-items/${rowData.id}/`,
						{ status: 'RETURNED' },
					);
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
		}).then((result) => {
			if (result.isConfirmed) {
				tableRef?.current?.onQueryChange?.();
			}
		});
	};

	const staticColumns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				render: (rowData: any) => {
					const name = rowData?.name || '----';
					if (rowData?.id == null) return name;
					return (
						<NavigationNameWithTooltip
							title={`View ${name} details`}
							navigateTo={assetDetailPath(rowData.id)}
							content={name}
							style={{ cursor: 'pointer', fontWeight: 600 }}
						/>
					);
				},
			},
			{
				title: 'Asset type',
				field: 'asset_type',
				sorting: false,
				render: (rowData: any) =>
					resolveRelatedName(rowData?.asset_type, rowData?.asset_type_name),
			},
			{
				title: 'Asset code',
				field: 'asset_code',
				render: (rowData: any) => rowData?.asset_code || '----',
			},
			{
				title: 'Serial number',
				field: 'serial_number',
				render: (rowData: any) => rowData?.serial_number || '----',
			},
			{
				title: 'Site',
				field: 'site',
				sorting: false,
				render: (rowData: any) => resolveRelatedName(rowData?.site, rowData?.site_name),
			},
			{
				title: 'Status',
				field: 'status',
				lookup: {
					AVAILABLE: 'Available',
					ASSIGNED: 'Assigned',
					IN_USE: 'In Use',
					MAINTENANCE: 'Under Maintenance',
					DAMAGED: 'Damaged',
					LOST: 'Lost',
					DISPOSED: 'Disposed',
				},
				render: (rowData: any) => (
					<span style={{ pointerEvents: 'none' }}>
						<StatusBadge
							status={rowData?.status}
							label={rowData?.status_display}
							emptyFallback='----'
						/>
					</span>
				),
			},
			{
				title: 'Assigned to',
				field: 'assigned_to',
				sorting: false,
				render: (rowData: any) => resolveRelatedName(rowData?.assigned_to),
			},
			{
				title: 'Quantity',
				field: 'quantity',
				render: (rowData: any) => {
					if (!isConsumableRow(rowData)) return '----';
					return rowData?.quantity != null && rowData?.quantity !== ''
						? String(rowData.quantity)
						: '----';
				},
			},
		],
		[],
	);

	const actionButtons = [
		{
			title: 'Actions',
			align: 'right',
			removable: false,
			sorting: false,
			grouping: false,
			filtering: false,
			render: (rowData: any) => (
				<div className='d-flex gap-1 justify-content-end align-items-center'>
					<Tooltip arrow title='View assignment' placement='top'>
						<Button
							type='button'
							color='warning'
							isLight
							size='sm'
							icon='Visibility'
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								openMovementsModal(rowData);
							}}
						/>
					</Tooltip>
					{canReturnAssetRow(rowData) ? (
						<Button
							isOutline={false}
							isLight
							size='sm'
							color='info'
							className='text-nowrap'
							icon='AssignmentReturn'
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								handleReturnAsset(rowData);
							}}>
							Return
						</Button>
					) : null}
					<EditButton modalShow={editModalToggle} id={rowData.id} />
				</div>
			),
		},
	];

	const columns = useMemo(
		() => [...staticColumns, ...actionButtons],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return (
		<>
			<AssetItemMovementsModal
				isOpen={movementsModalOpen}
				setIsOpen={setMovementsModalOpen}
				context={movementsContext}
			/>
			<Card stretch>
				<CardBody>
					<div className='material-table-wrapper'>
						<ThemeProvider theme={theme}>
							<ResponsiveMaterialTable
								key={`${sortState.orderBy ?? 'no-order'}-${sortState.orderDirection}`}
								title=' '
								columns={columns as any}
								tableRef={tableRef}
								onRowClick={(_event, rowData: any) => {
									goToDetail(rowData);
								}}
								onOrderChange={(orderBy, orderDirection) => {
									setSortState({ orderBy, orderDirection });
								}}
								data={(query) =>
									new Promise((resolve) => {
										let orderBy = '';
										const otherFilters = formatFilters(query.filters);
										if (query.orderBy) {
											orderBy =
												query.orderDirection === 'asc'
													? `&ordering=-${String(query.orderBy?.field)}`
													: `&ordering=${String(query.orderBy?.field)}`;
										}

										const url = `/api/hr/asset-items/?limit=${
											query.pageSize
										}&offset=${query.pageSize * query.page}&search=${
											query.search
										}${orderBy}&${otherFilters}`;

										urlBackup.current = url;
										authAxios
											.get(url)
											.then((response) => {
												const rows = response?.data?.results || [];
												resolve({
													data: rows,
													page: query.page,
													totalCount: response?.data?.count || 0,
												});
											})
											.catch((err) => {
												showErrorNotification(err);
												resolve({
													data: [],
													page: query.page,
													totalCount: 0,
												});
											});
									})
								}
								options={{
									filtering: filterEnabled,
									pageSize,
									pageSizeOptions: [5, 10, 20, 50],
									emptyRowsWhenPaging: true,
									debounceInterval: 500,
									headerStyle: headerStyles(),
									rowStyle: (data: any, index: number) => ({
										...(rowStyles()(data, index) || {}),
										cursor: 'pointer',
									}),
								}}
								onRowsPerPageChange={(size) => setPageSize(size)}
								actions={[
									{
										icon: () => (
											<FilterListIcon
												color={filterEnabled ? 'primary' : 'action'}
											/>
										),
										tooltip: 'Toggle filter',
										isFreeAction: true,
										onClick: () => setFilterEnabled((prev) => !prev),
									},
								]}
							/>
						</ThemeProvider>
					</div>
				</CardBody>
			</Card>
		</>
	);
};

AssetItems.propTypes = {
	tableRef: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};

export default AssetItems;
