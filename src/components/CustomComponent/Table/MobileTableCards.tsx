import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../icon/Icon';
import Spinner from '../../bootstrap/Spinner';
import {
	buildFilterOptions,
	buildMaterialFilters,
	getActionColumn,
	getColumnTitle,
	getDetailColumns,
	getFilterableColumns,
	getHighlightColumns,
	getRowKey,
	hasChoiceFilter,
	matchesSelectedFilters,
	normalizeDefaultFilter,
	toSearchText,
	type MobileTableColumn,
	type MobileTableQuery,
	type MobileTableQueryResult,
} from './mobileTableUtils';

type DataSource =
	| any[]
	| ((query: MobileTableQuery) => Promise<MobileTableQueryResult>);

export type MobileTableCardsProps = {
	columns: MobileTableColumn[];
	data: DataSource;
	tableRef?: React.MutableRefObject<any>;
	onRowClick?: (event: React.MouseEvent | null, rowData: any) => void;
	onFilterChange?: (filters: MobileTableQuery['filters']) => void;
	getRowId?: (row: any, index: number) => string | number;
	highlightFields?: string[];
	searchPlaceholder?: string;
	emptyMessage?: string;
	pageSize?: number;
	debounceInterval?: number;
	enableSearch?: boolean;
	className?: string;
};

const DEFAULT_PAGE_SIZE = 8;

const MobileTableCards: React.FC<MobileTableCardsProps> = ({
	columns,
	data,
	tableRef,
	onRowClick,
	onFilterChange,
	getRowId,
	highlightFields,
	searchPlaceholder = 'Search',
	emptyMessage = 'No records found',
	pageSize = DEFAULT_PAGE_SIZE,
	debounceInterval = 400,
	enableSearch = true,
	className,
}) => {
	const visibleColumns = useMemo(
		() => (columns || []).filter((column) => !column?.hidden),
		[columns],
	);
	const highlightColumns = useMemo(
		() => getHighlightColumns(visibleColumns, highlightFields),
		[visibleColumns, highlightFields],
	);
	const detailColumns = useMemo(
		() => getDetailColumns(visibleColumns, highlightColumns),
		[visibleColumns, highlightColumns],
	);
	const actionColumn = useMemo(() => getActionColumn(visibleColumns), [visibleColumns]);
	const filterableColumns = useMemo(
		() => getFilterableColumns(visibleColumns),
		[visibleColumns],
	);

	const initialFilters = useMemo(() => {
		const next: Record<string, string[]> = {};
		visibleColumns.forEach((column) => {
			if (!column.field || column.defaultFilter == null) return;
			const values = normalizeDefaultFilter(column.defaultFilter);
			if (values.length) next[column.field] = values;
		});
		return next;
	}, [visibleColumns]);

	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(initialFilters);
	const [textFilterDraft, setTextFilterDraft] = useState<Record<string, string>>({});
	const [filterOpen, setFilterOpen] = useState(false);
	const [optionQuery, setOptionQuery] = useState<Record<string, string>>({});
	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
	const [page, setPage] = useState(0);
	const [rows, setRows] = useState<any[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const materialFilters = useMemo(
		() => buildMaterialFilters(visibleColumns, selectedFilters),
		[visibleColumns, selectedFilters],
	);
	const requestIdRef = useRef(0);
	const dataRef = useRef(data);
	const selectedFiltersRef = useRef(selectedFilters);
	const visibleColumnsRef = useRef(visibleColumns);
	const materialFiltersRef = useRef(materialFilters);
	dataRef.current = data;
	selectedFiltersRef.current = selectedFilters;
	visibleColumnsRef.current = visibleColumns;
	materialFiltersRef.current = materialFilters;
	const isRemote = typeof data === 'function';

	useEffect(() => {
		setSelectedFilters(initialFilters);
		const drafts: Record<string, string> = {};
		filterableColumns.forEach((column) => {
			if (!column.field || hasChoiceFilter(column)) return;
			const value = initialFilters[column.field]?.[0];
			if (value) drafts[column.field] = value;
		});
		setTextFilterDraft(drafts);
		setPage(0);
	}, [filterableColumns, initialFilters]);

	useEffect(() => {
		const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), debounceInterval);
		return () => window.clearTimeout(timer);
	}, [search, debounceInterval]);

	useEffect(() => {
		setPage(0);
	}, [debouncedSearch, selectedFilters, pageSize]);

	const loadData = useCallback(async () => {
		const requestId = requestIdRef.current + 1;
		requestIdRef.current = requestId;
		const currentData = dataRef.current;
		const currentFilters = selectedFiltersRef.current;
		const currentColumns = visibleColumnsRef.current;
		const currentMaterialFilters = materialFiltersRef.current;
		const remote = typeof currentData === 'function';

		if (!remote) {
			const source = Array.isArray(currentData) ? currentData : [];
			const searchTerm = debouncedSearch.toLowerCase();
			const filtered = source.filter((row) => {
				if (!matchesSelectedFilters(row, currentFilters, currentColumns)) return false;
				if (!searchTerm) return true;
				return currentColumns.some((column) => {
					const rendered = column.render ? column.render(row) : undefined;
					const fieldValue = column.field ? (row as any)?.[column.field] : undefined;
					return `${toSearchText(rendered)} ${toSearchText(fieldValue)}`
						.toLowerCase()
						.includes(searchTerm);
				});
			});
			const start = page * pageSize;
			setRows(filtered.slice(start, start + pageSize));
			setTotalCount(filtered.length);
			setLoading(false);
			return;
		}

		setLoading(true);
		setRows([]);
		try {
			const result = await (
				currentData as (query: MobileTableQuery) => Promise<MobileTableQueryResult>
			)({
				page,
				pageSize,
				search: debouncedSearch,
				filters: currentMaterialFilters,
				orderBy: null,
				orderDirection: 'asc',
			});
			if (requestId !== requestIdRef.current) return;
			setRows(result?.data || []);
			setTotalCount(result?.totalCount || 0);
		} catch {
			if (requestId !== requestIdRef.current) return;
			setRows([]);
			setTotalCount(0);
		} finally {
			if (requestId === requestIdRef.current) setLoading(false);
		}
	}, [debouncedSearch, page, pageSize]);

	useEffect(() => {
		loadData();
	}, [loadData, selectedFilters, isRemote]);

	useEffect(() => {
		if (!tableRef) return undefined;
		tableRef.current = {
			onQueryChange: () => {
				loadData();
			},
		};
		return undefined;
	}, [loadData, tableRef]);

	const emitFilterChange = (nextFilters: Record<string, string[]>) => {
		onFilterChange?.(buildMaterialFilters(visibleColumns, nextFilters));
	};

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setSelectedFilters((prev) => {
				const next = { ...prev };
				filterableColumns.forEach((column) => {
					if (!column.field || hasChoiceFilter(column)) return;
					const value = (textFilterDraft[column.field] || '').trim();
					if (value) next[column.field] = [value];
					else delete next[column.field];
				});
				const prevKey = JSON.stringify(prev);
				const nextKey = JSON.stringify(next);
				if (prevKey === nextKey) return prev;
				emitFilterChange(next);
				return next;
			});
		}, debounceInterval);
		return () => window.clearTimeout(timer);
		// emitFilterChange is derived from current columns/callback and should follow this debounce.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debounceInterval, filterableColumns, textFilterDraft, visibleColumns]);

	const activeFilterCount = useMemo(() => {
		const choiceCount = filterableColumns.reduce((count, column) => {
			if (!column.field || !hasChoiceFilter(column)) return count;
			return count + (selectedFilters[column.field]?.length || 0);
		}, 0);
		const textCount = filterableColumns.reduce((count, column) => {
			if (!column.field || hasChoiceFilter(column)) return count;
			return count + ((textFilterDraft[column.field] || '').trim() ? 1 : 0);
		}, 0);
		return choiceCount + textCount;
	}, [filterableColumns, selectedFilters, textFilterDraft]);

	const pageCount = Math.max(1, Math.ceil(totalCount / pageSize) || 1);
	const canGoPrev = page > 0;
	const canGoNext = page + 1 < pageCount;

	const toggleFilterValue = (field: string, value: string) => {
		setSelectedFilters((prev) => {
			const current = prev[field] || [];
			const nextValues = current.includes(value)
				? current.filter((item) => item !== value)
				: [...current, value];
			const next = { ...prev };
			if (nextValues.length) next[field] = nextValues;
			else delete next[field];
			emitFilterChange(next);
			return next;
		});
	};

	const clearFilters = () => {
		setSelectedFilters({});
		setTextFilterDraft({});
		setOptionQuery({});
		emitFilterChange({});
	};

	const toggleExpanded = (rowKey: string) => {
		setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
	};

	const renderCell = (column: MobileTableColumn, row: any) => {
		if (typeof column.render === 'function') return column.render(row);
		if (column.field && column.lookup) {
			const raw = (row as any)?.[column.field];
			return column.lookup[raw] ?? raw ?? '----';
		}
		if (column.field) {
			const value = (row as any)?.[column.field];
			return value == null || value === '' ? '----' : String(value);
		}
		return '----';
	};

	return (
		<div className={['mobile-table-cards', className].filter(Boolean).join(' ')}>
			<div className='mobile-table-cards__toolbar'>
				{enableSearch ? (
					<label className='mobile-table-cards__search'>
						<Icon icon='Search' />
						<input
							type='text'
							value={search}
							placeholder={searchPlaceholder}
							onChange={(event) => setSearch(event.target.value)}
							aria-label={searchPlaceholder}
						/>
						{search ? (
							<button
								type='button'
								className='mobile-table-cards__search-clear'
								aria-label='Clear search'
								onClick={() => setSearch('')}>
								<Icon icon='Close' />
							</button>
						) : null}
					</label>
				) : null}
				{filterableColumns.length ? (
					<button
						type='button'
						className={[
							'mobile-table-cards__filter-btn',
							filterOpen || activeFilterCount ? 'is-active' : '',
						]
							.filter(Boolean)
							.join(' ')}
						aria-expanded={filterOpen}
						onClick={() => setFilterOpen((open) => !open)}>
						<Icon icon='FilterList' />
						<span>Filters</span>
						{activeFilterCount ? (
							<span className='mobile-table-cards__filter-count'>{activeFilterCount}</span>
						) : null}
					</button>
				) : null}
			</div>

			{filterOpen && filterableColumns.length ? (
				<div className='mobile-table-cards__filters'>
					<div className='mobile-table-cards__filters-head'>
						<span>Filters</span>
						{activeFilterCount ? (
							<button type='button' className='mobile-table-cards__text-btn' onClick={clearFilters}>
								Clear all
							</button>
						) : null}
					</div>
					{filterableColumns.map((column) => {
						const field = column.field as string;
						if (!field) return null;
						const label = getColumnTitle(column) || field;
						if (hasChoiceFilter(column)) {
							const options = buildFilterOptions(column);
							const query = (optionQuery[field] || '').trim().toLowerCase();
							const visibleOptions = query
								? options.filter(
										(option) =>
											option.label.toLowerCase().includes(query) ||
											option.value.toLowerCase().includes(query),
									)
								: options;
							const selected = selectedFilters[field] || [];

							return (
								<div key={field} className='mobile-table-cards__filter-group'>
									<div className='mobile-table-cards__filter-label'>{label}</div>
									{options.length > 8 ? (
										<input
											className='mobile-table-cards__option-search'
											type='search'
											value={optionQuery[field] || ''}
											placeholder={`Search ${label}`}
											onChange={(event) =>
												setOptionQuery((prev) => ({ ...prev, [field]: event.target.value }))
											}
										/>
									) : null}
									<div className='mobile-table-cards__chips'>
										{visibleOptions.map((option) => {
											const isSelected = selected.includes(option.value);
											return (
												<button
													key={option.value}
													type='button'
													className={[
														'mobile-table-cards__chip',
														isSelected ? 'is-selected' : '',
													]
														.filter(Boolean)
														.join(' ')}
													onClick={() => toggleFilterValue(field, option.value)}>
													{option.label}
												</button>
											);
										})}
										{!visibleOptions.length ? (
											<span className='mobile-table-cards__muted'>No matching options</span>
										) : null}
									</div>
								</div>
							);
						}

						const inputType = column.type === 'date' ? 'date' : 'text';
						return (
							<div key={field} className='mobile-table-cards__filter-group'>
								<label className='mobile-table-cards__filter-label' htmlFor={`mobile-filter-${field}`}>
									{label}
								</label>
								<input
									id={`mobile-filter-${field}`}
									className='mobile-table-cards__text-filter'
									type={inputType}
									value={textFilterDraft[field] || ''}
									placeholder={`Filter ${label}`}
									onChange={(event) =>
										setTextFilterDraft((prev) => ({ ...prev, [field]: event.target.value }))
									}
								/>
							</div>
						);
					})}
				</div>
			) : null}

			{loading ? (
				<div className='mobile-table-cards__state'>
					<Spinner isSmall color='info' />
					<span>Loading...</span>
				</div>
			) : null}

			{!loading && !rows.length ? (
				<div className='mobile-table-cards__state mobile-table-cards__state--empty'>{emptyMessage}</div>
			) : null}

			{!loading ? (
			<div className='mobile-table-cards__list'>
				{rows.map((row, index) => {
					const rowKey = getRowKey(row, index, getRowId);
					const expanded = Boolean(expandedRows[rowKey]);
					const [primary, ...restHighlight] = highlightColumns;

					return (
						<article
							key={rowKey}
							className={['mobile-table-cards__card', expanded ? 'is-expanded' : '']
								.filter(Boolean)
								.join(' ')}>
							<div className='mobile-table-cards__card-head'>
								<div
									className={[
										'mobile-table-cards__card-main',
										onRowClick ? 'is-clickable' : '',
									]
										.filter(Boolean)
										.join(' ')}
									role={onRowClick ? 'button' : undefined}
									tabIndex={onRowClick ? 0 : undefined}
									onClick={(event) => {
										if (onRowClick) onRowClick(event, row);
									}}
									onKeyDown={(event) => {
										if (!onRowClick) return;
										if (event.key === 'Enter' || event.key === ' ') {
											event.preventDefault();
											onRowClick(event as unknown as React.MouseEvent, row);
										}
									}}>
									{primary ? (
										<div className='mobile-table-cards__primary'>
											<span className='mobile-table-cards__primary-label'>
												{getColumnTitle(primary)}
											</span>
											<div className='mobile-table-cards__primary-value'>{renderCell(primary, row)}</div>
										</div>
									) : null}
									{restHighlight.length ? (
										<div className='mobile-table-cards__highlights'>
											{restHighlight.map((column) => (
												<div key={`${rowKey}-${column.field || getColumnTitle(column)}`} className='mobile-table-cards__highlight'>
													<span className='mobile-table-cards__highlight-label'>
														{getColumnTitle(column)}
													</span>
													<div className='mobile-table-cards__highlight-value'>
														{renderCell(column, row)}
													</div>
												</div>
											))}
										</div>
									) : null}
								</div>
								<button
									type='button'
									className='mobile-table-cards__expand'
									aria-expanded={expanded}
									aria-label={expanded ? 'Hide details' : 'Show details'}
									onClick={() => toggleExpanded(rowKey)}>
									<Icon icon={expanded ? 'ExpandLess' : 'ExpandMore'} />
								</button>
							</div>

							{expanded && detailColumns.length ? (
								<div className='mobile-table-cards__details'>
									{detailColumns.map((column) => (
										<div
											key={`${rowKey}-detail-${column.field || getColumnTitle(column)}`}
											className='mobile-table-cards__detail-row'>
											<span className='mobile-table-cards__detail-label'>
												{getColumnTitle(column)}
											</span>
											<div className='mobile-table-cards__detail-value'>{renderCell(column, row)}</div>
										</div>
									))}
								</div>
							) : null}

							{actionColumn ? (
								<div
									className='mobile-table-cards__actions'
									onClick={(event) => event.stopPropagation()}
									onKeyDown={(event) => event.stopPropagation()}>
									{actionColumn.render?.(row)}
								</div>
							) : null}
						</article>
					);
				})}
			</div>
			) : null}

			{!loading && totalCount > pageSize ? (
				<div className='mobile-table-cards__pager'>
					<button
						type='button'
						className='mobile-table-cards__pager-btn'
						disabled={loading || !canGoPrev}
						aria-label='Previous page'
						onClick={() => setPage((current) => Math.max(0, current - 1))}>
						<Icon icon='ChevronLeft' />
					</button>
					<span className='mobile-table-cards__pager-meta'>
						Page {page + 1} of {pageCount}
					</span>
					<button
						type='button'
						className='mobile-table-cards__pager-btn'
						disabled={loading || !canGoNext}
						aria-label='Next page'
						onClick={() => setPage((current) => current + 1)}>
						<Icon icon='ChevronRight' />
					</button>
				</div>
			) : null}
		</div>
	);
};

export default MobileTableCards;
