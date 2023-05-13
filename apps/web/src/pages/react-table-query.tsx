import type { Product } from '~/appData/products';
import type { ColumnDef } from '@tanstack/react-table';
import type { ProductsAPIInput, ProductsAPIOutput } from './api/products';

import { useCustomInfiniteQuery } from '~/utils/hooks';
import { createColumnHelper } from '@tanstack/react-table';
import Head from 'next/head';
import { useMemo, useRef } from 'react';
import {
	QueryTable,
	TableLoadMore,
	handleCreateTableStore,
	useCreateTableStore,
} from '@de100/react-table-query';
import { useInfiniteQuery } from '@tanstack/react-query';

const initialCursor: {
	offset: ProductsAPIInput['offset'];
	limit: ProductsAPIInput['limit'];
} = {
	limit: 1,
	offset: 0,
};

type Columns = {
	id: Product['id'];
	title: Product['title'];
	description: Product['description'];
	category: Product['category'];
	price: Product['price'];
};

const columnHelper = createColumnHelper<Columns>();

const border = 'border-[0.0625rem] border-gray-300 dark:border-gray-900';

const tableClassNames = {
	table: 'w-full text-sm text-left text-gray-500 dark:text-gray-400',
	thead: {
		_: 'text-xs text-gray-800 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
		tr: ``,
		th: {
			_: `relative group px-6 py-3 ${border}`,
			container: 'flex h-full w-full flex-col',
			resizeController:
				'absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none bg-black/50 opacity-0 hover:opacity-0 group-hover:bg-indigo-400 group-hover:opacity-100',
			checkboxContainer: {
				_: 'flex items-center justify-center p-4',
				checkBox:
					'color h-4 w-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800',
			},
		},
	},
	tbody: {
		_: '',
		loadingTr: {
			_: 'animate-pulse text-center border-[0.0625rem] border-gray-300 bg-gray-50 dark:bg-gray-500 dark:border-gray-500',
			td: 'p-16',
		},
		tr: `bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 ${border}`,
		td: {
			_: `min-w-fit px-6 py-4 ${border}`,
			checkboxContainer: {
				_: 'flex items-center justify-center p-1',
				checkBox:
					'color h-4 w-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800',
			},
		},
	},
	tfoot: {
		_: 'text-xs text-gray-800 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
		tr: ``,
		th: `relative group px-6 py-3 ${border}`,
	},
};

// const initialFilterByFormValues = {
// 	category: { dataType: 'text', filterType: 'CONTAINS', value: '' },
// 	title: { dataType: 'text', filterType: 'CONTAINS', value: '' },
// 	// price: {
// 	// 	dataType: 'number',
// 	// 	filterType: 'RANGE',
// 	// 	value: { min: 0 },
// 	// 	constraints: { min: 0 }
// 	// }
// } satisfies TableStore<Columns>['filterByFormValues'];

const filterByFormValues = {};

const QData: Parameters<
	typeof useCustomInfiniteQuery<
		ProductsAPIOutput['products'],
		[
			'products',
			{
				cursor: typeof initialCursor;
				filterBy?: typeof filterByFormValues;
			},
		]
	>
>[0] = {
	initialCursor,
	queryMainKey: 'products',
	fetchFn: async (query): Promise<ProductsAPIOutput['products']> => {
		let filterBy: ProductsAPIInput['filterBy'] = {};

		// if (query.filterBy) {
		// 	let key: keyof typeof query.filterBy;
		// 	for (key in query.filterBy) {
		// 		switch (key) {
		// 			case 'title':
		// 			case 'category': {
		// 				const element = query.filterBy[key];
		// 				if (element.value.trim()) filterBy[key] = element.value;
		// 			}
		// 		}
		// 	}
		// }

		return await fetch(
			`/api/products/?limit=${query.cursor.limit}&offset=${
				query.cursor.offset
			}${
				Object.keys(filterBy).length === 0
					? ''
					: `&filterBy=${JSON.stringify(filterBy)}`
			}`,
		)
			.then((response) => {
				if (response.status === 404) throw new Error('Not Found');
				if (response.status === 400) throw new Error('Bad Request');

				return response.json();
			})
			.then((result: ProductsAPIOutput) => result.products);
	},
	filterBy: filterByFormValues as any,
};

const Home = () => {
	const tableStore = useCreateTableStore<Columns>({
		classNames: tableClassNames,
		pageViewMode: 'INFINITE_SCROLL',
		canMultiRowSelect: false,
		pageSize: initialCursor.limit,
		// columnVisibility: { select: false },
	});
	const infiniteQuery = useInfiniteQuery<
		{
			items: Product[];
			cursor: typeof initialCursor;
			filterBy?: typeof filterByFormValues;
		},
		[
			'products',
			{
				cursor: typeof initialCursor;
				filterBy?: typeof filterByFormValues;
			},
		]
	>(
		[QData.queryMainKey],
		async ({ pageParam }) => {
			const cursor: typeof initialCursor = pageParam || initialCursor;

			const query = { cursor, filterBy: filterByFormValues } as {
				cursor: typeof initialCursor;
				filterBy?: typeof filterByFormValues;
			};

			return {
				items: await QData.fetchFn(query),
				cursor: query.cursor,
				filterBy: query.filterBy,
			};
		},
		{
			// ...QData.options,
			getNextPageParam: (lastPage, allPages) => {
				if (lastPage?.cursor) {
					if (lastPage.items.length < lastPage.cursor.limit) return undefined;

					return {
						...lastPage.cursor,
						offset: lastPage.cursor.offset + lastPage.cursor.limit,
					};
				}

				return initialCursor;
			},
		},
	);

	const columns = useMemo(
		() =>
			[
				columnHelper.accessor('id', {
					cell: (info) => info.getValue(),
					header: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
					footer: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
					enableColumnFilter: false,
				}),
				columnHelper.accessor('title', {
					cell: (info) => info.getValue(),
					header: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
					footer: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
				}),
				columnHelper.accessor('description', {
					cell: (info) => (
						<div className='aspect-video w-64 max-w-fit'>{info.getValue()}</div>
					),
					header: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
					footer: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
				}),
				columnHelper.accessor('category', {
					cell: (info) => info.getValue(),
					header: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
					footer: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
				}),
				columnHelper.accessor('price', {
					cell: (info) => info.getValue(),
					header: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
					footer: (info) => (
						<span className='capitalize'>{info.column.id}</span>
					),
				}),
			] as ColumnDef<Columns>[],
		[],
	);

	const config = useRef({
		rerenderCounter: 0,
	});

	config.current.rerenderCounter++;

	return (
		<>
			<Head>
				<title>Create Next App</title>
				<meta name='description' content='Generated by create next app' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<p>{config.current.rerenderCounter}</p>
			<button
				onClick={() =>
					console.log(
						'tableStore.getState().table?.getSelectedRowModel()',
						tableStore
							.getState()
							.table?.getSelectedRowModel()
							.flatRows.map((row) => row.original),
					)
				}
			>
				?
			</button>
			<main
				className={`max-w-full bg-white p-8 text-black dark:bg-black dark:text-white`}
			>
				{/* <div className='max-w-full overflow-auto'>
					<TableMetaData infiniteQuery={infiniteQuery} store={tableStore} />
					<QueryTable
						columns={columns}
						infiniteQuery={infiniteQuery}
						store={tableStore}
						canMultiRowSelect
					/>
					<TableMetaData infiniteQuery={infiniteQuery} store={tableStore} />
				</div> */}
				<div className='max-w-full overflow-auto'>
					<QueryTable
						columns={columns}
						// @ts-ignore
						infiniteQuery={infiniteQuery}
						store={tableStore}
					/>
					<TableLoadMore
						// @ts-ignore
						infiniteQuery={infiniteQuery}
						store={tableStore}
					/>
				</div>
			</main>
		</>
	);
};

export default Home;
