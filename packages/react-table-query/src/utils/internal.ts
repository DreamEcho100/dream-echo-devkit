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
	TQueryInput extends QueryInput = QueryInput,
>(
	props: UseGetTableCurrentPageAndPaginationProps<TData, TQueryInput>,
) => {
	const pageViewMode = useStore(props.store, (state) => state.pageViewMode);
	const pageIndex = useStore(
		props.store,
		(state) => state.queryInput.pageIndex || 0,
	);
	const defaultPage = useMemo(() => [], []);
	const currentPage = useMemo(() => {
		if (pageViewMode === 'INFINITE_SCROLL')
			return (props.infiniteQuery?.data?.pages || defaultPage)
				.map((page) => page.items)
				.flat(1);

		return props.infiniteQuery?.data?.pages?.[pageIndex]?.items || defaultPage;
	}, [pageIndex, props.infiniteQuery.data?.pages, pageViewMode, defaultPage]);

	const pagination = useMemo(
		() => ({
			pageIndex,
			pageSize: props.infiniteQuery?.data?.pages.length || 0,
		}),
		[pageIndex, props.infiniteQuery?.data?.pages.length],
	);

	console.log('currentPage', currentPage);

	const res = useMemo(
		() => ({
			currentPage,
			pagination,
		}),
		[currentPage, pagination],
	);

	return res;
};
