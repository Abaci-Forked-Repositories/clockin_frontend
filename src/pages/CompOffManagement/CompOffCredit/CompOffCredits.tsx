import React, { useMemo, useRef, useState } from 'react';
import ResponsiveMaterialTable from '../../../components/CustomComponent/Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import { authAxios } from '../../../axiosInstance';
import useTablestyle from '../../../hooks/useTablestyles';
import { formatFilters } from '../../../helpers/functions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import EditButton from '../../../components/CustomComponent/Buttons/EditButton';
import Card, { CardBody } from '../../../components/bootstrap/Card';

type CompOffCreditsProps = {
	tableRef: React.MutableRefObject<any>;
	editModalToggle: (id: any) => void;
};

const resolveUserName = (rowData: any): string => {
	const user = rowData?.user;
	if (user != null && typeof user === 'object') {
		const pref = String(user.preferred_name || '').trim();
		if (pref) return pref;
		const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
		if (full) return full;
		if (user.name) return String(user.name);
		if (user.email) return String(user.email);
	}
	return rowData?.user_name || rowData?.employee_name || '----';
};

const CompOffCredits = ({ tableRef, editModalToggle }: CompOffCreditsProps) => {
	const urlBackup = useRef('');
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
	const { theme, rowStyles, headerStyles } = useTablestyle();
	const { showErrorNotification } = useToasterNotification();

	const staticColumns = useMemo(
		() => [
			{
				title: 'Employee',
				field: 'user__name',
				render: (rowData: any) => resolveUserName(rowData),
			},
			{
				title: 'Earned date',
				field: 'earned_date',
				render: (rowData: any) =>
					rowData?.earned_date ? String(rowData.earned_date).slice(0, 10) : '----',
			},
			{
				title: 'Days',
				field: 'days',
				render: (rowData: any) =>
					rowData?.days != null && rowData?.days !== '' ? String(rowData.days) : '----',
			},
			{
				title: 'Expiry date',
				field: 'expiry_date',
				render: (rowData: any) =>
					rowData?.expiry_date ? String(rowData.expiry_date).slice(0, 10) : '----',
			},
			{
				title: 'Remarks',
				field: 'remarks',
				sorting: false,
				render: (rowData: any) => rowData?.remarks || '----',
			},
		],
		[],
	);

	const actionButtons = [
		{
			title: 'Actions',
			align: 'right',
			removable: false,
			sorting: false,
			grouping: false,
			filtering: false,
			render: (rowData: any) => (
				<div className='d-flex gap-1 justify-content-end'>
					<EditButton modalShow={editModalToggle} id={rowData.id} />
				</div>
			),
		},
	];

	const columns = useMemo(
		() => [...staticColumns, ...actionButtons],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return (
		<Card stretch>
			<CardBody>
				<div className='material-table-wrapper comp-off-credits-table'>
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
								new Promise((resolve) => {
									let orderBy = '';
									const otherFilters = formatFilters(query.filters);
									if (query.orderBy) {
										orderBy =
											query.orderDirection === 'asc'
												? `&ordering=-${String(query.orderBy?.field)}`
												: `&ordering=${String(query.orderBy?.field)}`;
									}

									const url = `/api/hr/comp-off-credits/?limit=${
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
								rowStyle: rowStyles as any,
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

CompOffCredits.propTypes = {
	tableRef: PropTypes.object.isRequired,
	editModalToggle: PropTypes.func.isRequired,
};

export default CompOffCredits;
