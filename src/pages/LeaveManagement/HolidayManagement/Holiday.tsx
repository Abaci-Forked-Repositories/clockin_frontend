import React, { useContext, useMemo, useRef, useState } from 'react';
import ResponsiveMaterialTable from '../../../components/CustomComponent/Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useSelector } from 'react-redux';
import { authAxios } from '../../../axiosInstance';
import useTablestyle from '../../../hooks/useTablestyles';
import { formatFilters } from '../../../helpers/functions';
import useToasterNotification from '../../../hooks/useToasterNotification';
import EditButton from '../../../components/CustomComponent/Buttons/EditButton';
import Card, { CardActions, CardBody, CardHeader, CardTitle } from '../../../components/bootstrap/Card';
import AddButton from '../../../components/CustomComponent/Buttons/AddButton';
import AddHoliday from './AddHoliday';
import HolidayYearCalendar from './HolidayYearCalendar';
import ButtonFiltter from '../../../components/CustomComponent/Filters/ButtonFiltter';
import AuthContext from '../../../contexts/authContext';
import { resolveTenantRouteRole } from '../../../helpers/roleToggleUtils';

const Holiday = ({ }: any) => {
    const { userData } = useContext(AuthContext);
    const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
    const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
    const isAdminMode = resolveTenantRouteRole(userData) === 'Admin' && mode === 'Admin';
    const tableRef = useRef(null);
    const urlBackup = useRef('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editId, setEditId] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const calendarYear = new Date().getFullYear();
    const [holidayCalendarData, setHolidayCalendarData] = useState<any[]>([]);
    const editModalToggle = (id: any) => {
        setEditId(id);
        setIsFormOpen(true);
    };
    const openAddModal = () => {
        setEditId(null);
        setIsFormOpen(true);
    };
    const [filterEnabled, setFilterEnabled] = useState(false);
    const [pageSize, setPageSize] = useState(5);
    const [sortState, setSortState] = useState({ orderBy: null, orderDirection: 'asc' });
    const { theme, rowStyles, headerStyles } = useTablestyle();
    const { showErrorNotification } = useToasterNotification();

    const fetchHolidayCalendarData = () => {
        const url = '/api/hr/public-holidays/?paginate=off';
        authAxios
            .get(url)
            .then((response) => {
                const rawData = response?.data;
                const holidayList = Array.isArray(rawData)
                    ? rawData
                    : Array.isArray(rawData?.results)
                        ? rawData.results
                        : [];
                const filteredByYear = holidayList.filter((holiday: any) => {
                    const dateValue = String(holiday?.date || '');
                    return dateValue.startsWith(String(calendarYear));
                });
                setHolidayCalendarData(filteredByYear);
            })
            .catch((error) => {
                showErrorNotification(error);
                setHolidayCalendarData([]);
            });
    };

    React.useEffect(() => {
        setViewMode('list');
    }, []);

    React.useEffect(() => {
        if (viewMode !== 'calendar') return;
        fetchHolidayCalendarData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode]);

    const staticColumns = useMemo(
        () => [
            {
                title: 'Name',
                field: 'name',
                render: (rowData: any) => rowData?.name || '----',
            },
            {
                title: 'Date',
                field: 'date',
                render: (rowData: any) => rowData?.date || '----',
            },
            {
                title: 'Applicable Groups',
                field: 'applicable_to_groups',
                sorting: false,
                render: (rowData: any) =>
                    Array.isArray(rowData?.applicable_to_groups) && rowData?.applicable_to_groups?.length
                        ? rowData.applicable_to_groups.map((group: any) => group?.name).filter(Boolean).join(', ')
                        : '----',
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
        return [...staticColumns, ...actionButtons];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {isFormOpen && (
                <AddHoliday
                    isOpen={isFormOpen}
                    setIsOpen={setIsFormOpen}
                    tableRef={tableRef}
                    title={editId ? 'Edit Holiday' : 'Add Holiday'}
                    id={editId}
                />
            )}
            <Card stretch>
                <CardHeader>
                    <CardTitle tag='div' className='h6'>
                        Holiday Management
                    </CardTitle>
                </CardHeader>
                <CardBody className='d-flex flex-column' style={{ minHeight: 0 }}>
                    <div className='d-flex align-items-center justify-content-between flex-nowrap gap-2 mb-3 w-100'>
                        <div className='d-flex align-items-center'>
                        <ButtonFiltter  
							FilterStatus={['list', 'calendar']}
							activeTab={viewMode}
							setActiveTab={setViewMode}
							styles={{ position: 'relative', top: 'unset', left: 'unset', padding: 0 }}
						/>
                           
                        </div>
                        <div className='d-flex align-items-center'>
                            {isAdminMode && <AddButton name='Add Holiday' modalShow={openAddModal} />}
                        </div>
                    </div>
                    {viewMode === 'list' ? (
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

                                            const url = `/api/hr/public-holidays/?limit=${query.pageSize}&offset=${query.pageSize * query.page
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
			) : (
				<div
					style={{
						flex: 1,
						minHeight: 0,
						maxHeight: '60vh',
						overflowY: 'auto',
						overflowX: 'hidden',
						paddingBottom: '1rem',
					}}>
                            <HolidayYearCalendar holidays={holidayCalendarData} year={calendarYear} />
                        </div>
                    )}
                </CardBody>
            </Card>
        </>
    );
};

/* eslint-disable react/forbid-prop-types */
Holiday.propTypes = {
    tableRef: PropTypes.object.isRequired,
    urlBackup: PropTypes.object.isRequired,
    editModalToggle: PropTypes.func.isRequired,
};
/* eslint-enable react/forbid-prop-types */

export default Holiday;
