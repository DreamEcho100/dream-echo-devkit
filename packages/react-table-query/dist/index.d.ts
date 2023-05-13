import * as zustand from 'zustand';
import { StoreApi } from 'zustand';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { Table, RowSelectionState, SortingState, ColumnFiltersState, VisibilityState, ColumnDef } from '@tanstack/react-table';
import { UseTRPCInfiniteQueryResult } from '@trpc/react-query/shared';
import * as react_jsx_runtime from 'react/jsx-runtime';

type InfiniteQuery<TData> = UseInfiniteQueryResult<{
    items: TData[];
} & Record<string, unknown>, {
    message: string;
} & Record<string, unknown>> | UseTRPCInfiniteQueryResult<{
    items: TData[];
    nextCursor: unknown;
}, unknown>;
type StoreUpdaterOrValue<TData, TableKey> = TableKey extends keyof TableStore<TData> ? TableStore<TData>[TableKey] | ((prevData: TableStore<TData>[TableKey]) => TableStore<TData>[TableKey]) : never;
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
            checkboxContainer?: {
                _?: string;
                checkBox?: string;
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
            checkboxContainer?: {
                _?: string;
                checkBox?: string;
            };
        };
    };
};
type TableStore<TData> = {
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
        setPageIndex: (updaterOrValue: StoreUpdaterOrValue<TData, 'pageIndex'>) => void;
        setPagination: (updaterOrValue: {
            pageIndex: number;
            pageSize: number;
        } | ((pagination: {
            pageIndex: number;
            pageSize: number;
        }) => void)) => void;
        setRowSelection: (updaterOrValue: StoreUpdaterOrValue<TData, 'rowSelection'>) => void;
        setSorting: (updaterOrValue: StoreUpdaterOrValue<TData, 'sorting'>) => void;
        setColumnFilters: (updaterOrValue: StoreUpdaterOrValue<TData, 'columnFilters'>) => void;
        setColumnVisibility: (updaterOrValue: StoreUpdaterOrValue<TData, 'columnVisibility'>) => void;
    };
};
type HandleCreateTableStoreProps = {
    classNames?: TableClassNames;
    pageViewMode?: PageViewMode;
    columnVisibility?: VisibilityState;
    tableAutoToFixedOnLoad?: boolean;
    canMultiRowSelect?: boolean;
    baseId?: string;
    pageSize: number;
};
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    infiniteQuery: InfiniteQuery<TData>;
    store: StoreApi<TableStore<TData>>;
}
type CustomTableBodyProps<TData> = {
    table: Table<TData>;
    columnsLength: number;
    store: StoreApi<TableStore<TData>>;
};
type CustomTableHeaderProps<TData> = {
    table: Table<TData>;
    store: StoreApi<TableStore<TData>>;
};

declare const handleCreateTableStore: <TData extends Record<string, unknown>>({ classNames, pageViewMode, canMultiRowSelect, tableAutoToFixedOnLoad, columnVisibility, baseId, pageSize, }: HandleCreateTableStoreProps) => zustand.StoreApi<TableStore<TData>>;
declare const useCreateTableStore: <TData extends Record<string, unknown>>(props: Omit<HandleCreateTableStoreProps, 'baseId'> & {
    baseId?: HandleCreateTableStoreProps['baseId'];
}) => zustand.StoreApi<TableStore<TData>>;

declare const TableLoadMore: <TData, TValue>({ infiniteQuery, store, classNames, }: {
    infiniteQuery: InfiniteQuery<TData>;
    store: StoreApi<TableStore<TValue>>;
    classNames?: {
        container: string;
        loadMoreButton: string;
    } | undefined;
}) => react_jsx_runtime.JSX.Element;

declare const QueryTable: <TData, TValue>({ columns, store, infiniteQuery, }: DataTableProps<TData, TValue>) => react_jsx_runtime.JSX.Element;

export { CustomTableBodyProps, CustomTableHeaderProps, DataTableProps, HandleCreateTableStoreProps, InfiniteQuery, PageViewMode, QueryTable, StoreUpdaterOrValue, TableClassNames, TableLoadMore, TableStore, handleCreateTableStore, useCreateTableStore };
