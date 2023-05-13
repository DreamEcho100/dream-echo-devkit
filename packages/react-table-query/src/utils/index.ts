import { createStore } from 'zustand';

import type { TableStore, HandleCreateTableStoreProps } from './types';
import { useRef, useId, useMemo } from 'react';

export const handleCreateTableStore = <TData extends Record<string, unknown>>({
	classNames = {},
	pageViewMode = 'PAGING',
	canMultiRowSelect = false,
	tableAutoToFixedOnLoad = false,
	columnVisibility = {},
	baseId = '',
	pageSize,
}: HandleCreateTableStoreProps) =>
	createStore<TableStore<TData>>((set) => ({
		table: null,
		baseId,

		pageIndex: 0,
		pageSize,
		classNames,
		pageViewMode,
		canMultiRowSelect,
		tableAutoToFixedOnLoad,

		columnFilters: [],
		rowSelection: {},
		columnVisibility,
		sorting: [],

		utils: {
			setPagination: (updaterOrValue) =>
				set((prevData) => ({
					...(typeof updaterOrValue === 'function'
						? updaterOrValue({
								pageIndex: prevData.pageIndex,
								pageSize: prevData.pageSize,
						  })
						: updaterOrValue),
				})),
			setPageIndex: (updaterOrValue) =>
				set((prevData) => ({
					pageIndex:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.pageIndex)
							: updaterOrValue,
				})),
			setRowSelection: (updaterOrValue) =>
				set((prevData) => ({
					rowSelection:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.rowSelection)
							: updaterOrValue,
				})),
			setColumnFilters: (updaterOrValue) =>
				set((prevData) => ({
					columnFilters:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.columnFilters)
							: updaterOrValue,
				})),
			setColumnVisibility: (updaterOrValue) =>
				set((prevData) => ({
					columnVisibility:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.columnVisibility)
							: updaterOrValue,
				})),
			setSorting: (updaterOrValue) =>
				set((prevData) => ({
					sorting:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.sorting)
							: updaterOrValue,
				})),
		},
	}));

export const useCreateTableStore = <TData extends Record<string, unknown>>(
	props: Omit<HandleCreateTableStoreProps, 'baseId'> & {
		baseId?: HandleCreateTableStoreProps['baseId'];
	},
) => {
	const baseId = useId();

	const storeRef = useRef(
		handleCreateTableStore<TData>({ ...props, baseId: props.baseId || baseId }),
	);

	useMemo(() => {
		if (
			storeRef.current.getState().pageSize !== props.pageSize ||
			storeRef.current.getState().baseId !== props.baseId
		)
			storeRef.current.setState(() => ({
				pageSize: props.pageSize,
				baseId: props.baseId,
			}));
	}, [props.baseId, props.pageSize]);

	return storeRef.current;
};
