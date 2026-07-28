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
import AssetRequestCommentsModal, {
	type AssetRequestCommentsContext,
} from './AssetRequestCommentsModal';
import AssetRequestItemsModal, {
	type AssetRequestItemsModalContext,
} from './AssetRequestItemsModal';
import {
	ASSET_REQUEST_STATUS_LOOKUP,
	assetRequestRowStatus,
	assetRequestStatusCode,
	isEditableAssetRequestStatus,
} from './assetRequestUtils';

type AssetRequestsProps = {
	tableRef: React.MutableRefObject<any>;
	urlBackup: React.MutableRefObject<string>;
	editModalToggle: (id: any) => void;
	statusFilter?: string | null;
};

const AssetRequests = ({
	tableRef,
	urlBackup,
	editModalToggle,
	statusFilter = null,
}: AssetRequestsProps) => {
	const { userData } = useContext(AuthContext);
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const isSelfMode = isSelfEquivalentMode(userData, mode);
	const userIdFilter = isSelfMode && userData?.id ? `user=${userData.id}` : '';
	const scopeFilters = userIdFilter;

	const [filterEnabled, setFilterEnabled] = useState(Boolean(statusFilter));
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const [commentsOpen, setCommentsOpen] = useState(false);
	const [commentsContext, setCommentsContext] = useState<AssetRequestCommentsContext | null>(null);
	const [itemsModalOpen, setItemsModalOpen] = useState(false);
	const [itemsModalContext, setItemsModalContext] =
		useState<AssetRequestItemsModalContext | null>(null);
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const openComments = useCallback((rowData: any) => {
		setCommentsContext({
			assetRequestId: rowData?.id,
			employeeName: rowData?.user?.name,
			description: rowData?.description,
			status: assetRequestRowStatus(rowData),
		});
		setCommentsOpen(true);
	}, []);

	const openItemsModal = useCallback((rowData: any) => {
		setItemsModalContext({
			assetRequestId: rowData?.id,
			employeeName: rowData?.user?.name,
			description: rowData?.description,
			overallStatus: assetRequestRowStatus(rowData),
		});
		setItemsModalOpen(true);
	}, []);

	const showEditAssetRequest = useCallback(
		(rowData: any) =>
			!isSelfMode ||
			isEditableAssetRequestStatus(
				assetRequestRowStatus(rowData),
				assetRequestStatusCode(rowData),
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
				title: 'Description',
				field: 'description',
				sorting: false,
				render: (rowData: any) => rowData?.description || '----',
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
				lookup: ASSET_REQUEST_STATUS_LOOKUP,
				...(statusFilter ? { defaultFilter: [statusFilter] } : {}),
				render: (rowData: any) => {
					const displayStatus = assetRequestRowStatus(rowData);
					return (
						<button
							type='button'
							className='btn btn-link p-0 border-0 text-decoration-none'
							onClick={(e) => {
								e.stopPropagation();
								openItemsModal(rowData);
							}}
							title='View requested items'>
							<StatusBadge
								status={assetRequestStatusCode(rowData) || displayStatus}
								emptyFallback='----'
							/>
						</button>
					);
				},
			},
		],
		[statusFilter, openItemsModal],
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
					<Tooltip arrow title='View requested items' placement='top'>
						<Button
							type='button'
							color='warning'
							isLight
							size='sm'
							icon='Visibility'
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								openItemsModal(rowData);
							}}
						/>
					</Tooltip>
					<Tooltip arrow title='Comments' placement='top'>
						<Button
							type='button'
							color='info'
							isLight
							size='sm'
							icon='Comment'
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								openComments(rowData);
							}}
						/>
					</Tooltip>
					{showEditAssetRequest(rowData) ? (
						<EditButton modalShow={editModalToggle} id={rowData.id} />
					) : null}
				</div>
			),
		};
		return [...staticColumns, actionColumn];
	}, [staticColumns, showEditAssetRequest, editModalToggle, openComments, openItemsModal]);

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
			<AssetRequestItemsModal
				isOpen={itemsModalOpen}
				setIsOpen={setItemsModalOpen}
				context={itemsModalContext}
				tableRef={tableRef}
			/>
			<AssetRequestCommentsModal
				isOpen={commentsOpen}
				setIsOpen={setCommentsOpen}
				context={commentsContext}
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

										const url = `/api/hr/asset-requests/?${scopeFilters ? `${scopeFilters}&` : ''}limit=${query.pageSize}&offset=${
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

AssetRequests.propTypes = {
	tableRef: PropTypes.object.isRequired,
	urlBackup: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
	statusFilter: PropTypes.string,
};

export default AssetRequests;
