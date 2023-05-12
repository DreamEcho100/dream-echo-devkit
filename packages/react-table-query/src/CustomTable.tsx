/* eslint-disable @typescript-eslint/no-non-null-assertion */
export { default as TableMetaData } from './components/TableMetaData';
export { default as TableLoadMore } from './components/TableLoadMore';

import type { ColumnDef } from '@tanstack/react-table';

import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from '@tanstack/react-table';

import type { HTMLProps } from 'react';

import type { StoreApi } from 'zustand/vanilla';

import { useEffect, useRef, useMemo } from 'react';

import { useStore } from 'zustand';

import Filter from './components/Filter';
import type { InfiniteQuery, TableStore } from './utils/types';
import { cx } from './utils/internal';

const ROW_SELECT = 'row-select' as const;

function IndeterminateCheckbox({
	indeterminate,
	className = '',
	...props
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		if (typeof indeterminate === 'boolean') {
			ref.current.indeterminate = !props.checked && indeterminate;
		}
	}, [indeterminate, props.checked]);

	return <input type='checkbox' ref={ref} className={className} {...props} />;
}

// reactTable?: Omit<
// 	Table<QueryItem & TExtraData>,
// 	| 'data'
// 	| 'columns'
// 	| 'state'
// 	| 'onRowSelectionChange'
// 	| 'onColumnFiltersChange'
// 	| 'getCoreRowModel'
// 	| 'getFilteredRowModel'
// 	| 'columnResizeMode'
// >;
export const CustomTable = <
	QueryItem extends Record<string, unknown>,
	TableItem extends Record<
		Exclude<string, keyof QueryItem> | keyof QueryItem,
		unknown
	>,
>({
	infiniteQuery,
	store,
	canMultiRowSelect,
	...props
}: {
	infiniteQuery: InfiniteQuery<QueryItem>;
	columns: ColumnDef<TableItem>[];
	store: StoreApi<TableStore<TableItem>>;
	canMultiRowSelect?: boolean;
}) => {
	const currentPageIndex = useStore(store, (state) => state.currentPageIndex);
	const rowSelection = useStore(store, (state) => state.rowSelection);
	const columnFilters = useStore(store, (state) => state.columnFilters);
	const classNames = useStore(store, (state) => state.classNames);
	const pageViewMode = useStore(store, (state) => state.pageViewMode);
	const tableAutoToFixedOnLoad = useStore(
		store,
		(state) => state.tableAutoToFixedOnLoad,
	);

	const filterByFormValues = useStore(
		store,
		(state) => state.filterByFormValues,
	);

	const filterersKeysMap = useMemo(
		() =>
			Object.fromEntries(
				Object.keys(filterByFormValues || {}).map((key) => [key, true]),
			),
		[filterByFormValues],
	);

	const { setRowSelection, setColumnFilters } = useStore(
		store,
		(state) => state.utils,
	);

	const columns: ColumnDef<TableItem>[] = useMemo(() => {
		const columns = [
			...(props.columns.map((column) => ({
				...column,
				enableColumnFilter: !!(
					(column as { accessorKey?: string }).accessorKey &&
					filterersKeysMap[(column as { accessorKey: string }).accessorKey]
				),
			})) as ColumnDef<TableItem>[]),
		];

		if (canMultiRowSelect)
			columns.unshift({
				accessorKey: 'ROW_SELECT',
				id: ROW_SELECT,
				enableHiding: true,
				header: ({ table }) => (
					<div className={cx(classNames.thead?.th?.checkboxContainer?._)}>
						<IndeterminateCheckbox
							checked={table.getIsAllRowsSelected()}
							indeterminate={table.getIsSomeRowsSelected()}
							onChange={table.getToggleAllRowsSelectedHandler()}
							className={cx(classNames.thead?.th?.checkboxContainer?.checkBox)}
						/>
					</div>
				),
				cell: ({ row }) => (
					<div className={cx(classNames.tbody?.td?.checkboxContainer?._)}>
						<IndeterminateCheckbox
							checked={row.getIsSelected()}
							indeterminate={row.getIsSomeSelected()}
							onChange={row.getToggleSelectedHandler()}
							className={cx(classNames.tbody?.td?.checkboxContainer?.checkBox)}
						/>
					</div>
				),
			});

		return columns;
	}, [
		canMultiRowSelect,
		classNames.tbody?.td?.checkboxContainer?._,
		classNames.tbody?.td?.checkboxContainer?.checkBox,
		classNames.thead?.th?.checkboxContainer?._,
		classNames.thead?.th?.checkboxContainer?.checkBox,
		filterersKeysMap,
		props.columns,
	]);

	const currentPage = useMemo(() => {
		if (pageViewMode === 'INFINITE_SCROLL')
			return (infiniteQuery?.data?.pages || [])
				.map((page) => page.items)
				.flat(1);

		return infiniteQuery?.data?.pages?.[currentPageIndex]?.items || [];
	}, [currentPageIndex, infiniteQuery.data?.pages, pageViewMode]);

	const table = useReactTable({
		data: currentPage as unknown as TableItem[],
		columns,
		state: { columnFilters, rowSelection },
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		enableColumnResizing: true,
		columnResizeMode: 'onChange',
	});

	const isLoading = useMemo(
		() =>
			infiniteQuery.isInitialLoading ||
			infiniteQuery.isFetchingNextPage ||
			infiniteQuery.isFetchingPreviousPage,
		[
			infiniteQuery.isFetchingNextPage,
			infiniteQuery.isFetchingPreviousPage,
			infiniteQuery.isInitialLoading,
		],
	);

	useMemo(() => {
		store.setState({ table });
	}, [store, table]);

	useEffect(() => {
		if (infiniteQuery.isInitialLoading) setRowSelection({});
	}, [infiniteQuery.isInitialLoading, setRowSelection]);

	return (
		<table
			className={cx(classNames.table)}
			style={{
				tableLayout: tableAutoToFixedOnLoad
					? isLoading
						? 'auto'
						: 'fixed'
					: undefined,
			}}
		>
			<thead className={cx(classNames.thead?._)}>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id} className={cx(classNames.thead?.tr)}>
						{headerGroup.headers.map((header) => (
							<th
								key={header.id}
								className={cx(classNames.thead?.th?._)}
								// header.column.getCanFilter() ? "px-8 py-6" : "px-8 py-4"
								style={{
									width:
										header.column.id === ROW_SELECT
											? 'min-content'
											: header.getSize(),
									paddingLeft: header.column.id === ROW_SELECT ? 0 : undefined,
									paddingRight: header.column.id === ROW_SELECT ? 0 : undefined,
								}}
							>
								<div
									className={cx(classNames.thead?.th?.container)}
									// header.column.getCanFilter() ? "gap-2" : ""
								>
									{header.isPlaceholder ? null : (
										<>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
											{header.column.getCanFilter() ? (
												<div>
													<Filter<TableItem>
														column={header.column}
														table={table}
														store={store}
													/>
												</div>
											) : null}
										</>
									)}
								</div>
								{header.column.getCanResize() && (
									<div
										onMouseDown={header.getResizeHandler()}
										onTouchStart={header.getResizeHandler()}
										className={cx(classNames.thead?.th?.resizeController)}
										style={{
											backgroundColor: header.column.getIsResizing()
												? 'rgb(67 56 202 / var(--tw-bg-opacity, 1))'
												: '',
											opacity: header.column.getIsResizing() ? 1 : '',
										}}
									/>
								)}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody
				className={cx(classNames.tbody?._)}
				style={isLoading ? { position: 'relative', isolation: 'isolate' } : {}}
			>
				{table.getHeaderGroups()[0] && (
					<tr
						className={cx(classNames.tbody?.loadingTr?._)}
						style={
							infiniteQuery.isFetching
								? {
										...(!infiniteQuery.isInitialLoading
											? {
													display: 'flex',
													position: 'absolute',
													flexDirection: 'column',
													top: 0,
													bottom: 0,
													left: 0,
													right: 0,
													zIndex: 2,
											  }
											: {}),

										width: '100%',
										height: '100%',
										flexGrow: 1,
								  }
								: { display: 'none' }
						}
					>
						{table.getHeaderGroups()[0]!.headers.map((headers) => (
							<td
								key={headers.id}
								className={cx(classNames.tbody?.loadingTr?.td)}
								style={
									infiniteQuery.isFetching
										? {
												width: '100%',
												height: '100%',
												flexGrow: 1,
										  }
										: {}
								}
							/>
						))}
					</tr>
				)}
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id} className={cx(classNames.tbody?.tr)}>
						{row.getVisibleCells().map((cell) => (
							<td
								key={cell.id}
								className={cx(classNames.tbody?.td?._)}
								style={{
									width:
										cell.column.id === ROW_SELECT
											? 'min-content'
											: cell.column.getSize(),
									paddingLeft: cell.column.id === ROW_SELECT ? 0 : undefined,
									paddingRight: cell.column.id === ROW_SELECT ? 0 : undefined,
								}}
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
			<tfoot className={cx(classNames.tfoot?._)}>
				{table.getFooterGroups().map((footerGroup) => (
					<tr key={footerGroup.id} className={cx(classNames.tfoot?.tr)}>
						{footerGroup.headers.map((header) => (
							<th
								key={header.id}
								className={cx(classNames.tfoot?.th)}
								style={{ width: header.column.getSize() }}
							>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.footer,
											header.getContext(),
									  )}
							</th>
						))}
					</tr>
				))}
			</tfoot>
		</table>
	);
};