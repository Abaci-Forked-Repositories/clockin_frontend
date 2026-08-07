import React, { useContext, useMemo, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import { authAxios } from '../../../axiosInstance';
import useTablestyle from '../../../hooks/useTablestyles';
import { formatFilters, resolveTableRowUserId, userDetailsPath } from '../../../helpers/functions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../contexts/authContext';
import { isAdminOrHrToggleMode, resolveTenantRouteRole } from '../../../helpers/roleToggleUtils';
import { useSelector } from 'react-redux';
import EditButton from '../../CustomComponent/Buttons/EditButton';
import ImageCell from '../../CustomComponent/Imagecell';
import { resolveUserAvatarSource } from '../../../helpers/functions';
import Moments from '../../../helpers/Moment';
import StatusBadge from '../../CustomComponent/StatusBadge';

const UserManagementTableComponent = (props) => {
	const { tableRef, editModalToggle ,urlBackup,tenant,activeTab} = props;
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();
	const { userData } = useContext(AuthContext);
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const canShowUserActions = isAdminOrHrToggleMode(userData, mode);
	const navigate = useNavigate();


	const staticColumns  = [
		{
			title: 'Image',
			field: 'avatar',
			sorting: false,
			filtering: false,
			render: (rowData) => <ImageCell fullImage={resolveUserAvatarSource(rowData)} />,
		},
		{
			title: 'Name',
			field: 'first_name',
			render: (rowData) =>
				`${rowData?.first_name || ''} ${rowData?.last_name || ''}`.trim()
				|| rowData?.preferred_name
				|| '----',
		},
		{
			title: 'Employee Code',
			field: 'employee_code',
			render: (rowData) => (rowData?.employee_code || '----'),
		},
		{
			title: 'Current Status',
			field: 'current_clockin_status',
			render: (rowData) =>
				rowData?.current_clockin_status
					? String(rowData.current_clockin_status).replace(/_/g, ' ')
					: '----',
		},
		{
			title: 'Role',
			field: 'tenant_role',
			sorting: false,
			render: (rowData) => {
				const role = resolveTenantRouteRole(rowData);
				return role === 'user' ? 'Employee' : role;
			},
		},
		{
			title: 'Gender',
			field: 'gender',
			render: (rowData) => (rowData?.gender || '----'),
		},
		{
			title: 'Joined Date',
			field: 'joined_date',
			render: (rowData) =>
				rowData?.joined_date ? Moments(rowData.joined_date, 'date') : '----',
		},
		{
			title: 'Email',
			field: 'email',
			render: (rowData) => (rowData?.email || '----'),
		},
		{
			title: 'Personal Contact',
			field: 'personal_contact_number',
			render: (rowData) => (rowData?.personal_contact_number || '----'),
		},
		{
			title: 'Office Contact',
			field: 'office_contact_number',
			render: (rowData) => (rowData?.office_contact_number || '----'),
		},
		{
			title: 'City',
			field: 'city',
			render: (rowData) => (rowData?.city || '----'),
		},
		{
			title: 'State',
			field: 'state',
			render: (rowData) => (rowData?.state || '----'),
		},
		{
			title: 'Country',
			field: 'country',
			render: (rowData) => (rowData?.country || '----'),
		},
		{
			title: 'Group',
			field: 'group__name',
			render: (rowData) => (rowData?.group?.name || '----'),
		},
		{
			title: 'Schedules',
			field: 'schedules',
			sorting: false,
			render: (rowData) => {
				const schedules = Array.isArray(rowData?.schedules) ? rowData.schedules : [];
				const names = schedules
					.map((schedule: any) =>
						typeof schedule === 'object' ? schedule?.name : null,
					)
					.filter(Boolean);
				return names.length ? names.join(', ') : '----';
			},
		},
		{
			title: 'Site',
			field: 'site__name',
			render: (rowData) => (rowData?.site?.name || '----'),
		},
		{
			title: 'HR Incharge',
			field: 'hr_manager__name',
			render: (rowData) => (rowData?.hr_manager?.name || '----'),
		},
		{
			title: 'Reporting Manager',
			field: 'reporting_manager__name',
			render: (rowData) => (rowData?.reporting_manager?.name || '----'),
		},
		{
			title: 'Status',
			field: 'status',
			render: (rowData) => (rowData?.status ? (
				<StatusBadge status={rowData?.status}  emptyFallback='----'></StatusBadge>
			) : null),
		},
	];

	const actionButtons = canShowUserActions ? [
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
	]:[];

	const columns = useMemo(() => {
		return [...staticColumns, ...actionButtons];
	}, [canShowUserActions]);


	
	return (
		 <div className='material-table-wrapper'>
			<ThemeProvider theme={theme}>
				<MaterialTable
					key={`${activeTab}-${tenant?.id || 'no-tenant'}-${sortState.orderBy ?? 'no-order'}-${sortState.orderDirection}`}
					title=' '
					//@ts-ignore
					columns={columns}
					tableRef={tableRef}
					onChangeRowsPerPage={setPageSize}
					onRowClick={(_event, rowData) => {
						const userId = resolveTableRowUserId(rowData);
						if (userId != null) navigate(userDetailsPath(userId));
					}}
					onOrderChange={(orderBy, orderDirection) => {
						setSortState({ orderBy, orderDirection });
					}}
					data={(query) => {
						return new Promise((resolve, reject) => {
							let orderBy = '';
							const otherFilters = formatFilters(query.filters);
							if (query.orderBy) {
								orderBy =
									query.orderDirection === 'asc'
										? `&ordering=-${String(query.orderBy?.field)}`
										: `&ordering=${String(query.orderBy?.field)}`;
							}
							let url = `/api/hr/accounts/?limit=${
								query.pageSize
							}&offset=${query.pageSize * query.page}&search=${query.search}${orderBy}&${otherFilters}`;
							if(activeTab !== 'All'){
								url += `&tenant_id=${tenant?.id}`;
							}
							urlBackup.current = url;
							authAxios
								.get(url)
								.then((response) => {
									const userList = response.data?.results;
									resolve({
										data: userList,
										page: query.page,
										totalCount: response.data?.count,
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
						});
					}}
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
						rowStyle: () => ({
							...rowStyles(),
							cursor: 'pointer',
						}),
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
UserManagementTableComponent.propTypes = {
	tableRef: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
	urlBackup: PropTypes.object.isRequired,
};
export default UserManagementTableComponent;
