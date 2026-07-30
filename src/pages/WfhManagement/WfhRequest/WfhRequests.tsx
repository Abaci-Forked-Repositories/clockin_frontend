import React, { useCallback, useContext, useMemo, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useSelector } from 'react-redux';
import { authAxios } from '../../../axiosInstance';
import useTablestyle from '../../../hooks/useTablestyles';
import { formatFilters } from '../../../helpers/functions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AuthContext from '../../../contexts/authContext';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';
import EditButton from '../../../components/CustomComponent/Buttons/EditButton';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import { isSelfEquivalentMode } from '../../../helpers/roleToggleUtils';
import WfhRequestActionButtons from './WfhRequestActionButtons';
import WfhApprovalTimelineModal, {
	type WfhApprovalTimelineContext,
} from './WfhApprovalTimelineModal';
import {
	WFH_REQUEST_STATUS_LOOKUP,
	isEditableWfhRequestStatus,
	wfhRequestRowStatus,
	wfhRequestStatusCode,
} from './wfhRequestUtils';

type WfhRequestsProps = {
	tableRef: React.MutableRefObject<any>;
	urlBackup: React.MutableRefObject<string>;
	editModalToggle: (id: any) => void;
	statusFilter?: string | null;
};

const WfhRequests = ({
	tableRef,
	urlBackup,
	editModalToggle,
	statusFilter = null,
}: WfhRequestsProps) => {
	const { userData } = useContext(AuthContext);
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const isSelfMode = isSelfEquivalentMode(userData, mode);
	const userIdFilter = isSelfMode && userData?.id ? `user=${userData.id}` : '';
	const scopeFilters = userIdFilter;

	const [filterEnabled, setFilterEnabled] = useState(Boolean(statusFilter));
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const [timelineOpen, setTimelineOpen] = useState(false);
	const [timelineContext, setTimelineContext] = useState<WfhApprovalTimelineContext | null>(null);
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const openApprovalTimeline = useCallback((rowData: any) => {
		setTimelineContext({
			wfhRequestId: rowData?.id,
			employeeName: rowData?.user?.name,
			reason: rowData?.reason,
			startDate: rowData?.start_date,
			endDate: rowData?.end_date,
			overallStatus: wfhRequestRowStatus(rowData),
		});
		setTimelineOpen(true);
	}, []);

	const showEditWfhRequest = useCallback(
		(rowData: any) =>
			!isSelfMode ||
			isEditableWfhRequestStatus(
				wfhRequestRowStatus(rowData),
				wfhRequestStatusCode(rowData),
			),
		[isSelfMode],
	);

	const staticColumns = useMemo(
		() => [
			{
				title: 'Employee',
				field: 'user__name',
				render: (rowData: any) => rowData?.user?.name || '----',
			},
			{
				title: 'Start date',
				field: 'start_date',
				render: (rowData: any) => rowData?.start_date || '----',
			},
			{
				title: 'End date',
				field: 'end_date',
				render: (rowData: any) => rowData?.end_date || '----',
			},
			{
				title: 'Reason',
				field: 'reason',
				sorting: false,
				render: (rowData: any) => rowData?.reason || '----',
			},
			{
				title: 'Requested on',
				field: 'created_at',
				render: (rowData: any) => {
					const raw = rowData?.created_at || rowData?.requested_at;
					if (!raw) return '----';
					return String(raw).slice(0, 10);
				},
			},
			{
				title: 'Status',
				field: 'status_code',
				lookup: WFH_REQUEST_STATUS_LOOKUP,
				...(statusFilter ? { defaultFilter: [statusFilter] } : {}),
				render: (rowData: any) => {
					const displayStatus = wfhRequestRowStatus(rowData);
					return (
						<StatusBadge
							status={wfhRequestStatusCode(rowData) || displayStatus}
							emptyFallback='----'
						/>
					);
				},
			},
		],
		[statusFilter],
	);

	const columns = useMemo(() => {
		const actionColumn = {
			title: 'Actions',
			align: 'right',
			removable: false,
			sorting: false,
			grouping: false,
			filtering: false,
			render: (rowData: any) => (
				<div className='d-flex flex-row flex-nowrap gap-1 justify-content-end align-items-center'>
					{!isSelfMode ? (
						<WfhRequestActionButtons
							id={rowData.id}
							tableRef={tableRef}
							canApprove={rowData?.actions?.can_approve}
							canReject={rowData?.actions?.can_reject}
							canCancel={rowData?.actions?.can_cancel}
						/>
					) : null}
					<Tooltip arrow title='View approval status' placement='top'>
						<Button
							type='button'
							color='warning'
							isLight
							size='sm'
							icon='Visibility'
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								openApprovalTimeline(rowData);
							}}
						/>
					</Tooltip>
					{showEditWfhRequest(rowData) ? (
						<EditButton modalShow={editModalToggle} id={rowData.id} />
					) : null}
				</div>
			),
		};
		return [...staticColumns, actionColumn];
	}, [staticColumns, isSelfMode, showEditWfhRequest, tableRef, editModalToggle, openApprovalTimeline]);

	const tableActions = useMemo(
		() => [
			{
				icon: FilterListIcon,
				tooltip: filterEnabled ? 'Disable Filter' : 'Enable Filter',
				isFreeAction: true,
				onClick: () => {
					setFilterEnabled((state) => !state);
				},
			},
		],
		[filterEnabled],
	);

	const tableOptions = useMemo(
		() => ({
			headerStyle: headerStyles(),
			rowStyle: rowStyles(),
			debounceInterval: 500,
			filtering: filterEnabled,
			search: true,
			pageSize,
		}),
		[filterEnabled, pageSize, headerStyles, rowStyles],
	);

	return (
		<>
			<WfhApprovalTimelineModal
				isOpen={timelineOpen}
				setIsOpen={setTimelineOpen}
				context={timelineContext}
			/>
			<Card stretch>
			<CardBody>
				<div className='material-table-wrapper'>
					<ThemeProvider theme={theme}>
						<MaterialTable
							key={`${sortState.orderBy ?? 'no-order'}-${sortState.orderDirection}-${statusFilter ?? ''}`}
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

									const url = `/api/hr/wfh-requests/?${scopeFilters ? `${scopeFilters}&` : ''}limit=${query.pageSize}&offset=${
										query.pageSize * query.page
									}&search=${query.search}${orderBy}&${otherFilters}`;

									urlBackup.current = url;
									authAxios
										.get(url)
										.then((response) => {
											const results = response?.data?.results || [];
											resolve({
												data: results,
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
							actions={tableActions}
							options={tableOptions}
						/>
					</ThemeProvider>
				</div>
			</CardBody>
		</Card>
		</>
	);
};

WfhRequests.propTypes = {
	tableRef: PropTypes.object.isRequired,
	urlBackup: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
	statusFilter: PropTypes.string,
};

export default WfhRequests;
