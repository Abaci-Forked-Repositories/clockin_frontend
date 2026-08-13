import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ResponsiveMaterialTable from '../../CustomComponent/Table/ResponsiveMaterialTable';
import { ThemeProvider } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import useTablestyle from '../../../hooks/useTablestyles';
import EditButton from '../../CustomComponent/Buttons/EditButton';

const dummySchedules = [
	{ id: 1, name: 'Morning Schedule', type: 'FIXED', description: 'Weekday morning shift' },
	{ id: 2, name: 'Weekend Flex', type: 'FLEXI', description: 'Flexible weekend schedule' },
];

const ScheduleTable = ({ tableRef, editHandler }) => {
	const [filterEnabled, setFilterEnabled] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const { theme, rowStyles, headerStyles } = useTablestyle();

	const columns = useMemo(
		() => [
			{ title: 'Name', field: 'name' },
			{ title: 'Type', field: 'type' },
			{ title: 'Description', field: 'description' },
			{
				title: 'Actions',
				field: 'actions',
				sorting: false,
				filtering: false,
				render: (rowData) => <EditButton modalShow={editHandler} id={rowData?.id} />,
			},
		],
		[editHandler],
	);

	return (
		<div className='material-table-wrapper'>
			<ThemeProvider theme={theme}>
				<ResponsiveMaterialTable
					title='Dummy Schedule Table'
					columns={columns}
					tableRef={tableRef}
					data={dummySchedules}
					// onChangeRowsPerPage={setPageSize}
					actions={[
						{
							icon: FilterListIcon,
							tooltip: filterEnabled ? 'Disable Filter' : 'Enable Filter',
							isFreeAction: true,
							onClick: () => setFilterEnabled((state) => !state),
						},
					]}
					options={{
						headerStyle: headerStyles(),
						rowStyle: rowStyles(),
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

ScheduleTable.propTypes = {
	tableRef: PropTypes.object,
	editHandler: PropTypes.func,
};

ScheduleTable.defaultProps = {
	tableRef: undefined,
	editHandler: () => {},
};

export default ScheduleTable;
