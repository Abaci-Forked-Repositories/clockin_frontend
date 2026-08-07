import React, { useMemo, useRef, useState } from 'react';
import MaterialTable from '@material-table/core';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../../../axiosInstance';
import useTablestyle from '../../../hooks/useTablestyles';
import { formatFilters } from '../../../helpers/functions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import StatusBadge from '../../../components/CustomComponent/StatusBadge';
import NavigationNameWithTooltip from '../../../components/CustomComponent/NavigationNameWithTooltip';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import { formatSiteTimezone } from '../../Site/SiteDetails/SiteDetails';
import { pagesNotInSideBar } from '../../../routes/RoutesMenu';

type BookAssetsListProps = {
	tableRef: React.MutableRefObject<any>;
};

const bookAssetDetailPath = (id: string | number) =>
	pagesNotInSideBar.BookAssetDetail.path.replace(':id', String(id));

const resolveRelatedName = (value: any, fallback?: string): string => {
	if (value != null && typeof value === 'object') {
		const pref = String(value.preferred_name || '').trim();
		if (pref) return pref;
		const full = [value.first_name, value.last_name].filter(Boolean).join(' ').trim();
		if (full) return full;
		return String(value.name || value.label || fallback || '----');
	}
	if (value != null && value !== '') return String(value);
	return fallback || '----';
};

const resolveSiteTimezone = (rowData: any): string => {
	const site =
		rowData?.site != null && typeof rowData.site === 'object'
			? (rowData.site as Record<string, unknown>)
			: null;
	return formatSiteTimezone(site) || '----';
};

const BookAssetsList = ({ tableRef }: BookAssetsListProps) => {
	const navigate = useNavigate();
	const urlBackup = useRef('');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const goToDetail = (rowData: any) => {
		const rowId = rowData?.id;
		if (rowId == null) return;
		navigate(bookAssetDetailPath(rowId));
	};

	const columns = useMemo(
		() => [
			{
				title: 'Name',
				field: 'name',
				render: (rowData: any) => {
					const name = rowData?.name || '----';
					if (rowData?.id == null) return name;
					return (
						<NavigationNameWithTooltip
							title={`View ${name} booking calendar`}
							navigateTo={bookAssetDetailPath(rowData.id)}
							content={name}
							style={{ cursor: 'pointer', fontWeight: 600 }}
						/>
					);
				},
			},
			{
				title: 'Asset type',
				field: 'asset_type',
				sorting: false,
				render: (rowData: any) =>
					resolveRelatedName(rowData?.asset_type, rowData?.asset_type_name),
			},
			{
				title: 'Asset code',
				field: 'asset_code',
				render: (rowData: any) => rowData?.asset_code || '----',
			},
			{
				title: 'Serial number',
				field: 'serial_number',
				render: (rowData: any) => rowData?.serial_number || '----',
			},
			{
				title: 'Site',
				field: 'site',
				sorting: false,
				render: (rowData: any) => resolveRelatedName(rowData?.site, rowData?.site_name),
			},
			{
				title: 'Timezone',
				field: 'timezone',
				sorting: false,
				filtering: false,
				render: (rowData: any) => resolveSiteTimezone(rowData),
			},
			{
				title: 'Status',
				field: 'status',
				lookup: {
					AVAILABLE: 'Available',
					ASSIGNED: 'Assigned',
					IN_USE: 'In Use',
					MAINTENANCE: 'Under Maintenance',
					DAMAGED: 'Damaged',
					LOST: 'Lost',
					DISPOSED: 'Disposed',
				},
				render: (rowData: any) => (
					<span style={{ pointerEvents: 'none' }}>
						<StatusBadge
							status={rowData?.status}
							label={rowData?.status_display}
							emptyFallback='----'
						/>
					</span>
				),
			},
		],
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
							onRowClick={(_event, rowData: any) => {
								goToDetail(rowData);
							}}
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

									const url = `/api/hr/asset-items/?limit=${
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
								rowStyle: (data: any, index: number) => ({
									...(rowStyles()(data, index) || {}),
									cursor: 'pointer',
								}),
							}}
							onRowsPerPageChange={(size) => setPageSize(size)}
							actions={[
								{
									icon: () => (
										<FilterListIcon
											color={filterEnabled ? 'primary' : 'action'}
										/>
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

BookAssetsList.propTypes = {
	tableRef: PropTypes.object.isRequired,
};

export default BookAssetsList;
