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
import StatusBadge from '../../../components/CustomComponent/StatusBadge';
import Card, { CardBody } from '../../../components/bootstrap/Card';

type AssetTypesProps = {
	tableRef: React.MutableRefObject<any>;
	editModalToggle: (id: any) => void;
};

const yesNoBadge = (value: unknown) => <StatusBadge status={value ? 'yes' : 'no'} />;

const AssetTypes = ({ tableRef, editModalToggle }: AssetTypesProps) => {
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
				title: 'Description',
				field: 'description',
				sorting: false,
				render: (rowData: any) => rowData?.description || '----',
			},
			{
				title: 'Consumable',
				field: 'is_consumable',
				render: (rowData: any) => yesNoBadge(rowData?.is_consumable),
			},
			{
				title: 'Bookable',
				field: 'is_bookable',
				render: (rowData: any) => yesNoBadge(rowData?.is_bookable),
			},
			{
				title: 'Self Requestable',
				field: 'is_self_requestable',
				render: (rowData: any) => yesNoBadge(rowData?.is_self_requestable),
			},
			{
				title: 'User Selects Item',
				field: 'user_selects_item',
				render: (rowData: any) => yesNoBadge(rowData?.user_selects_item),
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

									const url = `/api/hr/asset-types/?limit=${
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
										<FilterListIcon color={filterEnabled ? 'primary' : 'action'} />
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

AssetTypes.propTypes = {
	tableRef: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};

export default AssetTypes;
