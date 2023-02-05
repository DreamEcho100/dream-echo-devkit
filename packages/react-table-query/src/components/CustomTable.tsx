import type { ColumnDef } from '@tanstack/react-table';
import type { Dispatch, SetStateAction } from 'react';

import { useEffect, useState, useMemo } from 'react';
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable
} from '@tanstack/react-table';

import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { StoreApi } from 'zustand/vanilla';
import { TableStore } from '../utils/types';
import Filter from './Filter';
import { cx } from 'class-variance-authority';
import IndeterminateCheckbox from './IndeterminateCheckbox';

const CustomTable = <TData extends Record<string, any>>({
	infiniteQuery,
	setOnQueryKeyChange,
	store,
	...props
}: {
	infiniteQuery: UseInfiniteQueryResult<
		{
			data: TData[];
		} & Record<string, unknown>,
		{
			message: string;
		} & Record<string, unknown>
	>;
	columns: ColumnDef<TData, any>[];
	setOnQueryKeyChange: Dispatch<
		SetStateAction<(() => void) | null | undefined>
	>;
	store: StoreApi<TableStore<TData>>;
}) => {
	const currentPageIndex = useStore(
		store,
		(state: TableStore<TData>) => state.currentPageIndex
	);
	const rowSelection = useStore(
		store,
		(state: TableStore<TData>) => state.rowSelection
	);
	const columnFilters = useStore(
		store,
		(state: TableStore<TData>) => state.columnFilters
	);
	const filterByFormValues = useStore(
		store,
		(state: TableStore<TData>) => state.filterByFormValues
	);

	const [filterersKeysMap, setFilterersKeys] = useState(
		Object.fromEntries(
			Object.keys(filterByFormValues || {}).map((key) => [key, true])
		)
	);

	useEffect(() => {
		const _filterersKeys = Object.keys(filterByFormValues || {});
		// use useRef to reduce computation
		const filteredKeys = Object.keys(filterersKeysMap || {});

		if (_filterersKeys.join() !== filteredKeys.join())
			setFilterersKeys(
				Object.fromEntries(_filterersKeys.map((key) => [key, true]))
			);
	}, [filterByFormValues, filterersKeysMap]);

	const setRowSelection = useStore(
		store,
		(state: TableStore<TData>) => state.setRowSelection
	);
	const setColumnFilters = useStore(
		store,
		(state: TableStore<TData>) => state.setColumnFilters
	);

	const columns: ColumnDef<TData, any>[] = useMemo(
		() => [
			{
				id: 'select',
				enableHiding: true,
				header: ({ table }) => (
					<div className='px-1 flex items-center justify-center'>
						<IndeterminateCheckbox
							{...{
								checked: table.getIsAllRowsSelected(),
								indeterminate: table.getIsSomeRowsSelected(),
								onChange: table.getToggleAllRowsSelectedHandler()
							}}
						/>
					</div>
				),
				cell: ({ row }) => (
					<div className='w-full px-1 flex items-center justify-center'>
						<IndeterminateCheckbox
							{...{
								checked: row.getIsSelected(),
								indeterminate: row.getIsSomeSelected(),
								onChange: row.getToggleSelectedHandler()
							}}
						/>
					</div>
				)
			},
			...props.columns.map((column) => ({
				...column,
				enableColumnFilter: !!(
					(column as { accessorKey?: string }).accessorKey &&
					filterersKeysMap[(column as { accessorKey: string }).accessorKey]
				)
			}))
		],
		[filterersKeysMap, props.columns]
	);

	const currentPage = useMemo(
		() => infiniteQuery?.data?.pages?.[currentPageIndex]?.data || [],
		[currentPageIndex, infiniteQuery.data?.pages]
	);

	const table = useReactTable({
		data: currentPage,
		columns,
		state: { columnFilters, rowSelection },
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		enableColumnResizing: true,
		columnResizeMode: 'onChange'
		// debugAll: process.env.NODE_ENV === 'development'
		// debugTable: process.env.NODE_ENV === 'development',
		// debugHeaders: process.env.NODE_ENV === 'development',
		// debugColumns: process.env.NODE_ENV === 'development',
		// debugRows: process.env.NODE_ENV === 'development',
	});

	useEffect(() => {
		if (infiniteQuery.isFetching && !infiniteQuery.isFetchingNextPage)
			setRowSelection({});
	}, [
		infiniteQuery.isFetching,
		infiniteQuery.isFetchingNextPage,
		setRowSelection
	]);

	useEffect(() => {
		setOnQueryKeyChange(() => {
			setRowSelection({});
		});
	}, [setOnQueryKeyChange, setRowSelection]);

	return (
		<table
			className={cx(
				'color-scheme-light dark:color-scheme-dark w-full text-left rtl:text-right text-gray-900/90 dark:text-gray-400',
				infiniteQuery.isLoading ? 'table-auto' : 'table-auto'
			)}
		>
			<thead className='text-gray-900/90 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th
								key={header.id}
								className={cx(
									'group border border-gray-900 dark:border-gray-400',
									header.column.getCanFilter() ? 'py-6 px-8' : 'py-4 px-8'
								)}
								style={{ position: 'relative', width: header.getSize() }}
							>
								<div
									className={cx(
										'w-full h-full flex flex-col items-center',
										header.column.getCanFilter() ? 'gap-2' : ''
									)}
								>
									{header.isPlaceholder ? null : (
										<>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
											{header.column.getCanFilter() ? (
												<div>
													<Filter<TData>
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
										className={`resizer opacity-0 group-hover:bg-indigo-400 hover:opacity-0 group-hover:opacity-100 cursor-col-resize absolute right-0 top-0 h-full w-1 select-none bg-black/50 touch-none ${
											header.column.getIsResizing()
												? 'isResizing bg-indigo-700 opacity-100'
												: ''
										}`}
									/>
								)}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr
						key={row.id}
						className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900'
					>
						{row.getVisibleCells().map((cell) => (
							<td
								key={cell.id}
								className='min-w-fit p-4 border border-gray-900 dark:border-gray-400'
								style={{ width: cell.column.getSize() }}
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
			<tfoot className='text-gray-900/90 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>
				{table.getFooterGroups().map((footerGroup) => (
					<tr key={footerGroup.id} className='border border-green-500'>
						{footerGroup.headers.map((header) => (
							<th
								key={header.id}
								className='border border-gray-900 dark:border-gray-400 p-2'
								style={{ width: header.column.getSize() }}
							>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.footer,
											header.getContext()
									  )}
							</th>
						))}
					</tr>
				))}
			</tfoot>
		</table>
	);
};

export default CustomTable;
