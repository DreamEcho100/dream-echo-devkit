import * as zustand from 'zustand';
import { StoreApi } from 'zustand';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { UseTRPCInfiniteQueryResult } from '@trpc/react-query/shared';
import * as _tanstack_react_table from '@tanstack/react-table';
import { Table, RowSelectionState, ColumnFiltersState, DeepKeys, ColumnDef } from '@tanstack/react-table';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { StoreApi as StoreApi$1 } from 'zustand/vanilla';

type TStringFilter = {
    dataType: 'text';
    filterType: 'CONTAINS';
    value?: string;
    constraints?: {
        min?: number;
        max?: number;
    };
};
type TNumberFilter = {
    dataType: 'number';
    constraints?: {
        min?: number;
        max?: number;
    };
} & ({
    filterType: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL';
    value?: number;
} | {
    filterType: 'RANGE';
    value?: {
        min?: number;
        max?: number;
    };
});
type TFilters = TStringFilter | TNumberFilter;
type StoreUpdaterOrValue<TData extends Record<string, unknown>, TableKey extends keyof TableStore<TData>> = TableStore<TData>[TableKey] | ((prevData: TableStore<TData>[TableKey]) => TableStore<TData>[TableKey]);
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
    tfoot?: {
        _?: string;
        tr?: string;
        th?: string;
    };
};
type PageViewMode = 'PAGING' | 'INFINITE_SCROLL';
type TableStore<TData extends Record<string, unknown>> = {
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
        setRowSelection: (updaterOrValue: StoreUpdaterOrValue<TData, 'rowSelection'>) => void;
        setColumnFilters: (updaterOrValue: StoreUpdaterOrValue<TData, 'columnFilters'>) => void;
        setFilterByFormValues: (updaterOrValue: StoreUpdaterOrValue<TData, 'filterByFormValues'>) => void;
    };
};
type InfiniteQuery<TData> = UseInfiniteQueryResult<{
    items: TData[];
} & Record<string, unknown>, {
    message: string;
} & Record<string, unknown>> | UseTRPCInfiniteQueryResult<{
    items: TData[];
    nextCursor: unknown;
}, unknown>;

declare const handleCreateTableStore: <TData extends Record<string, unknown>>({ filterByFormValues, classNames, pageViewMode, tableAutoToFixedOnLoad, }: {
    filterByFormValues?: Partial<Record<_tanstack_react_table.DeepKeys<TData>, TFilters>> | undefined;
    classNames?: TableClassNames | undefined;
    pageViewMode?: PageViewMode | undefined;
    tableAutoToFixedOnLoad?: boolean | undefined;
}) => zustand.StoreApi<TableStore<TData>>;
declare const useCreateTableStore: <TData extends Record<string, unknown>>(props: {
    filterByFormValues?: Partial<Record<_tanstack_react_table.DeepKeys<TData>, TFilters>> | undefined;
    classNames?: TableClassNames | undefined;
    pageViewMode?: PageViewMode | undefined;
    tableAutoToFixedOnLoad?: boolean | undefined;
}) => zustand.StoreApi<TableStore<TData>>;

declare const TableMetaData: <QueryItem extends Record<string, unknown>, TableItem extends Record<keyof QueryItem | Exclude<string, keyof QueryItem>, unknown>>({ infiniteQuery, store, classNames, }: {
    infiniteQuery: InfiniteQuery<QueryItem>;
    store: StoreApi<TableStore<TableItem>>;
    classNames?: {
        container: string;
        refetchButton: string;
        previousPageButton: string;
        nextPageButton: string;
    } | undefined;
}) => react_jsx_runtime.JSX.Element;

declare const TableLoadMore: <QueryItem extends Record<string, unknown>, TableItem extends Record<keyof QueryItem | Exclude<string, keyof QueryItem>, unknown>>({ infiniteQuery, store, classNames, }: {
    infiniteQuery: InfiniteQuery<QueryItem>;
    store: StoreApi<TableStore<TableItem>>;
    classNames?: {
        container: string;
        loadMoreButton: string;
    } | undefined;
}) => react_jsx_runtime.JSX.Element;

declare const CustomTable: <QueryItem extends Record<string, unknown>, TableItem extends Record<keyof QueryItem | Exclude<string, keyof QueryItem>, unknown>>({ infiniteQuery, store, canMultiRowSelect, ...props }: {
    infiniteQuery: InfiniteQuery<QueryItem>;
    columns: ColumnDef<TableItem>[];
    store: StoreApi$1<TableStore<TableItem>>;
    canMultiRowSelect?: boolean | undefined;
}) => react_jsx_runtime.JSX.Element;

export { CustomTable, InfiniteQuery, PageViewMode, StoreUpdaterOrValue, TFilters, TStringFilter, TableClassNames, TableLoadMore, TableMetaData, TableStore, handleCreateTableStore, useCreateTableStore };
