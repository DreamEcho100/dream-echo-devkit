import type { TableControlsV1Props } from '../utils/types';

import { IoIosArrowBack, IoIosArrowForward, IoMdRefresh } from 'react-icons/io';
import { useCallback, useMemo } from 'react';
import { useTableStore } from '../utils/hooks';


const TableControlsV1 = <TData extends Record<string, any>>({
	infiniteQuery,
	store
}: TableControlsV1Props<TData>) => {
	const { currentPageIndex, incrementCurrentPageIndex, decrementCurrentPageIndex, setRowSelection } = useTableStore(
		store,
		(state) => state
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
