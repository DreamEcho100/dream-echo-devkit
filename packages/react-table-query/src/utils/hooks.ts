import type {
	GetNextPageParamFunction,
	QueryKey,
	UseInfiniteQueryOptions
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useEffect, useMemo, useRef, useState } from 'react';

import { StoreApi, useStore } from 'zustand';

import type { TableStore } from './types';

export type CustomGetNextPageParam<TData, TQueryKey> =
	| GetNextPageParamFunction<{
			data: TData;
			cursor?: TQueryKey | undefined;
	  }>
	| undefined;

export const useCustomInfiniteQuery = <
	TData,
	TQueryKey extends [string, { cursor: unknown; filterBy?: unknown }]
>({
	initialCursor,
	queryMainKey,
	fetchFn,
	getNextPageParam,
	// onQueryKeyChange,
	options = {},
	filterBy = {}
}: {
	initialCursor: TQueryKey[1]['cursor'];
	queryMainKey: TQueryKey[0];
	filterBy?: NonNullable<TQueryKey[1]['filterBy']>;
	fetchFn: (query: TQueryKey[1]) => Promise<TData>;
	// /**
	//  * Don't forget to memoize it
	//  * @param queryKey
	//  * @returns
	//  */
	// onQueryKeyChange?: (
	// 	queryKey: readonly [
	// 		TQueryKey[0],
	// 		{
	// 			readonly initialCursor: TQueryKey[1]['cursor'];
	// 			readonly filterBy: NonNullable<TQueryKey[1]['filterBy']>;
	// 		}
	// 	]
	// ) => void;
	getNextPageParam?:
		| GetNextPageParamFunction<{
				data: TData;
				cursor?: TQueryKey[1]['cursor'] | undefined;
		  }>
		| undefined;

	options?:
		| Partial<
				Omit<
					UseInfiniteQueryOptions<
						{ data: TData; cursor?: TQueryKey[1]['cursor'] | undefined },
						{ message: string },
						{ data: TData; cursor?: TQueryKey[1]['cursor'] | undefined },
						{ data: TData; cursor?: TQueryKey[1]['cursor'] | undefined },
						QueryKey
					>,
					'queryKey' | 'queryFn' | 'getNextPageParam'
				>
		  >
		| undefined;
}) => {
	const [onQueryKeyChange, setOnQueryKeyChange] = useState<
		null | (() => void)
	>();
	const queryKey = useMemo(
		() => [queryMainKey, { initialCursor, filterBy }] as const,
		[initialCursor, filterBy, queryMainKey]
	);
	const config = useRef<{
		queryKey: typeof queryKey | null;
	}>({
		queryKey
	});
	const infiniteQuery = useInfiniteQuery<
		{
			data: TData;
			cursor?: TQueryKey[1]['cursor'];
		},
		{ message: string }
	>(
		queryKey,
		async ({ pageParam }) => {
			const cursor: TQueryKey[1]['cursor'] = pageParam || initialCursor;

			const query = { cursor, filterBy } as TQueryKey[1];

			return {
				data: await fetchFn(query),
				cursor: cursor
			};
		},
		{
			...options,
			getNextPageParam
		}
	);

	useEffect(() => {
		const configCurrent = config.current;
		let timeoutId: ReturnType<typeof setTimeout>; //: NodeJS.Timeout;
		if (configCurrent.queryKey !== queryKey) {
			if (onQueryKeyChange)
				timeoutId = setTimeout(() => onQueryKeyChange?.(), 0);
			configCurrent.queryKey = queryKey;
		}

		return () => {
			configCurrent.queryKey = null;
			timeoutId && clearTimeout(timeoutId);
		};
	}, [onQueryKeyChange, queryKey]);

	return {
		infiniteQuery,
		// isNextPageDisabled,
		// isPreviousPageDisabled,
		// currentIndex,
		// setCurrentIndex,
		queryKey,
		setOnQueryKeyChange
	};
};

type ExtractState<S> = S extends {
	getState: () => infer T;
} ? T : never;
type WithReact<S extends StoreApi<unknown>> = S & {
	getServerState?: () => ExtractState<S>;
};

export const useTableStore = <TData extends Record<string, any>, TCB>(
	tableStore: WithReact<StoreApi<TableStore<TData>>>,
  cb: Parameters<typeof useStore<StoreApi<TableStore<TData>>, TCB>>[1]
) => {
	// const _cb = cb || ((store) => store)
	return useStore(tableStore, cb)
};
