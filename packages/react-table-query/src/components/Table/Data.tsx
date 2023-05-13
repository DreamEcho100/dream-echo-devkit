import { type HTMLProps, useEffect, useMemo, useRef } from 'react';
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './Basic';
import { useStore } from 'zustand';
import {
	type CustomTableHeaderProps,
	type CustomTableBodyProps,
	type DataTableProps,
} from '../../utils/types';
import { cx } from '../../utils/internal';

const CustomTableHeader = <TData,>({
	table,
	store,
}: CustomTableHeaderProps<TData>) => {
	const classNames = useStore(store, (store) => store.classNames.thead);

	return (
		<TableHeader className={classNames?._}>
			{table.getHeaderGroups().map((headerGroup) => (
				<TableRow key={headerGroup.id} className={classNames?.tr}>
					{headerGroup.headers.map((header) => {
						return (
							<TableHead
								key={header.id}
								className={cx(
									header.id === 'select'
										? 'data-[select-th="true"]'
										: undefined,
									classNames?.th?._,
								)}
							>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
									  )}
							</TableHead>
						);
					})}
				</TableRow>
			))}
		</TableHeader>
	);
};

const CustomTableBody = <TData,>({
	table,
	columnsLength,
	store,
}: CustomTableBodyProps<TData>) => {
	const classNames = useStore(store, (store) => store.classNames.tbody);

	return (
		<TableBody
			className={classNames?._}
			data-state={table.getRowModel().rows?.length > 0 ? undefined : 'empty'}
		>
			{table.getRowModel().rows?.length > 0 ? (
				table.getRowModel().rows.map((row) => (
					<TableRow
						key={row.id}
						data-state={row.getIsSelected() && 'selected'}
						className={classNames?.tr}
					>
						{row.getVisibleCells().map((cell) => (
							<TableCell
								key={cell.id}
								className={cx(
									cell.id === 'select' ? 'data-[select-th="true"]' : undefined,
									classNames?.td?._,
								)}
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableCell>
						))}
					</TableRow>
				))
			) : (
				<TableRow data-state='empty'>
					<TableCell
						colSpan={columnsLength}
						data-state='empty'
						className='h-24 text-center'
					>
						No results.
					</TableCell>
				</TableRow>
			)}
		</TableBody>
	);
};

const IndeterminateCheckbox = ({
	indeterminate,
	className = '',
	...props
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) => {
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		if (typeof indeterminate === 'boolean') {
			ref.current.indeterminate = !props.checked && indeterminate;
		}
	}, [indeterminate, props.checked]);

	return <input type='checkbox' ref={ref} className={className} {...props} />;
};

const QueryTable = <TData, TValue>({
	columns,
	store,
	infiniteQuery,
}: DataTableProps<TData, TValue>) => {
	//
	const sorting = useStore(store, (store) => store.sorting);
	const columnFilters = useStore(store, (store) => store.columnFilters);
	const columnVisibility = useStore(store, (store) => store.columnVisibility);
	const rowSelection = useStore(store, (store) => store.rowSelection);
	const storeUtils = useStore(store, (store) => store.utils);
	const pageViewMode = useStore(store, (state) => state.pageViewMode);
	//
	const pageIndex = useStore(store, (state) => state.pageIndex);
	const canMultiRowSelect = useStore(store, (state) => state.canMultiRowSelect);

	const modifiedColumns: typeof columns = useMemo(() => {
		return [
			{
				id: 'select',
				header: ({ table }) => (
					<IndeterminateCheckbox
						checked={table.getIsAllRowsSelected()}
						indeterminate={table.getIsSomeRowsSelected()}
						onChange={table.getToggleAllRowsSelectedHandler()}
						// className={cx(classNames.thead?.th?.checkboxContainer?.checkBox)}
					/>
				),
				cell: ({ row }) => (
					<IndeterminateCheckbox
						checked={row.getIsSelected()}
						indeterminate={row.getIsSomeSelected()}
						onChange={row.getToggleSelectedHandler()}
						// className={cx(classNames.tbody?.td?.checkboxContainer?.checkBox)}
					/>
				),
				enableSorting: false,
				enableHiding: canMultiRowSelect,
			},
			...columns,
		];
	}, [columns, canMultiRowSelect]);

	const defaultPage = useMemo(() => [], []);
	const currentPage = useMemo(() => {
		if (pageViewMode === 'INFINITE_SCROLL')
			return (infiniteQuery?.data?.pages || defaultPage)
				.map((page) => page.items)
				.flat(1);

		return infiniteQuery?.data?.pages?.[pageIndex]?.items || defaultPage;
	}, [pageIndex, infiniteQuery.data?.pages, pageViewMode, defaultPage]);

	const pagination = useMemo(
		() => ({
			pageIndex,
			pageSize: infiniteQuery?.data?.pages.length || 0,
		}),
		[pageIndex, infiniteQuery?.data?.pages.length],
	);

	const table = useReactTable({
		data: currentPage,
		columns: modifiedColumns,
		onSortingChange: storeUtils.setSorting,
		onColumnFiltersChange: storeUtils.setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: storeUtils.setPagination,
		onColumnVisibilityChange: storeUtils.setColumnVisibility,
		onRowSelectionChange: storeUtils.setRowSelection,
		manualPagination: true,
		manualFiltering: true,
		manualSorting: true,
		state: {
			pagination,
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	useMemo(() => store.setState({ table }), [store, table]);

	return (
		<Table>
			<CustomTableHeader table={table} store={store} />
			<CustomTableBody
				table={table}
				columnsLength={columns.length}
				store={store}
			/>
		</Table>
	);
};

export default QueryTable;
