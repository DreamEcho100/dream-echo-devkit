import { createStore } from 'zustand';

import type { TableStore, TableClassNames, PageViewMode } from './types';

export const handleCreateStore = <TData extends Record<string, unknown>[]>({
	filterByFormValues = {},
	classNames,
	pageViewMode = 'PAGING',
}: {
	filterByFormValues?: TableStore<TData[number]>['filterByFormValues'];
	classNames?: TableClassNames;
	pageViewMode?: PageViewMode;
}) =>
	createStore<TableStore<TData[number]>>((set) => ({
		classNames,
		table: null,
		columnFilters: [],
		rowSelection: {},
		filterByFormValues,
		debouncedValue: {},
		currentPageIndex: 0,
		remoteFilter: true,
		pageViewMode,

		utils: {
			incrementCurrentPageIndex: () =>
				set((state: TableStore<TData[number]>) => ({
					currentPageIndex: state.currentPageIndex + 1,
				})),
			decrementCurrentPageIndex: () =>
				set((state: TableStore<TData[number]>) => ({
					currentPageIndex: state.currentPageIndex - 1,
				})),
			setRowSelection: (updaterOrValue) =>
				set((prevData: TableStore<TData[number]>) => ({
					rowSelection:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.rowSelection)
							: updaterOrValue,
				})),
			setColumnFilters: (updaterOrValue) =>
				set((prevData: TableStore<TData[number]>) => ({
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
