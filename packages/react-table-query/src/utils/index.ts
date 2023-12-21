import { createStore } from 'zustand';

import type {
	TableStore,
	HandleCreateTableStoreProps,
	QueryInput,
} from './types';
import { useRef, useId, useMemo } from 'react';

export const handleCreateTableStore = <TData, TQueryInput extends QueryInput>({
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

		setPagination: (updaterOrValue) =>
			set((prevData) => {
				const pagination =
					typeof updaterOrValue === 'function'
						? updaterOrValue({
								pageIndex: prevData.queryInput.offset ?? 0,
								pageSize: prevData.queryInput.limit ?? 0,
						  })
						: {
								pageIndex:
									updaterOrValue.pageIndex ?? prevData.queryInput.offset,
								pageSize: updaterOrValue.pageSize ?? prevData.queryInput.limit,
						  };

				return {
					queryInput: {
						...prevData.queryInput,
						limit: pagination.pageSize,
						offset: pagination.pageIndex,
					},
				};
			}),
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
	}));

export const useCreateTableStore = <TData, TQueryInput extends QueryInput>(
	props: Omit<HandleCreateTableStoreProps<TQueryInput>, 'baseId'> & {
		baseId?: HandleCreateTableStoreProps<TQueryInput>['baseId'];
	},
) => {
	const baseId = useId();

	const storeRef = useRef(
		handleCreateTableStore<TData, TQueryInput>({
			...props,
			baseId: props.baseId ?? baseId,
		}),
	);

	useMemo(() => {
		if (
			storeRef.current.getState().queryInput.limit !== props.queryInput.limit ??
			storeRef.current.getState().baseId !== props.baseId
		)
			storeRef.current.setState(() => ({
				limit: props.queryInput.limit,
				baseId: props.baseId,
			}));
	}, [props.baseId, props.queryInput.limit]);

	return storeRef.current;
};
