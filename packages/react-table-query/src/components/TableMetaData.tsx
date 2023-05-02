import { useMemo, useCallback } from 'react';
import { type StoreApi, useStore } from 'zustand';
import type { InfiniteQuery, TableStore } from '../utils/types';
import { cx } from '../utils/internal';
import IoIosArrowBack from './icons/IoIosArrowBack';
import IoMdRefresh from './icons/IoMdRefresh';
import IoIosArrowForward from './icons/IoIosArrowForward';

const TableMetaData = <TData extends Record<string, unknown>>({
	infiniteQuery,
	store,
	classNames = {
		container: 'flex flex-wrap gap-2',
		refetchButton:
			'bg-transparent capitalize text-current disabled:cursor-not-allowed disabled:brightness-50 disabled:grayscale',
		previousPageButton:
			'bg-transparent capitalize text-current disabled:cursor-not-allowed disabled:brightness-50 disabled:grayscale',
		nextPageButton:
			'bg-transparent capitalize text-current disabled:cursor-not-allowed disabled:brightness-50 disabled:grayscale',
	},
}: {
	infiniteQuery: InfiniteQuery<TData>;
	store: StoreApi<TableStore<TData>>;
	classNames?: {
		container: string;
		refetchButton: string;
		previousPageButton: string;
		nextPageButton: string;
	};
}) => {
	const currentPageIndex = useStore(store, (state) => state.currentPageIndex);

	const {
		incrementCurrentPageIndex,
		decrementCurrentPageIndex,
		setRowSelection,
	} = useStore(store, (state) => state.utils);

	const {
		isLastPageEmpty,
		isInLastPage,
		isInBeforeLastPage,
		isInFirstPage,
		pagesLength,
	} = useMemo(() => {
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

	if (process.env!.NODE_ENV! === 'development') {
		console.log('isLastPageEmpty', isLastPageEmpty);
		console.log('isInLastPage', isInLastPage);
		console.log('isInBeforeLastPage', isInBeforeLastPage);
		console.log('isInFirstPage', isInFirstPage);
		console.log('pagesLength', pagesLength);
	}

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

	const isPreviousPageDisabled = useMemo(
		() => currentPageIndex === 0 || infiniteQuery.isFetching,
		[currentPageIndex, infiniteQuery.isFetching],
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
				{currentPageIndex + 1}/{pagesLength}
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
