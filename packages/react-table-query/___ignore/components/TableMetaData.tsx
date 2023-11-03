import { useMemo, useCallback } from 'react';
import { type StoreApi, useStore } from 'zustand';
import type { InfiniteQuery, TableStore } from '../utils/types';
import { cx } from '../utils/internal';
import IoIosArrowBack from './icons/IoIosArrowBack';
import IoMdRefresh from './icons/IoMdRefresh';
import IoIosArrowForward from './icons/IoIosArrowForward';

const TableMetaData = <
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
		refetchButton: '',
		previousPageButton: '',
		nextPageButton: '',
	},
}: {
	infiniteQuery: InfiniteQuery<QueryItem>;
	store: StoreApi<TableStore<TableItem>>;
	classNames?: {
		container: string;
		refetchButton: string;
		previousPageButton: string;
		nextPageButton: string;
	};
}) => {
	const offset = useStore(store, (state) => state.offset);

	const {
		incrementCurrentPageIndex,
		decrementCurrentPageIndex,
		setRowSelection,
	} = useStore(store, (state) => state);

	const {
		isLastPageEmpty,
		// isInLastPage,
		isInBeforeLastPage,
		// isInFirstPage,
		pagesLength,
	} = useMemo(() => {
		const isLastPageEmpty =
			infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.items
				.length === 0;

		// const isInFirstPage = offset === 0;
		// const isInLastPage =
		// 	offset + 1 === infiniteQuery?.data?.pages?.length;
		const isInBeforeLastPage =
			typeof infiniteQuery?.data?.pages?.length === 'number' &&
			infiniteQuery.data.pages.length !== 0 &&
			offset + 1 === infiniteQuery.data.pages.length - 1;

		let pagesLength = infiniteQuery?.data?.pages?.length || 0;
		if (isLastPageEmpty && pagesLength !== 0) pagesLength--;
		return {
			isLastPageEmpty,
			isInBeforeLastPage,
			// isInLastPage,
			// isInFirstPage,
			pagesLength,
		};
	}, [offset, infiniteQuery?.data?.pages]);

	const isNextPageDisabled = useMemo(
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

	const isPreviousPageDisabled = useMemo(
		() => offset === 0 || infiniteQuery.isFetching,
		[offset, infiniteQuery.isFetching],
	);

	const onPageChange = useCallback(() => {
		setRowSelection({});
	}, [setRowSelection]);

	return (
		<div className={cx(classNames?.container)}>
			<button
				title='refetch'
				disabled={infiniteQuery.isFetching}
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				onClick={async () => {
					if (infiniteQuery.isFetching) return;
					await infiniteQuery.refetch();
				}}
				className={cx(classNames?.refetchButton)}
			>
				<IoMdRefresh style={{ background: 'transparent', fontSize: '120%' }} />
			</button>
			<p title='page/Loaded Pages'>
				{offset + 1}/{pagesLength}
			</p>
			<button
				title={
					isNextPageDisabled
						? 'There is no more previous page'
						: 'Previous page'
				}
				disabled={isPreviousPageDisabled}
				onClick={() => {
					if (isPreviousPageDisabled) return;
					decrementCurrentPageIndex();
					onPageChange();
				}}
				className={cx(classNames?.previousPageButton)}
			>
				<IoIosArrowBack
					style={{ background: 'transparent', fontSize: '120%' }}
				/>
			</button>
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
						onPageChange();
					});
				}}
				className={cx(classNames?.nextPageButton)}
			>
				<IoIosArrowForward
					style={{ background: 'transparent', fontSize: '120%' }}
				/>
			</button>
		</div>
	);
};

export default TableMetaData;
