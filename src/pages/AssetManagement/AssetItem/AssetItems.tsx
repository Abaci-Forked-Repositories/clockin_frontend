import React, { useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import { authAxios } from '../../../axiosInstance';
import useTablestyle from '../../../hooks/useTablestyles';
import { formatFilters } from '../../../helpers/functions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import EditButton from '../../../components/CustomComponent/Buttons/EditButton';
import Card, { CardBody } from '../../../components/bootstrap/Card';

type AssetItemsProps = {
	tableRef: React.MutableRefObject<any>;
	editModalToggle: (id: any) => void;
};

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

const AssetItems = ({ tableRef, editModalToggle }: AssetItemsProps) => {
	const urlBackup = useRef('');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const staticColumns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				render: (rowData: any) => rowData?.name || '----',
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
				render: (rowData: any) =>
					rowData?.status_display || rowData?.status || '----',
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
				<div className='d-flex gap-1 justify-content-end'>
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
		<Card stretch>
			<CardBody>
				<div className='material-table-wrapper'>
					<ThemeProvider theme={theme}>
						<MaterialTable
							key={`${sortState.orderBy ?? 'no-order'}-${sortState.orderDirection}`}
							title=' '
							columns={columns as any}
							tableRef={tableRef}
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
								rowStyle: rowStyles as any,
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
	);
};

AssetItems.propTypes = {
	tableRef: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};

export default AssetItems;
