import React, { useMemo, useState } from 'react';
import ResponsiveMaterialTable from '../../components/CustomComponent/Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditButton from '../../components/CustomComponent/Buttons/EditButton';
import DeleteButton from '../../components/CustomComponent/Buttons/DeleteButton';
import StatusBadge from '../../components/CustomComponent/StatusBadge';
import { authAxios } from '../../axiosInstance';
import useTablestyle from '../../hooks/useTablestyles';
import { formatFilters } from '../../helpers/functions';
import useToasterNotification from '../../hooks/useToasterNotification';
import {
	DEVICE_TYPE_OPTIONS,
	DIRECTION_OPTIONS,
	formatDoorLabel,
} from './doorConstants';

const DoorsTableComponent = ({ tableRef, urlBackup, editModalToggle }: any) => {
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const columns = useMemo(
		() => [
			{ title: 'Name', field: 'name', highlight: true, render: (rowData: any) => rowData?.name || '----' },
			{
				title: 'Entry Reader ID',
				field: 'entry_reader_id',
				render: (rowData: any) => rowData?.entry_reader_id || '----',
			},
			{
				title: 'Exit Reader ID',
				field: 'exit_reader_id',
				render: (rowData: any) => rowData?.exit_reader_id || '----',
			},
			{
				title: 'Device Type',
				field: 'device_type',
				render: (rowData: any) => formatDoorLabel(rowData?.device_type, DEVICE_TYPE_OPTIONS),
			},
			{
				title: 'Direction',
				field: 'direction',
				render: (rowData: any) => formatDoorLabel(rowData?.direction, DIRECTION_OPTIONS),
			},
			{
				title: 'Site',
				field: 'site_name',
				render: (rowData: any) =>
					rowData?.site_name ||
					(typeof rowData?.site === 'object' ? rowData.site?.name : null) ||
					'----',
			},
			{
				title: 'Status',
				field: 'status',
				highlight: true,
				render: (rowData: any) =>
					rowData?.status ? (
						<StatusBadge status={rowData.status} />
					) : (
						'----'
					),
			},
			{
				title: 'Actions',
				align: 'right' as const,
				removable: false,
				sorting: false,
				grouping: false,
				filtering: false,
				render: (rowData: any) => (
					<div className='d-flex gap-1 justify-content-end'>
						<EditButton modalShow={editModalToggle} id={rowData?.id} />
						<DeleteButton
							apiEndpoint={`api/hr/doors/${rowData?.id}/`}
							tableRef={tableRef}
							text='This door will be deleted.'
						/>
					</div>
				),
			},
		],
		[editModalToggle, tableRef],
	);

	return (
		<div className='material-table-wrapper'>
			<ThemeProvider theme={theme}>
				<ResponsiveMaterialTable
					key={`${sortState.orderBy ?? 'no-order'}-${sortState.orderDirection}`}
					title=' '
					columns={columns as any}
					tableRef={tableRef}
					onOrderChange={(orderBy, orderDirection) => {
						setSortState({ orderBy, orderDirection });
					}}
					data={(query) =>
						new Promise((resolve, reject) => {
							let orderBy = '';
							const otherFilters = formatFilters(query.filters);
							if (query.orderBy) {
								orderBy =
									query.orderDirection === 'asc'
										? `&ordering=-${String(query.orderBy?.field)}`
										: `&ordering=${String(query.orderBy?.field)}`;
							}
							const url = `/api/hr/doors/?limit=${query.pageSize}&offset=${
								query.pageSize * query.page
							}&search=${query.search}${orderBy}&${otherFilters}`;

							urlBackup.current = url;
							authAxios
								.get(url)
								.then((response) => {
									const data = Array.isArray(response?.data)
										? response.data
										: response?.data?.results || [];
									const totalCount = Array.isArray(response?.data)
										? response.data.length
										: response?.data?.count || 0;
									resolve({
										data,
										page: query.page,
										totalCount,
									});
								})
								.catch((error) => {
									showErrorNotification(error);
									reject({ data: [], page: query.page, totalCount: 0 });
								});
						})
					}
					actions={[
						{
							icon: FilterListIcon,
							tooltip: filterEnabled ? 'Disable Filter' : 'Enable Filter',
							isFreeAction: true,
							onClick: () => setFilterEnabled((state) => !state),
						},
					]}
					options={{
						headerStyle: headerStyles(),
						rowStyle: rowStyles(),
						actionsColumnIndex: -1,
						debounceInterval: 500,
						filtering: filterEnabled,
						search: true,
						pageSize,
					}}
				/>
			</ThemeProvider>
		</div>
	);
};

DoorsTableComponent.propTypes = {
	tableRef: PropTypes.object.isRequired,
	urlBackup: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};

export default DoorsTableComponent;
