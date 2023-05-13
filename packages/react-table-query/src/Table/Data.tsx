import { useMemo } from 'react';
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
} from '../utils/types';

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
							<TableHead key={header.id} className={classNames?.th?._}>
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
							<TableCell key={cell.id} className={classNames?.td?._}>
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

export function DataTable<TData, TValue>({
	columns,
	store,
	infiniteQuery,
}: DataTableProps<TData, TValue>) {
	//
	const sorting = useStore(store, (store) => store.sorting);
	const columnFilters = useStore(store, (store) => store.columnFilters);
	const columnVisibility = useStore(store, (store) => store.columnVisibility);
	const rowSelection = useStore(store, (store) => store.rowSelection);
	const storeUtils = useStore(store, (store) => store.utils);
	const pageViewMode = useStore(store, (state) => state.pageViewMode);
	//
	const currentPageIndex = useStore(store, (state) => state.currentPageIndex);
	const canMultiRowSelect = useStore(store, (state) => state.canMultiRowSelect);

	const modifiedColumns: typeof columns = useMemo(() => {
		return [
			{
				id: 'select',
				header: ({ table }) => (
					<input
						type='checkbox'
						checked={table.getIsAllPageRowsSelected()}
						onChange={(event) =>
							table.toggleAllPageRowsSelected(!!event.target.checked)
						}
						aria-label='Select all'
					/>
				),
				cell: ({ row }) => (
					<input
						type='checkbox'
						checked={row.getIsSelected()}
						onChange={(event) => row.toggleSelected(!!event.target.checked)}
						aria-label='Select row'
					/>
				),
				enableSorting: false,
				enableHiding: canMultiRowSelect,
			},
			...columns,
		];
	}, [columns, canMultiRowSelect]);

	const currentPage = useMemo(() => {
		if (pageViewMode === 'INFINITE_SCROLL')
			return (infiniteQuery?.data?.pages || [])
				.map((page) => page.items)
				.flat(1);

		return infiniteQuery?.data?.pages?.[currentPageIndex]?.items || [];
	}, [currentPageIndex, infiniteQuery.data?.pages, pageViewMode]);

	const table = useReactTable({
		data: currentPage,
		columns: modifiedColumns,
		onSortingChange: storeUtils.setSorting,
		onColumnFiltersChange: storeUtils.setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: storeUtils.setColumnVisibility,
		onRowSelectionChange: storeUtils.setRowSelection,
		state: {
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
}
/*
    <div className="w-full">
      <div className="flex items-center justify-end py-4 space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
</div>
		*/

/*
<div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
*/
