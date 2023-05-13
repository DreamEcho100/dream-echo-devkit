import { createStore } from 'zustand';

import type { TableStore, TableClassNames, PageViewMode } from './types';
import { useRef, useEffect } from 'react';

export const handleCreateTableStore = <TData extends Record<string, unknown>>({
	filterByFormValues = {},
	classNames = {},
	pageViewMode = 'PAGING',
	tableAutoToFixedOnLoad = false,
}: {
	filterByFormValues?: TableStore<TData>['filterByFormValues'];
	classNames?: TableClassNames;
	pageViewMode?: PageViewMode;
	tableAutoToFixedOnLoad?: boolean;
}) =>
	createStore<TableStore<TData>>((set) => ({
		classNames,
		table: null,
		columnFilters: [],
		rowSelection: {},
		filterByFormValues,
		debouncedValue: {},
		pageIndex: 0,
		remoteFilter: true,
		pageViewMode,
		tableAutoToFixedOnLoad,

		utils: {
			incrementCurrentPageIndex: () =>
				set((state: TableStore<TData>) => ({
					pageIndex: state.pageIndex + 1,
				})),
			decrementCurrentPageIndex: () =>
				set((state: TableStore<TData>) => ({
					pageIndex: state.pageIndex - 1,
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
			setFilterByFormValues: (updaterOrValue) =>
				set((prevData) => ({
					filterByFormValues: !prevData.filterByFormValues
						? prevData.filterByFormValues
						: typeof updaterOrValue === 'function'
						? updaterOrValue(prevData.filterByFormValues)
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
