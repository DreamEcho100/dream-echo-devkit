import { useMemo } from 'react';
import { type StoreApi, useStore } from 'zustand';
import type { InfiniteQuery, TableStore } from '../utils/types';
import { cx } from '../utils/internal';

const TableLoadMore = <
	QueryItem extends Record<string, unknown>,
	TableItem extends Record<
		Exclude<string, keyof QueryItem> | keyof QueryItem,
		unknown
	>,
>({
	infiniteQuery,
	store,
	classNames = {
		container: '',
		loadMoreButton: '',
	},
}: {
	infiniteQuery: InfiniteQuery<QueryItem>;
	store: StoreApi<TableStore<TableItem>>;
	classNames?: {
		container: string;
		loadMoreButton: string;
	};
}) => {
	const offset = useStore(store, (state) => state.offset);

	const { incrementCurrentPageIndex } = useStore(store, (state) => state);

	const { isLastPageEmpty, isInBeforeLastPage } = useMemo(() => {
		const isLastPageEmpty =
			infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.items
				.length === 0;

		const isInFirstPage = offset === 0;
		const isInLastPage = offset + 1 === infiniteQuery?.data?.pages?.length;
		const isInBeforeLastPage =
			typeof infiniteQuery?.data?.pages?.length === 'number' &&
			infiniteQuery.data.pages.length !== 0 &&
			offset + 1 === infiniteQuery.data.pages.length - 1;

		let pagesLength = infiniteQuery?.data?.pages?.length || 0;
		if (isLastPageEmpty && pagesLength !== 0) pagesLength--;
		return {
			isLastPageEmpty,
			isInBeforeLastPage,
			isInLastPage,
			isInFirstPage,
			pagesLength,
		};
	}, [offset, infiniteQuery?.data?.pages]);

	const isLoadMoreButtonDisabled = useMemo(
		() =>
			(!infiniteQuery.hasNextPage &&
				offset + 1 === infiniteQuery.data?.pages.length) ||
			infiniteQuery.isFetching ||
			(isInBeforeLastPage && isLastPageEmpty),
		[
			offset,
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
