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
