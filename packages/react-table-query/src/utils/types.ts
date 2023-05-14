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

export type TableStore<TData> = {
	table: Table<TData> | null;

	baseId: string;
	pageIndex: number;
	pageSize: number;
	classNames: TableClassNames;
	pageViewMode: PageViewMode;
	tableAutoToFixedOnLoad: boolean;
	canMultiRowSelect: boolean;

	rowSelection: RowSelectionState;
	sorting: SortingState;
	columnFilters: ColumnFiltersState;
	columnVisibility: VisibilityState;

	utils: {
		setPageIndex: (
			updaterOrValue: StoreUpdaterOrValue<TData, 'pageIndex'>,
		) => void;
		setPagination: (
			updaterOrValue:
				| { pageIndex: number; pageSize: number }
				| ((pagination: { pageIndex: number; pageSize: number }) => void), // { pageIndex: number }),
		) => void;
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

export type HandleCreateTableStoreProps = {
	classNames?: TableClassNames;
	pageViewMode?: PageViewMode;
	columnVisibility?: VisibilityState;
	tableAutoToFixedOnLoad?: boolean;
	canMultiRowSelect?: boolean;
	baseId?: string;
	pageSize: number;
};

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	infiniteQuery: InfiniteQuery<TData>;
	store: StoreApi<TableStore<TData>>;
}

export interface UseGetTableCurrentPageAndPaginationProps<TData> {
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
