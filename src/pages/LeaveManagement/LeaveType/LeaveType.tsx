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
import { CARRY_FORWARD_OPTIONS } from './LeaveTypeFields';

const carryForwardDisplayLabel = (raw: unknown): string => {
	const v = String(raw ?? '').trim().toUpperCase();
	const mapped = v === 'UNLIMITED' ? 'FULL' : v;
	const opt = CARRY_FORWARD_OPTIONS.find((o) => o.value === mapped);
	return opt?.label ?? (raw != null && String(raw).trim() !== '' ? String(raw) : '');
};

const formatClubbableWithCell = (rowData: any): string => {
	const list = rowData?.clubbable_with;
	if (!Array.isArray(list) || list.length === 0) return '----';
	const parts = list.map((x: any) => {
		if (x != null && typeof x === 'object') {
			return String(x.name || x.code || x.id || '').trim() || String(x.id);
		}
		return String(x);
	});
	return parts.filter(Boolean).join(', ') || '----';
};

const isTruthyYes = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1';
const yesNoBadge = (v: unknown) => <StatusBadge status={isTruthyYes(v) ? 'yes' : 'no'} />;

type LeaveTypeProps = {
	tableRef: React.MutableRefObject<any>;
	editModalToggle: (id: any) => void;
	onRowClick?: (rowData: any) => void;
};

const LeaveType = ({ tableRef, editModalToggle, onRowClick }: LeaveTypeProps) => {
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
				title: 'Days Allowed',
				field: 'days_allowed',
				render: (rowData: any) => rowData?.days_allowed ?? '----',
			},
			{
				title: 'Reset Cycle',
				field: 'reset_cycle',
				render: (rowData: any) => rowData?.reset_cycle || '----',
			},
			{
				title: 'Carry Forward',
				field: 'carry_forward',
				render: (rowData: any) => carryForwardDisplayLabel(rowData?.carry_forward) || '----',
			},
			{
				title: 'Carry Fwd Max Days',
				field: 'carry_forward_max_days',
				render: (rowData: any) => rowData?.carry_forward_max_days ?? '----',
			},
			{
				title: 'Max Consecutive Days',
				field: 'max_consecutive_days',
				render: (rowData: any) => rowData?.max_consecutive_days ?? '----',
			},
			{
				title: 'Advance Notice Days',
				field: 'advance_notice_days',
				render: (rowData: any) => rowData?.advance_notice_days ?? '----',
			},
			{
				title: 'Payment Type',
				field: 'is_paid',
				render: (rowData: any) => (rowData?.is_paid ? 'Paid' : 'Unpaid'),
			},
			{
				title: 'Requirements',
				field: 'requires_document',
				render: (rowData: any) => (rowData?.requires_document ? 'Document Required' : 'Document Not Required'),
			},
			{
				title: 'Clubbing',
				field: 'clubbing_allowed',
				render: (rowData: any) => yesNoBadge(rowData?.clubbing_allowed),
			},
			{
				title: 'Clubbable with',
				field: 'clubbable_with',
				sorting: false,
				render: (rowData: any) => formatClubbableWithCell(rowData),
			},
			{
				title: 'Sandwich',
				field: 'sandwich_applicable',
				render: (rowData: any) => yesNoBadge(rowData?.sandwich_applicable),
			},
		
		],
		[],
	);
	
	const actionButtons =[
		{
			title: 'Actions',
			align: 'right',
			removable: false,
			sorting: false,
			grouping: false,
			filtering: false,
			render: (rowData) => (
				<div className='d-flex gap-1 justify-content-end'>
					{/* {rowData?.meta_data?.status !== 'Invited' && (
						<StatusButton
							status={rowData.meta_data.status}
							fieldKey='status'
							tableRef={tableRef}
							api={`api/users/${rowData.id}`}
						/>
					)}

                    {rowData?.meta_data?.status === 'Invited' && (
                         <ResendButton id={rowData.id}/>						
					)} */}
					<EditButton modalShow={editModalToggle} id={rowData.id} />
				</div>
			),
		},
	]

	const columns = useMemo(() => {
        return [...staticColumns , ...actionButtons];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
					onRowClick={
						onRowClick
							? (_event, rowData: any) => {
									if (rowData?.id != null) onRowClick(rowData);
								}
							: undefined
					}
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

							const url = `/api/hr/leave-types/?limit=${query.pageSize}&offset=${
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
						rowStyle: () => ({
							...rowStyles(),
							...(onRowClick ? { cursor: 'pointer' } : {}),
						}),
						debounceInterval: 500,
						filtering: filterEnabled,
						search: true,
						pageSize,
					}}
				/>
			
			</ThemeProvider>
		</div>
			</CardBody>
		</Card>
	);
};

/* eslint-disable react/forbid-prop-types */
LeaveType.propTypes = {
	tableRef: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
	onRowClick: PropTypes.func,
};
/* eslint-enable react/forbid-prop-types */

export default LeaveType;
