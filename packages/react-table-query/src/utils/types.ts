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

export type QueryInput = {
	offset?: number | null;
	limit?: number | null;
} & Record<string, unknown>;

export type InfiniteQuery<TData = unknown, TError = unknown> =
	| UseInfiniteQueryResult<
			{
				items: TData[];
			} & Record<string, unknown>,
			TError
	  >
	| UseTRPCInfiniteQueryResult<
			{
				items: TData[];
				nextCursor: unknown;
			},
			TError
	  >;

export type StoreUpdaterOrValue<
	TData,
	TQueryInput extends QueryInput,
	TableKey = unknown,
> = TableKey extends keyof TableStore<TData, TQueryInput>
	?
			| TableStore<TData, TQueryInput>[TableKey]
			| ((
					prevData: TableStore<TData, TQueryInput>[TableKey],
			  ) => TableStore<TData, TQueryInput>[TableKey])
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
			selectCheckBoxContainer?: {
				_?: string;
				checkbox?: string;
			};
		};
	};
	tbody?: {
		_?: string;
		tr?: string;
		loadingTr?: { _?: string; td?: string };
		td?: {
			_?: string;
			selectCheckBoxContainer?: {
				_?: string;
				checkbox?: string;
			};
		};
	};
	// tfoot?: { _?: string; tr?: string; th?: string };
};

export type TableStore<TData, TQueryInput extends QueryInput> = {
	table: Table<TData> | null;

	queryInput: TQueryInput;

	baseId: string;

	classNames: TableClassNames;
	pageViewMode: PageViewMode;
	tableAutoToFixedOnLoad: boolean;
	canMultiRowSelect: boolean;

	rowSelection: RowSelectionState;
	sorting: SortingState;
	columnFilters: ColumnFiltersState;
	columnVisibility: VisibilityState;

	utils: {
		setQueryInput: (
			updaterOrValue: TQueryInput | ((prev: TQueryInput) => TQueryInput),
		) => void;
		setPagination: (
			updaterOrValue:
				| { pageIndex: number; pageSize: number }
				| ((pagination: { pageIndex: number; pageSize: number }) => {
						pageIndex: number;
						pageSize: number;
				  }), // { pageIndex: number }),
		) => void;
		setRowSelection: (
			updaterOrValue: StoreUpdaterOrValue<TData, TQueryInput, 'rowSelection'>,
		) => void;
		setSorting: (
			updaterOrValue: StoreUpdaterOrValue<TData, TQueryInput, 'sorting'>,
		) => void;
		setColumnFilters: (
			updaterOrValue: StoreUpdaterOrValue<TData, TQueryInput, 'columnFilters'>,
		) => void;
		setColumnVisibility: (
			updaterOrValue: StoreUpdaterOrValue<
				TData,
				TQueryInput,
				'columnVisibility'
			>,
		) => void;
	};
};

export type HandleCreateTableStoreProps<TQueryInput extends QueryInput> = {
	classNames?: TableClassNames;
	pageViewMode?: PageViewMode;
	columnVisibility?: VisibilityState;
	tableAutoToFixedOnLoad?: boolean;
	canMultiRowSelect?: boolean;
	baseId?: string;
	queryInput: TQueryInput;
};

export interface DataTableProps<
	TData,
	TQueryInput extends QueryInput,
	TError = unknown,
> {
	columns: ColumnDef<TData, unknown>[];
	infiniteQuery: InfiniteQuery<TData, TError>;
	store: StoreApi<TableStore<TData, TQueryInput>>;
}

export interface UseGetTableCurrentPageAndPaginationProps<
	TData,
	TQueryInput extends QueryInput,
> {
	infiniteQuery: InfiniteQuery<TData>;
	store: StoreApi<TableStore<TData, TQueryInput>>;
}

export type CustomTableBodyProps<TData, TQueryInput extends QueryInput> = {
	table: Table<TData>;
	columnsLength: number;
	store: StoreApi<TableStore<TData, TQueryInput>>;
};

export type CustomTableHeaderProps<TData, TQueryInput extends QueryInput> = {
	table: Table<TData>;
	store: StoreApi<TableStore<TData, TQueryInput>>;
};
