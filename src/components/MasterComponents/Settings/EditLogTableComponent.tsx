import React, {  useState, MutableRefObject } from 'react';
import { Column } from '@material-table/core';
import ResponsiveMaterialTable from '../../CustomComponent/Table/ResponsiveMaterialTable';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ThemeProvider } from '@mui/material/styles';
import { authAxios } from '../../../axiosInstance';
import useTablestyle from '../../../hooks/useTablestyles';
import useToasterNotification from '../../../hooks/useToasterNotification';
import { formatFilters } from '../../../helpers/functions';
import Moments from '../../../helpers/Moment';

interface EditLogData {
  id: number;
  change_type?: string;
  content_type_name?: string;
  content_type?: string;
  time?: string;
  object_data?: {
    detail?: string;
  };
}

interface EditLogTableComponentProps {
  tableRef: MutableRefObject<any>;
  urlBackup: MutableRefObject<string>;
}

const EditLogTableComponent: React.FC<EditLogTableComponentProps> = ({
  tableRef,
  urlBackup,
}) => {
  const [pageSize, setPageSize] = useState<number>(5);
  const { showErrorNotification } = useToasterNotification();
  const { theme, rowStyles, headerStyles } = useTablestyle();
  const [filterEnabled, setFilterEnabled] = useState<boolean>(false);

  const staticColumns: Column<EditLogData>[] = [
    {
      title: 'Content type',
      field: 'content_type',
      render: (rowData) => rowData?.content_type || '----',
    },
    {
      title: 'Change type',
      field: 'change_type',
      render: (rowData) => rowData?.change_type || '----',
    },
    {
      title: 'Content type name',
      field: 'content_type_name',
      render: (rowData) => rowData?.content_type_name || '----',
    },
    {
      title: 'Details',
      field: 'detail',
      render: (rowData) => rowData?.object_data?.detail || '----',
    },
    {
      title: 'Time',
      field: 'time',
      render: (rowData)  => Moments(rowData.time,'datetime'),
      filtering:false
    },
    
  ];

 


  return (
     <div className='material-table-wrapper'>
      <ThemeProvider theme={theme}>
        <ResponsiveMaterialTable
          title=' '
          columns={staticColumns}
          tableRef={tableRef}
          onRowsPerPageChange={(pageSize) => setPageSize(pageSize)} 
          data={(query) =>
            new Promise((resolve, reject) => {
              const otherFilters = formatFilters(query.filters);
              let orderBy = ''; 
              if (query.orderBy) {
                orderBy =
                  query.orderDirection === 'asc'
                    ? `&ordering=-${query.orderBy?.field}`
                    : `&ordering=${query.orderBy?.field}`;
              }
              const url = `api/logs?limit=${query.pageSize}&offset=${query.pageSize * query.page}&search=${query.search}${orderBy}&${otherFilters}`;
              urlBackup.current = url;
              authAxios
                .get(url)
                .then((response) => {
                  resolve({
                    data: response.data?.results,
                    page: query.page,
                    totalCount: response.data?.count,
                  });
                })
                .catch((error) => {
                  showErrorNotification(error);
                  reject({ data: [], page: query.page, totalCount: 0 });
                });
            })
          }
          options={{
            headerStyle: headerStyles(),
            rowStyle: rowStyles(),
            actionsColumnIndex: -1,
            debounceInterval: 500,
            filtering: filterEnabled,
            search: true,
            pageSize,
          }}
          actions={[
            {
              icon: FilterListIcon,
              tooltip: filterEnabled ? 'Disable Filter' : 'Enable Filter',
              isFreeAction: true,
              onClick: () => setFilterEnabled((state) => !state),
            },
          ]}
        />
      </ThemeProvider>
    </div>
  );
};

export default EditLogTableComponent;
