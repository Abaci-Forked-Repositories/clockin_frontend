import React, { useMemo, useState } from 'react';
import ResponsiveMaterialTable from './Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import { authAxios } from '../../axiosInstance';
import useToasterNotification from '../../hooks/useToasterNotification';
import useTablestyle from '../../hooks/useTablestyles';
import { formatFilters } from '../../helpers/functions';

type TableColumn = {
  title: string;
  field: string;
  render?: (rowData: any) => React.ReactNode;
};

type ActionButton = {
  title: string;
  align?: string;
  removable?: boolean;
  sorting?: boolean;
  grouping?: boolean;
  filtering?: boolean;
  render: (rowData: any) => React.ReactNode;
};

type MaterialTableComponentProps = {
  tableRef: React.MutableRefObject<any>;
  urlBackup: React.MutableRefObject<any>;
  api: string;
  columns: TableColumn[];
  permissions:  boolean;
  actionButtons: ActionButton[];
  editModalToggle: (id: number) => void;
};

const MaterialTableComponent: React.FC<MaterialTableComponentProps> = ({ tableRef, api, columns, permissions, actionButtons,editModalToggle,urlBackup }) => {
  const { showErrorNotification } = useToasterNotification();
  const { theme, rowStyles, headerStyles } = useTablestyle();
  const [pageSize, setPageSize] = useState(5);
  const [filterEnabled, setFilterEnabled] = useState(false);

  const tableColumns = useMemo(() => [...columns, ...actionButtons], [columns, actionButtons]);

  return (
    <div className='material-table-wrapper'>
      <ThemeProvider theme={theme}>
        <ResponsiveMaterialTable
          title=' '
          //@ts-ignore
          columns={tableColumns}
          tableRef={tableRef}
          onChangeRowsPerPage={setPageSize}
          onRowClick={(event, rowData)=>permissions&&editModalToggle(rowData.id)}

          data={(query) =>
            new Promise((resolve, reject) => {
              const filters = formatFilters(query.filters);
              let orderBy = query.orderBy
                ? `&ordering=${query.orderDirection === 'asc' ? '-' : ''}${String(query.orderBy.field)}`
                : '';

              const url = `${api}?limit=${query.pageSize}&offset=${query.pageSize * query.page}&search=${query.search}${orderBy}&${filters}`;
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
              icon: () => <FilterListIcon />, // Fixed icon rendering for TypeScript
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

export default MaterialTableComponent;
