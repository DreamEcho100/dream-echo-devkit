import { createStore } from 'zustand';

import type { TableStore, TableClassNames, PageViewMode } from './types';
import { useRef, useEffect, useId } from 'react';

type HandleCreateTableStoreProps = {
	classNames?: TableClassNames;
	pageViewMode?: PageViewMode;
	tableAutoToFixedOnLoad?: boolean;
	canMultiRowSelect?: boolean;
	baseId: string;
};

export const handleCreateTableStore = <TData extends Record<string, unknown>>({
	classNames = {},
	pageViewMode = 'PAGING',
	canMultiRowSelect = false,
	tableAutoToFixedOnLoad = false,
	baseId,
}: HandleCreateTableStoreProps) =>
	createStore<TableStore<TData>>((set) => ({
		table: null,
		baseId,

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
	props: Omit<HandleCreateTableStoreProps, 'baseId'> & {
		baseId?: HandleCreateTableStoreProps['baseId'];
	},
) => {
	const baseId = useId();

	const formStoreRef = useRef(
		handleCreateTableStore<TData>({ ...props, baseId: props.baseId || baseId }),
	);
	const configRef = useRef({ counter: 0 });

	useEffect(() => {
		configRef.current.counter++;

		if (configRef.current.counter === 1) return;
		formStoreRef.current = handleCreateTableStore<TData>({
			...props,
			baseId: props.baseId || baseId,
		});
	}, [baseId, props]);

	return formStoreRef.current;
};
