import React from 'react';

export type MobileTableColumn = {
	title?: React.ReactNode;
	field?: string;
	highlight?: boolean;
	render?: (rowData: any) => React.ReactNode;
	lookup?: Record<string, string | number>;
	filterOptions?: Array<{ value: string; label: string }>;
	filtering?: boolean;
	defaultFilter?: unknown;
	type?: string;
	hidden?: boolean;
	sorting?: boolean;
	grouping?: boolean;
	removable?: boolean;
	align?: string;
	[key: string]: unknown;
};

export type MobileTableFilterOption = {
	value: string;
	label: string;
};

export type MobileTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	filters: Array<{ column: MobileTableColumn; operator: string; value: unknown }>;
	orderBy?: MobileTableColumn | null;
	orderDirection?: 'asc' | 'desc';
	totalCount?: number;
};

export type MobileTableQueryResult = {
	data: any[];
	page: number;
	totalCount: number;
};

export const getColumnTitle = (column?: MobileTableColumn) => {
	if (column?.title == null || column.title === '') return '';
	if (typeof column.title === 'string' || typeof column.title === 'number') {
		return String(column.title);
	}
	return '';
};

export const isActionColumn = (column?: MobileTableColumn) => {
	if (!column) return false;
	const title = getColumnTitle(column).trim().toLowerCase();
	if (title === 'actions' || title === 'action') return true;
	return column.filtering === false && !column.field && typeof column.render === 'function';
};

export const isVisibleColumn = (column?: MobileTableColumn) => Boolean(column) && !column?.hidden;

export const getByPath = (obj: any, path?: string) => {
	if (!obj || !path) return undefined;
	return path.split('.').reduce((acc: any, key) => (acc == null ? acc : acc[key]), obj);
};

export const getFieldValue = (row: any, field?: string) => {
	if (!row || !field) return undefined;
	if (Object.prototype.hasOwnProperty.call(row, field)) return row[field];
	if (field.includes('.')) return getByPath(row, field);
	if (field.includes('__')) return getByPath(row, field.replace(/__/g, '.'));
	return undefined;
};

export const normalizeFilterValue = (value: unknown): string | null => {
	if (value == null || value === '') return null;
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (typeof value === 'number') return String(value);
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed ? trimmed : null;
	}
	if (typeof value === 'object') {
		const record = value as Record<string, unknown>;
		if (record.id != null) return String(record.id);
		if (record.value != null) return String(record.value);
		if (record.name != null) return String(record.name);
	}
	return String(value);
};

export const getFilterLabel = (column: MobileTableColumn, value: string) => {
	if (column.lookup && column.lookup[value] != null) {
		return String(column.lookup[value]);
	}
	if (value === 'true') return 'Yes';
	if (value === 'false') return 'No';
	return value.replace(/_/g, ' ');
};

export const toSearchText = (value: unknown): string => {
	if (value == null || value === false) return '';
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}
	if (Array.isArray(value)) return value.map(toSearchText).join(' ');
	if (React.isValidElement(value)) {
		return toSearchText((value.props as { children?: unknown })?.children);
	}
	if (typeof value === 'object') {
		const record = value as Record<string, unknown>;
		return ['name', 'label', 'title', 'preferred_name', 'full_name', 'email']
			.map((key) => toSearchText(record[key]))
			.filter(Boolean)
			.join(' ');
	}
	return '';
};

const isWeakHighlightColumn = (column: MobileTableColumn) => {
	const title = getColumnTitle(column).trim().toLowerCase();
	if (['image', 'avatar', 'photo', 'picture'].includes(title)) return true;
	return column.field === 'avatar' || column.field === 'image';
};

export const getHighlightColumns = (
	columns: MobileTableColumn[],
	highlightFields?: string[],
	fallbackCount = 3,
) => {
	const visible = columns.filter((column) => isVisibleColumn(column) && !isActionColumn(column));
	const explicit = visible.filter((column) => column.highlight);
	if (explicit.length) return explicit;

	if (highlightFields?.length) {
		const fieldSet = new Set(highlightFields);
		const matched = visible.filter((column) => column.field && fieldSet.has(column.field));
		if (matched.length) return matched;
	}

	return visible.filter((column) => !isWeakHighlightColumn(column)).slice(0, fallbackCount);
};

export const getDetailColumns = (columns: MobileTableColumn[], highlightColumns: MobileTableColumn[]) => {
	const highlightSet = new Set(highlightColumns);
	return columns.filter(
		(column) => isVisibleColumn(column) && !isActionColumn(column) && !highlightSet.has(column),
	);
};

export const getActionColumn = (columns: MobileTableColumn[]) =>
	columns.find((column) => isVisibleColumn(column) && isActionColumn(column));

export const getFilterableColumns = (columns: MobileTableColumn[]) =>
	columns.filter((column) => {
		if (!isVisibleColumn(column) || isActionColumn(column)) return false;
		if (column.filtering === false) return false;
		return Boolean(column.field || column.lookup || column.filterOptions?.length);
	});

export const hasChoiceFilter = (column?: MobileTableColumn) =>
	Boolean(column?.lookup || column?.filterOptions?.length);

export const buildFilterOptions = (column: MobileTableColumn): MobileTableFilterOption[] => {
	if (column.filterOptions?.length) return column.filterOptions;
	if (!column.lookup) return [];
	return Object.entries(column.lookup).map(([value, label]) => ({
		value: String(value),
		label: String(label),
	}));
};

export const normalizeDefaultFilter = (value: unknown): string[] => {
	if (value == null || value === '') return [];
	if (Array.isArray(value)) {
		return value.map((item) => normalizeFilterValue(item)).filter((item): item is string => Boolean(item));
	}
	const single = normalizeFilterValue(value);
	return single ? [single] : [];
};

export const buildMaterialFilters = (
	columns: MobileTableColumn[],
	selectedFilters: Record<string, string[]>,
) =>
	Object.entries(selectedFilters)
		.filter(([, values]) => values?.length)
		.map(([field, values]) => {
			const column = columns.find((item) => item.field === field) || { field };
			const value = column.lookup || values.length > 1 ? values : values[0];
			return {
				column,
				operator: '=',
				value,
			};
		});

export const matchesSelectedFilters = (
	row: any,
	selectedFilters: Record<string, string[]>,
	columns: MobileTableColumn[] = [],
) =>
	Object.entries(selectedFilters).every(([field, values]) => {
		if (!values?.length) return true;
		const column = columns.find((item) => item.field === field);
		const rawValue = getFieldValue(row, field);
		if (hasChoiceFilter(column)) {
			const rowValue = normalizeFilterValue(rawValue);
			return rowValue != null && values.includes(rowValue);
		}
		const query = String(values[0] || '')
			.trim()
			.toLowerCase();
		if (!query) return true;
		return toSearchText(rawValue).toLowerCase().includes(query);
	});

export const getRowKey = (row: any, index: number, getRowId?: (row: any, index: number) => string | number) => {
	if (getRowId) return String(getRowId(row, index));
	if (row?.id != null) return String(row.id);
	if (row?.tableData?.id != null) return String(row.tableData.id);
	return String(index);
};
