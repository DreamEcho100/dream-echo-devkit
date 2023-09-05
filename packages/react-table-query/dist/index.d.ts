import * as zustand from 'zustand';
import { StoreApi } from 'zustand';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { Table, RowSelectionState, SortingState, ColumnFiltersState, VisibilityState, ColumnDef } from '@tanstack/react-table';
import { UseTRPCInfiniteQueryResult } from '@trpc/react-query/shared';
import * as react_jsx_runtime from 'react/jsx-runtime';

type QueryInput = {
    offset?: number | null | undefined;
    limit?: number | null | undefined;
} & Record<string, unknown>;
type InferItemFromInfiniteQuery<TInfiniteQuery, TError> = TInfiniteQuery extends UseTRPCInfiniteQueryResult<infer IData, TError> ? IData extends {
    items: (infer TIem)[];
} ? TIem : never : TInfiniteQuery extends UseInfiniteQueryResult<infer IData, TError> ? IData extends {
    items: (infer TIem)[];
} ? TIem : never : never;
type InfiniteQuery<TData = unknown, TError = unknown> = UseInfiniteQueryResult<{
    items: TData[];
} & Record<string, unknown>, TError> | UseTRPCInfiniteQueryResult<{
    items: TData[];
    nextCursor: unknown;
}, TError>;
type StoreUpdaterOrValue<TData, TQueryInput extends QueryInput, TableKey = unknown> = TableKey extends keyof TableStore<TData, TQueryInput> ? TableStore<TData, TQueryInput>[TableKey] | ((prevData: TableStore<TData, TQueryInput>[TableKey]) => TableStore<TData, TQueryInput>[TableKey]) : never;
type PageViewMode = 'PAGING' | 'INFINITE_SCROLL';
type TableClassNames = {
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
        loadingTr?: {
            _?: string;
            td?: string;
        };
        td?: {
            _?: string;
            selectCheckBoxContainer?: {
                _?: string;
                checkbox?: string;
            };
        };
    };
};
type TableStore<TData, TQueryInput extends QueryInput> = {
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
        setQueryInput: (updaterOrValue: TQueryInput | ((prev: TQueryInput) => TQueryInput)) => void;
        setPagination: (updaterOrValue: {
            pageIndex: number;
            pageSize: number;
        } | ((pagination: {
            pageIndex: number;
            pageSize: number;
        }) => {
            pageIndex: number;
            pageSize: number;
        })) => void;
        setRowSelection: (updaterOrValue: StoreUpdaterOrValue<TData, TQueryInput, 'rowSelection'>) => void;
        setSorting: (updaterOrValue: StoreUpdaterOrValue<TData, TQueryInput, 'sorting'>) => void;
        setColumnFilters: (updaterOrValue: StoreUpdaterOrValue<TData, TQueryInput, 'columnFilters'>) => void;
        setColumnVisibility: (updaterOrValue: StoreUpdaterOrValue<TData, TQueryInput, 'columnVisibility'>) => void;
    };
};
type HandleCreateTableStoreProps<TQueryInput extends QueryInput> = {
    classNames?: TableClassNames;
    pageViewMode?: PageViewMode;
    columnVisibility?: VisibilityState;
    tableAutoToFixedOnLoad?: boolean;
    canMultiRowSelect?: boolean;
    baseId?: string;
    queryInput: TQueryInput;
};
interface DataTableProps<TData, TQueryInput extends QueryInput, TError = unknown> {
    columns: ColumnDef<TData, unknown>[];
    infiniteQuery: InfiniteQuery<TData, TError>;
    store: StoreApi<TableStore<TData, TQueryInput>>;
}
interface UseGetTableCurrentPageAndPaginationProps<TData, TQueryInput extends QueryInput> {
    infiniteQuery: InfiniteQuery<TData>;
    store: StoreApi<TableStore<TData, TQueryInput>>;
}
type CustomTableBodyProps<TData, TQueryInput extends QueryInput> = {
    table: Table<TData>;
    columnsLength: number;
    store: StoreApi<TableStore<TData, TQueryInput>>;
};
type CustomTableHeaderProps<TData, TQueryInput extends QueryInput> = {
    table: Table<TData>;
    store: StoreApi<TableStore<TData, TQueryInput>>;
};

declare const handleCreateTableStore: <TData, TQueryInput extends QueryInput>({ classNames, pageViewMode, canMultiRowSelect, tableAutoToFixedOnLoad, columnVisibility, baseId, queryInput, }: HandleCreateTableStoreProps<TQueryInput>) => zustand.StoreApi<TableStore<TData, TQueryInput>>;
declare const useCreateTableStore: <TData, TQueryInput extends QueryInput>(props: Omit<HandleCreateTableStoreProps<TQueryInput>, "baseId"> & {
    baseId?: string | undefined;
}) => zustand.StoreApi<TableStore<TData, TQueryInput>>;

declare const TableLoadMore: <TData, TQueryInput extends QueryInput, TError = unknown>({ infiniteQuery, store, classNames, }: {
    infiniteQuery: InfiniteQuery<TData, TError>;
    store: StoreApi<TableStore<TData, TQueryInput>>;
    classNames?: {
        container: string;
        loadMoreButton: string;
    } | undefined;
}) => react_jsx_runtime.JSX.Element;

declare const QueryTable: <TData, TQueryInput extends QueryInput, TError = unknown>({ columns, store, infiniteQuery, }: DataTableProps<TData, TQueryInput, TError>) => react_jsx_runtime.JSX.Element;

export { CustomTableBodyProps, CustomTableHeaderProps, DataTableProps, HandleCreateTableStoreProps, InferItemFromInfiniteQuery, InfiniteQuery, PageViewMode, QueryInput, QueryTable, StoreUpdaterOrValue, TableClassNames, TableLoadMore, TableStore, UseGetTableCurrentPageAndPaginationProps, handleCreateTableStore, useCreateTableStore };
