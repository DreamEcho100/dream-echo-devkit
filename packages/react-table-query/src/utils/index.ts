import { createStore } from 'zustand';

import type {
	TableStore,
	HandleCreateTableStoreProps,
	QueryInput,
} from './types';
import { useRef, useId, useMemo } from 'react';

export const handleCreateTableStore = <
	TData,
	TQueryInput extends QueryInput = QueryInput,
>({
	classNames = {},
	pageViewMode = 'PAGING',
	canMultiRowSelect = false,
	tableAutoToFixedOnLoad = false,
	columnVisibility = {},
	baseId = '',
	queryInput,
}: HandleCreateTableStoreProps<TQueryInput>) =>
	createStore<TableStore<TData, TQueryInput>>((set) => ({
		table: null,
		baseId,

		queryInput,
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
					queryInput: {
						...prevData.queryInput,
						...(typeof updaterOrValue === 'function'
							? updaterOrValue({
									pageIndex: prevData.queryInput.pageIndex || 0,
									pageSize: prevData.queryInput.pageSize || 0,
							  })
							: updaterOrValue),
					},
				})),
			setQueryInput: (updaterOrValue) =>
				set((prevData) => ({
					queryInput:
						typeof updaterOrValue === 'function'
							? updaterOrValue(prevData.queryInput)
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

export const useCreateTableStore = <
	TData,
	TQueryInput extends QueryInput = QueryInput,
>(
	props: Omit<HandleCreateTableStoreProps<TQueryInput>, 'baseId'> & {
		baseId?: HandleCreateTableStoreProps<TQueryInput>['baseId'];
	},
) => {
	const baseId = useId();

	const storeRef = useRef(
		handleCreateTableStore<TData, TQueryInput>({
			...props,
			baseId: props.baseId || baseId,
		}),
	);

	useMemo(() => {
		if (
			storeRef.current.getState().queryInput.pageSize !==
				props.queryInput.pageSize ||
			storeRef.current.getState().baseId !== props.baseId
		)
			storeRef.current.setState(() => ({
				pageSize: props.queryInput.pageSize,
				baseId: props.baseId,
			}));
	}, [props.baseId, props.queryInput.pageSize]);

	return storeRef.current;
};
