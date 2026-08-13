import React from 'react';
import MaterialTableImport from '@material-table/core';
import useIsMobile from '../../../hooks/useIsMobile';
import MobileTableCards from './MobileTableCards';
import type { MobileTableColumn } from './mobileTableUtils';

const MaterialTable =
	(MaterialTableImport as any)?.default ?? MaterialTableImport;

type ResponsiveMaterialTableProps = {
	columns: MobileTableColumn[] | any[];
	data: any;
	tableRef?: React.MutableRefObject<any>;
	highlightFields?: string[];
	mobilePageSize?: number;
	searchPlaceholder?: string;
	emptyMessage?: string;
	onRowClick?: (...args: any[]) => void;
	onFilterChange?: (...args: any[]) => void;
	options?: Record<string, any>;
	[key: string]: any;
};

const ResponsiveMaterialTable: React.FC<ResponsiveMaterialTableProps> = ({
	columns,
	data,
	tableRef,
	highlightFields,
	mobilePageSize,
	searchPlaceholder,
	emptyMessage,
	onRowClick,
	onFilterChange,
	options,
	...materialTableProps
}) => {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<MobileTableCards
				columns={columns}
				data={data}
				tableRef={tableRef}
				onRowClick={onRowClick}
				onFilterChange={onFilterChange}
				highlightFields={highlightFields}
				searchPlaceholder={searchPlaceholder}
				emptyMessage={emptyMessage}
				pageSize={mobilePageSize || options?.pageSize || 8}
				debounceInterval={options?.debounceInterval}
				enableSearch={options?.search !== false}
			/>
		);
	}

	return (
		<MaterialTable
			columns={columns as any}
			data={data}
			tableRef={tableRef}
			onRowClick={onRowClick}
			onFilterChange={onFilterChange}
			options={options}
			{...materialTableProps}
		/>
	);
};

export default ResponsiveMaterialTable;
