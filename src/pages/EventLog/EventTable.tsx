import React, { useMemo, useState } from 'react';
import ResponsiveMaterialTable from '../../components/CustomComponent/Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditButton from '../../components/CustomComponent/Buttons/EditButton';
import DeleteButton from '../../components/CustomComponent/Buttons/DeleteButton';
import { authAxios } from '../../axiosInstance';
import useTablestyle from '../../hooks/useTablestyles';
import { formatFilters } from '../../helpers/functions';
import useToasterNotification from '../../hooks/useToasterNotification';
import Moments from '../../helpers/Moment';

const getEventTime = (rowData: any, eventType: string) => {
	const event = rowData?.events?.find((item: any) => item?.event_type === eventType);
	const timestamp = event?.timestamp;
	return Moments(timestamp , 'time') || '----';
};

const formatPersonName = (person: any): string => {
	if (person == null) return '----';
	if (typeof person === 'string') {
		const s = person.trim();
		return s || '----';
	}
	const first = String(person?.first_name || '').trim();
	const last = String(person?.last_name || '').trim();
	const full = [first, last].filter(Boolean).join(' ').trim();
	if (full) return full;
	const fallback = String(person?.name || person?.full_name || person?.email || '').trim();
	return fallback || '----';
};

const EventTableComponent = ({ tableRef, urlBackup, editModalToggle }: any) => {
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const columns = useMemo(
		() => [
			{ title: 'Date', field: 'timestamp', highlight: true, render: (rowData: any) => Moments(rowData?.timestamp, 'date') || '----' },
            { title: 'Time', field: 'timestamp', render: (rowData: any) => Moments(rowData?.timestamp, 'time') || '----' },
		
			{
				title: 'User',
				field: 'user',
				highlight: true,
				render: (rowData: any) => formatPersonName(rowData?.user),
			},
			
			{
				title: 'Event ',
				field: 'event_type',
				highlight: true,
				render: (rowData: any) => rowData?.event_type || '----',
			},
            {
                title: 'Method',
                field: 'method',
                render: (rowData: any) => rowData?.method || '----',
            },
            {
                title: 'Entered By',
                field: 'entered_by',
                render: (rowData: any) => formatPersonName(rowData?.entered_by),
            }
		
			// {
			// 	title: 'Actions',
			// 	align: 'right' as const,
			// 	removable: false,
			// 	sorting: false,
			// 	grouping: false,
			// 	filtering: false,
			// 	render: (rowData: any) => (
			// 		<div className='d-flex gap-1 justify-content-end'>
			// 			<EditButton modalShow={editModalToggle} id={rowData?.id} />
			// 			<DeleteButton
			// 				apiEndpoint={`/api/users/clock/portal/${rowData?.id}/`}
			// 				tableRef={tableRef}
			// 				text='This attendance record will be deleted.'
			// 			/>
			// 		</div>
			// 	),
			// },
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
							const url = `/api/hr/attendance-events/?limit=${query.pageSize}&offset=${
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
EventTableComponent.propTypes = {
	tableRef: PropTypes.object.isRequired,
	urlBackup: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};
/* eslint-enable react/forbid-prop-types */

export default EventTableComponent;
