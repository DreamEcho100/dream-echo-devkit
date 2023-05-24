import { useMemo } from 'react';
import { useStore } from 'zustand';
import {
	type QueryInput,
	type UseGetTableCurrentPageAndPaginationProps,
} from './types';

export const cx = (...classesArr: (string | undefined)[]) => {
	let classesStr = '';
	let className: string | undefined;
	for (className of classesArr) {
		if (typeof className === 'string') classesStr += className + ' ';
	}

	return classesStr.trimEnd();
};

export const useGetTableCurrentPageAndPagination = <
	TData,
	TQueryInput extends QueryInput,
>(
	props: UseGetTableCurrentPageAndPaginationProps<TData, TQueryInput>,
) => {
	const pageViewMode = useStore(props.store, (state) => state.pageViewMode);
	const offset = useStore(props.store, (state) => state.queryInput.offset || 0);
	const defaultPage = useMemo(() => [], []);
	const currentPage = useMemo(() => {
		if (pageViewMode === 'INFINITE_SCROLL')
			return (props.infiniteQuery?.data?.pages || defaultPage)
				.map((page) => page.items)
				.flat(1);

		return props.infiniteQuery?.data?.pages?.[offset]?.items || defaultPage;
	}, [offset, props.infiniteQuery.data?.pages, pageViewMode, defaultPage]);

	const pagination = useMemo(
		() => ({
			offset,
			limit: props.infiniteQuery?.data?.pages.length || 0,
		}),
		[offset, props.infiniteQuery?.data?.pages.length],
	);

	const res = useMemo(
		() => ({
			currentPage,
			pagination: {
				pageSize: pagination.limit,
				pageIndex: pagination.offset,
			},
		}),
		[currentPage, pagination.limit, pagination.offset],
	);

	return res;
};
