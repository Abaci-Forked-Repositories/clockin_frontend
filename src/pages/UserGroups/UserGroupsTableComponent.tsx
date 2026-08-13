import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ResponsiveMaterialTable from '../../components/CustomComponent/Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import { authAxios } from '../../axiosInstance';
import useTablestyle from '../../hooks/useTablestyles';
import { formatFilters } from '../../helpers/functions';
import useToasterNotification from '../../hooks/useToasterNotification';
import EditButton from '../../components/CustomComponent/Buttons/EditButton';
import AuthContext from '../../contexts/authContext';
import { isAdminOrHrToggleMode } from '../../helpers/roleToggleUtils';

const UserGroupsTableComponent = ({ tableRef, urlBackup,editModalToggle }: any) => {
	const navigate = useNavigate();
	const { userData } = useContext(AuthContext);
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const canShowGroupActions = isAdminOrHrToggleMode(userData, mode);
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
				highlight: true,
				render: (rowData: any) => rowData?.name || '----',
			},
			{
				title: 'Type',
				field: 'type',
				highlight: true,
				render: (rowData: any) => rowData?.type || '----',
			},
			{
				title: 'Priority',
				field: 'priority_choice_number',
				render: (rowData: any) =>
					rowData?.priority_choice_number != null &&
					String(rowData.priority_choice_number).trim() !== ''
						? String(rowData.priority_choice_number)
						: '----',
			},
			{
				title: 'Parent Group',
				field: 'parent_group_name',
				sorting: false,
				render: (rowData: any) =>
					rowData?.parent_group_details?.name ||
					rowData?.parent_group_data?.name ||
					rowData?.parent_group_name ||
					'----',
			},
			{
				title: 'Lead One',
				field: 'lead_one_name',
				sorting: false,
				render: (rowData: any) =>
					rowData?.lead_one_details?.preferred_name ||
					rowData?.lead_one_details?.name ||
					rowData?.lead_one_name ||
					'----',
			},
			{
				title: 'Lead Two',
				field: 'lead_two_name',
				sorting: false,
				render: (rowData: any) =>
					rowData?.lead_two_details?.preferred_name ||
					rowData?.lead_two_details?.name ||
					rowData?.lead_two_name ||
					'----',
			},
			{
				title: 'Schedules',
				field: 'schedules',
				sorting: false,
				render: (rowData: any) => {
					const schedules = rowData?.schedules || [];
					return schedules.length ? schedules.map((schedule: any) => schedule?.name).join(', ') : '----';
				},
			},
			{
				title: 'Leave Types',
				field: 'leave_types',
				sorting: false,
				render: (rowData: any) => {
					const leaveTypes = rowData?.leave_types || [];
					return leaveTypes.length ? leaveTypes.map((leaveType: any) => leaveType?.name).join(', ') : '----';
				},
			}
		],
		[],
	);
	
	const columns = useMemo(() => {
		if (!canShowGroupActions) return staticColumns;
		return [
			...staticColumns,
			{
				title: 'Actions',
				align: 'right',
				removable: false,
				sorting: false,
				grouping: false,
				filtering: false,
				render: (rowData) => (
					<div className='d-flex gap-1 justify-content-end'>
						<EditButton modalShow={editModalToggle} id={rowData.id} />
					</div>
				),
			},
		];
    }, [staticColumns, canShowGroupActions, editModalToggle]);

	return (
		<div className='material-table-wrapper'>
			<ThemeProvider theme={theme}>
				<ResponsiveMaterialTable
					key={`${sortState.orderBy ?? 'no-order'}-${sortState.orderDirection}`}
					title=' '
					columns={columns as any}
					tableRef={tableRef}
					onRowClick={(_e, rowData: any) => {
						if (rowData?.id != null) navigate(`/group-details/${rowData.id}`);
					}}
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

							const url = `/api/hr/groups/?limit=${query.pageSize}&offset=${
								query.pageSize * query.page
							}&search=${query.search}${orderBy}&${otherFilters}`;

							urlBackup.current = url;
							authAxios
								.get(url)
								.then((response) => {
									const groups = response?.data?.results || [];
									resolve({
										data: groups,
										page: query.page,
										totalCount: response?.data?.count || 0,
									});
								})
								.catch((error) => {
									showErrorNotification(error);
									reject({
										data: [],
										page: query.page,
										totalCount: 0,
									});
								});
						})
					}
					actions={[
						{
							icon: FilterListIcon,
							tooltip: filterEnabled ? 'Disable Filter' : 'Enable Filter',
							isFreeAction: true,
							onClick: () => {
								setFilterEnabled((state) => !state);
							},
						},
					]}
					options={{
						headerStyle: headerStyles(),
						rowStyle: rowStyles(),
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
UserGroupsTableComponent.propTypes = {
	tableRef: PropTypes.object.isRequired,
	urlBackup: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};
/* eslint-enable react/forbid-prop-types */

export default UserGroupsTableComponent;
