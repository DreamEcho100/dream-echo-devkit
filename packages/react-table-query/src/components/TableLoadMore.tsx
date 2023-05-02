import { useMemo } from 'react';
import { type StoreApi, useStore } from 'zustand';
import type { InfiniteQuery, TableStore } from '../utils/types';
import { cx } from '../utils/internal';

const TableLoadMore = <TData extends Record<string, unknown>>({
	infiniteQuery,
	store,
	classNames = {
		container: 'flex items-center justify-center p-4',
		loadMoreButton:
			'bg-transparent capitalize text-current disabled:cursor-not-allowed disabled:brightness-50 disabled:grayscale',
	},
}: {
	infiniteQuery: InfiniteQuery<TData>;
	store: StoreApi<TableStore<TData>>;
	classNames?: {
		container: string;
		loadMoreButton: string;
	};
}) => {
	const currentPageIndex = useStore(store, (state) => state.currentPageIndex);

	const { incrementCurrentPageIndex } = useStore(store, (state) => state.utils);

	const { isLastPageEmpty, isInBeforeLastPage } = useMemo(() => {
		const isLastPageEmpty =
			infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.items
				.length === 0;

		const isInFirstPage = currentPageIndex === 0;
		const isInLastPage =
			currentPageIndex + 1 === infiniteQuery?.data?.pages?.length;
		const isInBeforeLastPage =
			typeof infiniteQuery?.data?.pages?.length === 'number' &&
			infiniteQuery.data.pages.length !== 0 &&
			currentPageIndex + 1 === infiniteQuery.data.pages.length - 1;

		let pagesLength = infiniteQuery?.data?.pages?.length || 0;
		if (isLastPageEmpty && pagesLength !== 0) pagesLength--;
		return {
			isLastPageEmpty,
			isInBeforeLastPage,
			isInLastPage,
			isInFirstPage,
			pagesLength,
		};
	}, [currentPageIndex, infiniteQuery?.data?.pages]);

	const isNextPageDisabled = useMemo(
		() =>
			(!infiniteQuery.hasNextPage &&
				currentPageIndex + 1 === infiniteQuery.data?.pages.length) ||
			infiniteQuery.isFetching ||
			(isInBeforeLastPage && isLastPageEmpty),
		[
			currentPageIndex,
			infiniteQuery.data?.pages.length,
			infiniteQuery.hasNextPage,
			infiniteQuery.isFetching,
			isInBeforeLastPage,
			isLastPageEmpty,
		],
	);

	return (
		<div className={cx(classNames?.container)}>
			<button
				title={isNextPageDisabled ? 'There is no more next page' : 'Next page'}
				disabled={isNextPageDisabled}
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				onClick={async () => {
					if (isNextPageDisabled) return;

					await infiniteQuery.fetchNextPage().then((res) => {
						if (res.data && Array.isArray(res.data?.pages)) {
							const lastPage = res.data.pages[res.data.pages.length - 1];
							if (
								!lastPage ||
								(isInBeforeLastPage && lastPage.items.length === 0)
							)
								return;
						}

						incrementCurrentPageIndex();
					});
				}}
				className={cx(classNames?.loadMoreButton)}
				// eslint-disable-next-line react/no-children-prop
				children='load more'
			/>
		</div>
	);
};

export default TableLoadMore;
