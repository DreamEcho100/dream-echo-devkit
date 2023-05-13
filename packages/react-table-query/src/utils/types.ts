import { type UseInfiniteQueryResult } from '@tanstack/react-query';
import {
	type Table,
	type RowSelectionState,
	type SortingState,
	type ColumnFiltersState,
	type VisibilityState,
	type ColumnDef,
} from '@tanstack/react-table';
import { type UseTRPCInfiniteQueryResult } from '@trpc/react-query/shared';
import { type StoreApi } from 'zustand';
// import { type InfiniteQuery } from '../../dist';

export type InfiniteQuery<TData> =
	| UseInfiniteQueryResult<
			{
				items: TData[];
			} & Record<string, unknown>,
			{
				message: string;
			} & Record<string, unknown>
	  >
	| UseTRPCInfiniteQueryResult<
			{
				items: TData[];
				nextCursor: unknown;
			},
			unknown
			// {
			//   message: string;
			// } & Record<string, unknown>
	  >;

export type StoreUpdaterOrValue<TData, TableKey> =
	TableKey extends keyof TableStore<TData>
		?
				| TableStore<TData>[TableKey]
				| ((
						prevData: TableStore<TData>[TableKey],
				  ) => TableStore<TData>[TableKey])
		: never;

export type PageViewMode = 'PAGING' | 'INFINITE_SCROLL';

export type TableClassNames = {
	table?: string;
	thead?: {
		_?: string;
		tr?: string;
		th?: {
			_?: string;
			container?: string;
			resizeController?: string;
			checkboxContainer?: {
				_?: string;
				checkBox?: string;
			};
		};
	};
	tbody?: {
		_?: string;
		tr?: string;
		loadingTr?: { _?: string; td?: string };
		td?: {
			_?: string;
			checkboxContainer?: {
				_?: string;
				checkBox?: string;
			};
		};
	};
	// tfoot?: { _?: string; tr?: string; th?: string };
};

export type TableStore<TData> = {
	table: Table<TData> | null;

	baseId: string;
	currentPageIndex: number;
	classNames: TableClassNames;
	pageViewMode: PageViewMode;
	tableAutoToFixedOnLoad: boolean;
	canMultiRowSelect: boolean;

	rowSelection: RowSelectionState;
	sorting: SortingState;
	columnFilters: ColumnFiltersState;
	columnVisibility: VisibilityState;

	utils: {
		incrementCurrentPageIndex: () => unknown;
		decrementCurrentPageIndex: () => unknown;
		setRowSelection: (
			updaterOrValue: StoreUpdaterOrValue<TData, 'rowSelection'>,
		) => void;
		setSorting: (updaterOrValue: StoreUpdaterOrValue<TData, 'sorting'>) => void;
		setColumnFilters: (
			updaterOrValue: StoreUpdaterOrValue<TData, 'columnFilters'>,
		) => void;
		setColumnVisibility: (
			updaterOrValue: StoreUpdaterOrValue<TData, 'columnVisibility'>,
		) => void;
	};
};

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	infiniteQuery: InfiniteQuery<TData>;
	store: StoreApi<TableStore<TData>>;
}

export type CustomTableBodyProps<TData> = {
	table: Table<TData>;
	columnsLength: number;
	store: StoreApi<TableStore<TData>>;
};

export type CustomTableHeaderProps<TData> = {
	table: Table<TData>;
	store: StoreApi<TableStore<TData>>;
};

/*
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

import type { UseTRPCInfiniteQueryResult } from '@trpc/react-query/shared';

import type {
	ColumnFiltersState,
	RowSelectionState,
	Table,
} from '@tanstack/react-table';
import type { DeepKeys } from '@tanstack/react-table';

export type TStringFilter = {
	dataType: 'text';
	filterType: 'CONTAINS';
	// | 'NOT_EQUAL'
	// | 'EQUAL'
	// | 'START_WITH'
	// | 'END_WITH';
	value?: string;
	constraints?: { min?: number; max?: number };
	// valueTransformer?: (value: string) => unknown;
};
type TNumberFilter = {
	dataType: 'number';
	// valueTransformer?: (value: string) => unknown;
	constraints?: { min?: number; max?: number };
} & (
	| {
			filterType:
				| 'EQUAL'
				| 'NOT_EQUAL'
				| 'GREATER_THAN'
				| 'GREATER_THAN_OR_EQUAL'
				| 'LESS_THAN'
				| 'LESS_THAN_OR_EQUAL';
			value?: number;
	  }
	| {
			filterType: 'RANGE';
			value?: { min?: number; max?: number };
	  }
);

export type TFilters = TStringFilter | TNumberFilter;

export type StoreUpdaterOrValue<
	TData extends Record<string, unknown>,
	TableKey extends keyof TableStore<TData>,
> =
	| TableStore<TData>[TableKey]
	| ((prevData: TableStore<TData>[TableKey]) => TableStore<TData>[TableKey]);

export type TableClassNames = {
	table?: string;
	thead?: {
		_?: string;
		tr?: string;
		th?: {
			_?: string;
			container?: string;
			resizeController?: string;
			checkboxContainer?: {
				_?: string;
				checkBox?: string;
			};
		};
	};
	tbody?: {
		_?: string;
		tr?: string;
		loadingTr?: { _?: string; td?: string };
		td?: {
			_?: string;
			checkboxContainer?: {
				_?: string;
				checkBox?: string;
			};
		};
	};
	tfoot?: { _?: string; tr?: string; th?: string };
};

export type PageViewMode = 'PAGING' | 'INFINITE_SCROLL';

export type TableStore<TData extends Record<string, unknown>> = {
	table: Table<TData> | null;
	classNames: TableClassNames;
	rowSelection: RowSelectionState;
	columnFilters: ColumnFiltersState;
	filterByFormValues: Partial<Record<DeepKeys<TData>, TFilters>>;
	remoteFilter: boolean;
	pageViewMode: PageViewMode;
	tableAutoToFixedOnLoad: boolean;

	debouncedValue: Record<string, unknown>;
	currentPageIndex: number;

	utils: {
		incrementCurrentPageIndex: () => unknown;
		decrementCurrentPageIndex: () => unknown;
		setRowSelection: (
			updaterOrValue: StoreUpdaterOrValue<TData, 'rowSelection'>,
		) => void;
		setColumnFilters: (
			updaterOrValue: StoreUpdaterOrValue<TData, 'columnFilters'>,
		) => void;
		setFilterByFormValues: (
			updaterOrValue: StoreUpdaterOrValue<TData, 'filterByFormValues'>,
		) => void;
	};
};

export type InfiniteQuery<TData> =
	| UseInfiniteQueryResult<
			{
				items: TData[];
			} & Record<string, unknown>,
			{
				message: string;
			} & Record<string, unknown>
	  >
	| UseTRPCInfiniteQueryResult<
			{
				items: TData[];
				nextCursor: unknown;
			},
			unknown
			// {
			//   message: string;
			// } & Record<string, unknown>
	  >;
*/
