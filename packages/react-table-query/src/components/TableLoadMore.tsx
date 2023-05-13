import { useMemo } from 'react';
import { type StoreApi, useStore } from 'zustand';
import type { InfiniteQuery, TableStore } from '../utils/types';
import { cx } from '../utils/internal';

const TableLoadMore = <TData, TValue>({
	infiniteQuery,
	store,
	classNames = {
		container: '',
		loadMoreButton: '',
	},
}: {
	infiniteQuery: InfiniteQuery<TData>;
	store: StoreApi<TableStore<TValue>>;
	classNames?: {
		container: string;
		loadMoreButton: string;
	};
}) => {
	const pageIndex = useStore(store, (state) => state.pageIndex);

	const storeUtils = useStore(store, (state) => state.utils);

	const { isLastPageEmpty, isInBeforeLastPage } = useMemo(() => {
		const isLastPageEmpty =
			infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.items
				.length === 0;

		const isInFirstPage = pageIndex === 0;
		const isInLastPage = pageIndex + 1 === infiniteQuery?.data?.pages?.length;
		const isInBeforeLastPage =
			typeof infiniteQuery?.data?.pages?.length === 'number' &&
			infiniteQuery.data.pages.length !== 0 &&
			pageIndex + 1 === infiniteQuery.data.pages.length - 1;

		let pagesLength = infiniteQuery?.data?.pages?.length || 0;
		if (isLastPageEmpty && pagesLength !== 0) pagesLength--;
		return {
			isLastPageEmpty,
			isInBeforeLastPage,
			isInLastPage,
			isInFirstPage,
			pagesLength,
		};
	}, [pageIndex, infiniteQuery?.data?.pages]);

	const isLoadMoreButtonDisabled = useMemo(
		() =>
			(!infiniteQuery.hasNextPage &&
				pageIndex + 1 === infiniteQuery.data?.pages.length) ||
			infiniteQuery.isFetching ||
			(isInBeforeLastPage && isLastPageEmpty),
		[
			pageIndex,
			infiniteQuery.data?.pages.length,
			infiniteQuery.hasNextPage,
			infiniteQuery.isFetching,
			isInBeforeLastPage,
			isLastPageEmpty,
		],
	);

	if (!infiniteQuery.hasNextPage) return <></>;

	return (
		<div className={cx(classNames?.container)}>
			<button
				title={
					isLoadMoreButtonDisabled ? 'There is no more next page' : 'Next page'
				}
				disabled={isLoadMoreButtonDisabled}
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				onClick={async () => {
					if (isLoadMoreButtonDisabled) return;

					await infiniteQuery.fetchNextPage().then((res) => {
						if (res.data && Array.isArray(res.data?.pages)) {
							const lastPage = res.data.pages[res.data.pages.length - 1];
							if (
								!lastPage ||
								(isInBeforeLastPage && lastPage.items.length === 0)
							)
								return;
						}

						storeUtils.setPageIndex((pageIndex) => pageIndex + 1);
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
