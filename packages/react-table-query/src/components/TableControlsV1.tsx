import { IoIosArrowBack, IoIosArrowForward, IoMdRefresh } from 'react-icons/io';
import { useCallback, useMemo } from 'react';

import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { StoreApi } from 'zustand/vanilla';
import { TableStore } from '../utils/types';

const TableControlsV1 = <TData extends Record<string, any>>({
	infiniteQuery,
	store
}: {
	infiniteQuery: UseInfiniteQueryResult<
		{
			data: TData[];
		} & Record<string, unknown>,
		{
			message: string;
		} & Record<string, unknown>
	>;
	store: StoreApi<TableStore<TData>>;
}) => {
	const currentPageIndex = useStore(
		store,
		(state: TableStore<TData>) => state.currentPageIndex
	);

	const incrementCurrentPageIndex = useStore(
		store,
		(state: TableStore<TData>) => state.incrementCurrentPageIndex
	);
	const decrementCurrentPageIndex = useStore(
		store,
		(state: TableStore<TData>) => state.decrementCurrentPageIndex
	);
	const setRowSelection = useStore(
		store,
		(state: TableStore<TData>) => state.setRowSelection
	);

	const {
		isLastPageEmpty,
		isInLastPage,
		isInBeforeLastPage,
		isInFirstPage,
		pagesLength
	} = useMemo(() => {
		const isLastPageEmpty =
			infiniteQuery?.data?.pages?.[infiniteQuery.data.pages.length - 1]?.data
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
			pagesLength
		};
	}, [currentPageIndex, infiniteQuery?.data?.pages]);

	console.log('isLastPageEmpty', isLastPageEmpty);
	console.log('isInLastPage', isInLastPage);
	console.log('isInBeforeLastPage', isInBeforeLastPage);
	console.log('isInFirstPage', isInFirstPage);
	console.log('pagesLength', pagesLength);

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
			isLastPageEmpty
		]
	);
	console.log('isNextPageDisabled', isNextPageDisabled);

	const isPreviousPageDisabled = useMemo(
		() => currentPageIndex === 0 || infiniteQuery.isFetching,
		[currentPageIndex, infiniteQuery.isFetching]
	);

	const onPageChange = useCallback(() => {
		setRowSelection({});
	}, [setRowSelection]);

	return (
		<div className='flex flex-wrap gap-2'>
			<button
				title='refetch'
				disabled={infiniteQuery.isFetching}
				onClick={() => {
					if (infiniteQuery.isFetching) return;
					infiniteQuery.refetch();
				}}
				className='capitalize bg-transparent text-current disabled:grayscale disabled:cursor-not-allowed disabled:brightness-50'
			>
				<IoMdRefresh className='bg-transparent' />
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
				className='capitalize bg-transparent text-current disabled:grayscale disabled:cursor-not-allowed disabled:brightness-50'
			>
				<IoIosArrowBack className='bg-transparent' />
			</button>
			<button
				title={isNextPageDisabled ? 'There is no more next page' : 'Next page'}
				disabled={isNextPageDisabled}
				onClick={() => {
					if (isNextPageDisabled) return;

					infiniteQuery.fetchNextPage().then((res) => {
						if (res.data && Array.isArray(res.data?.pages)) {
							console.log('res.data?.pages', res.data?.pages);
							const lastPage = res.data.pages[res.data.pages.length - 1];
							if (isInBeforeLastPage && lastPage.data.length === 0) return;
						}

						incrementCurrentPageIndex();
						onPageChange();
					});
				}}
				className='capitalize bg-transparent text-current disabled:grayscale disabled:cursor-not-allowed disabled:brightness-50'
			>
				<IoIosArrowForward className='bg-transparent' />
			</button>
		</div>
	);
};

export default TableControlsV1;
