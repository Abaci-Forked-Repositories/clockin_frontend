import React, { useMemo, useState } from 'react';
import ResponsiveMaterialTable from '../../components/CustomComponent/Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditButton from '../../components/CustomComponent/Buttons/EditButton';
import { authAxios } from '../../axiosInstance';
import useTablestyle from '../../hooks/useTablestyles';
import { formatFilters } from '../../helpers/functions';
import useToasterNotification from '../../hooks/useToasterNotification';

const isEditable = (row: any) =>
	row?.is_editable === true ||
	row?.is_editable === 'true' ||
	row?.is_editable === 1 ||
	row?.is_editable === '1';

const RoleTableComponent = ({ tableRef, urlBackup, editModalToggle }: any) => {
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const columns = useMemo(
		() => [
			{
				title: 'Role Name',
				field: 'role_name',
				render: (rowData: any) => rowData?.role_name || '----',
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
						{isEditable(rowData) ? (
							<EditButton modalShow={editModalToggle} id={rowData?.id} />
						) : (
                            null
						)}
					</div>
				),
			},
		],
		[editModalToggle],
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
							const url = `/api/hr/roles/?limit=${query.pageSize}&offset=${
								query.pageSize * query.page
							}&search=${encodeURIComponent(query.search || '')}${orderBy}&${otherFilters}`;

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
RoleTableComponent.propTypes = {
	tableRef: PropTypes.object.isRequired,
	urlBackup: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};
/* eslint-enable react/forbid-prop-types */

export default RoleTableComponent;
