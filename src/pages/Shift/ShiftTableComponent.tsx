import React, { useMemo, useState } from 'react';
import MaterialTable from '@material-table/core';
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

const timeWithoutSeconds = (value: any) => {
	if (!value || typeof value !== 'string') return '----';
	const parts = value.split(':');
	if (parts.length < 2) return value;
	return `${parts[0]}:${parts[1]}`;
};

const yesNoBadge = (value: unknown) => <StatusBadge status={value ? 'yes' : 'no'} />;

const ShiftTableComponent = ({ tableRef, urlBackup, editModalToggle }: any) => {
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const columns = useMemo(
		() => [
			{ title: 'Name', field: 'name', render: (rowData: any) => rowData?.name || '----' },
			{
				title: 'Start Time',
				field: 'start_time',
				render: (rowData: any) => timeWithoutSeconds(rowData?.start_time),
			},
			{
				title: 'End Time',
				field: 'end_time',
				render: (rowData: any) => timeWithoutSeconds(rowData?.end_time),
			},
			{
				title: 'First in last out',
				field: 'first_in_last_out',
				render: (rowData: any) => yesNoBadge(rowData?.first_in_last_out),
			},
			{
				title: 'OT shift',
				field: 'is_ot_shift',
				render: (rowData: any) => yesNoBadge(rowData?.is_ot_shift),
			},
			// {
			// 	title: 'Auto In',
			// 	field: 'auto_in',
			// 	render: (rowData: any) => (rowData?.auto_in ? 'Yes' : 'No'),
			// },
			// {
			// 	title: 'Auto Out',
			// 	field: 'auto_out',
			// 	render: (rowData: any) => (rowData?.auto_out ? 'Yes' : 'No'),
			// },
			{
				title: 'Start Grace Period',
				field: 'start_grace_period_mins',
				render: (rowData: any) =>
					rowData?.start_grace_period_mins != null &&
					String(rowData.start_grace_period_mins).trim() !== ''
						? `${rowData.start_grace_period_mins} mins`
						: '----',
			},
			{
				title: 'End Grace Period',
				field: 'end_grace_period_mins',
				render: (rowData: any) =>
					rowData?.end_grace_period_mins != null &&
					String(rowData.end_grace_period_mins).trim() !== ''
						? `${rowData.end_grace_period_mins} mins`
						: '----',
			},
			{
				title: 'Remarks',
				field: 'remarks',
				sorting: false,
				render: (rowData: any) => rowData?.remarks?.trim() || '----',
			},
			{
				title: 'Minimum hours',
				field: 'minimum_hours',
				render: (rowData: any) =>
					rowData?.minimum_hours != null && String(rowData.minimum_hours).trim() !== ''
						? String(rowData.minimum_hours)
						: rowData?.total_hours ?? '----',
			},
			{
				title: 'OT eligible',
				field: 'ot_eligible',
				render: (rowData: any) => yesNoBadge(rowData?.ot_eligible),
			},
			{
				title: 'Max OT hours',
				field: 'ot_hours',
				render: (rowData: any) =>
					rowData?.ot_hours != null && rowData.ot_hours !== '' ? String(rowData.ot_hours) : '----',
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
							apiEndpoint={`api/hr/shifts/${rowData?.id}/`}
							tableRef={tableRef}
							text='This shift will be deleted.'
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
				<MaterialTable
					key={`${sortState.orderBy ?? 'no-order'}-${sortState.orderDirection}`}
					title=' '
					columns={columns as any}
					tableRef={tableRef}
					// onChangeRowsPerPage={setPageSize}
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
							const url = `/api/hr/shifts/?limit=${query.pageSize}&offset=${
								query.pageSize * query.page
							}&search=${query.search}${orderBy}&${otherFilters}`;

							urlBackup.current = url;
							authAxios
								.get(url)
								.then((response) => {
									resolve({
										data: response?.data?.results || [],
										page: query.page,
										totalCount: response?.data?.count || 0,
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

/* eslint-disable react/forbid-prop-types */
ShiftTableComponent.propTypes = {
	tableRef: PropTypes.object.isRequired,
	urlBackup: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};
/* eslint-enable react/forbid-prop-types */

export default ShiftTableComponent;
