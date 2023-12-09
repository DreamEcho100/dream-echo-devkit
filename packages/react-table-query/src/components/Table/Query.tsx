import { useEffect, useMemo } from 'react';
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import {
	IndeterminateCheckbox,
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
	type QueryInput,
} from '../../utils/types';
import { useGetTableCurrentPageAndPagination } from '../../utils/internal';

const CustomTableHeader = <TData, TQueryInput extends QueryInput>({
	table,
	store,
}: CustomTableHeaderProps<TData, TQueryInput>) => {
	const classNames = useStore(store, (store) => store.classNames.thead);

	return (
		<TableHeader className={classNames?._}>
			{table.getHeaderGroups().map((headerGroup) => (
				<TableRow key={headerGroup.id} className={classNames?.tr}>
					{headerGroup.headers.map((header) => {
						return (
							<TableHead
								key={header.id}
								data-id={header.id}
								className={classNames?.th?._}
								data-select-th={header.id === 'select' ? true : undefined}
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

const CustomTableBody = <TData, TQueryInput extends QueryInput>({
	table,
	columnsLength,
	store,
}: CustomTableBodyProps<TData, TQueryInput>) => {
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
								className={classNames?.td?._}
								data-select-td={cell.column.id === 'select' ? true : undefined}
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

const QueryTable = <TData, TQueryInput extends QueryInput, TError = unknown>({
	columns,
	store,
	infiniteQuery,
}: DataTableProps<TData, TQueryInput, TError>) => {
	//
	const storeUtils = useStore(store, (store) => store);
	const canMultiRowSelect = useStore(store, (state) => state.canMultiRowSelect);
	const modifiedColumns: typeof columns = useMemo(() => {
		return [
			{
				id: 'select',
				header: ({ table }) => (
					<IndeterminateCheckbox
						checked={table.getIsAllRowsSelected()}
						indeterminate={table.getIsSomeRowsSelected()}
						onChange={table.getToggleAllRowsSelectedSchema()}
						tContainerType='thead'
						store={store}
						// className={cx(classNames.thead?.th?.checkboxContainer?.checkBox)}
					/>
				),
				cell: ({ row }) => (
					<IndeterminateCheckbox
						checked={row.getIsSelected()}
						indeterminate={row.getIsSomeSelected()}
						onChange={row.getToggleSelectedSchema()}
						tContainerType='tbody'
						store={store}
						// className={cx(classNames.tbody?.td?.checkboxContainer?.checkBox)}
					/>
				),
				enableSorting: false,
				enableHiding: canMultiRowSelect,
			},
			...columns,
		];
	}, [canMultiRowSelect, columns, store]);

	//
	const sorting = useStore(store, (store) => store.sorting);
	const columnFilters = useStore(store, (store) => store.columnFilters);
	const columnVisibility = useStore(store, (store) => store.columnVisibility);
	const rowSelection = useStore(store, (store) => store.rowSelection);

	const currentPageAndPagination = useGetTableCurrentPageAndPagination({
		infiniteQuery,
		store,
	});

	const table = useReactTable({
		data: currentPageAndPagination.currentPage,
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
			pagination: currentPageAndPagination.pagination,
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	useEffect(() => store.setState({ table }), [store, table]);

	return (
		<Table store={store}>
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
