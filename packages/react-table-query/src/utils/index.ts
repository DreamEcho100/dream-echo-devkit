import { createStore } from 'zustand';

import type { TableStore, TableClassNames, PageViewMode } from './types';
import { useRef, useEffect } from 'react';

export const handleCreateTableStore = <TData extends Record<string, unknown>>({
	classNames = {},
	pageViewMode = 'PAGING',
	canMultiRowSelect = false,
	tableAutoToFixedOnLoad = false,
}: {
	classNames?: TableClassNames;
	pageViewMode?: PageViewMode;
	tableAutoToFixedOnLoad?: boolean;
	canMultiRowSelect?: boolean;
}) =>
	createStore<TableStore<TData>>((set) => ({
		table: null,

		currentPageIndex: 0,
		classNames,
		pageViewMode,
		canMultiRowSelect,
		tableAutoToFixedOnLoad,

		columnFilters: [],
		rowSelection: {},
		columnVisibility: {},
		sorting: [],

		utils: {
			incrementCurrentPageIndex: () =>
				set((state: TableStore<TData>) => ({
					currentPageIndex: state.currentPageIndex + 1,
				})),
			decrementCurrentPageIndex: () =>
				set((state: TableStore<TData>) => ({
					currentPageIndex: state.currentPageIndex - 1,
				})),
			setRowSelection: (updaterOrValue) =>
				set((prevData: TableStore<TData>) => ({
					rowSelection:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.rowSelection)
							: updaterOrValue,
				})),
			setColumnFilters: (updaterOrValue) =>
				set((prevData: TableStore<TData>) => ({
					columnFilters:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.columnFilters)
							: updaterOrValue,
				})),
			setColumnVisibility: (updaterOrValue) =>
				set((prevData: TableStore<TData>) => ({
					columnVisibility:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.columnVisibility)
							: updaterOrValue,
				})),
			setSorting: (updaterOrValue) =>
				set((prevData: TableStore<TData>) => ({
					sorting:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.sorting)
							: updaterOrValue,
				})),
		},
	}));

export const useCreateTableStore = <TData extends Record<string, unknown>>(
	props: Parameters<typeof handleCreateTableStore<TData>>[0],
) => {
	const formStoreRef = useRef(handleCreateTableStore(props));
	const configRef = useRef({ counter: 0 });

	useEffect(() => {
		configRef.current.counter++;

		if (configRef.current.counter === 1) return;
		formStoreRef.current = handleCreateTableStore(props);
	}, [props]);

	return formStoreRef.current;
};
