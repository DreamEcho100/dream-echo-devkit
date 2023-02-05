// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Product } from '@/appData/products';
import products from '@/appData/products/index.json';

import type { NextApiRequest, NextApiResponse } from 'next';

import { z } from 'zod';

const queryValidator = (item: unknown) => 
	z
		.object({
			offset: z.number().min(0).optional().default(0),
			limit: z.literal(5).or(z.literal(10)).or(z.literal(20)).optional().default(5),
			filterBy: z
				.object({
					category: z.string().optional(),
					title: z.string().optional(),
					priceGTE: z.number().optional()
				})
				.optional()
				.default({})
		})
		.parse(item);

export type ProductsAPIInput = ReturnType<typeof queryValidator>;
export type ProductsAPIOutput = { products: Product[] };

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<ProductsAPIOutput | { message: string }>
) {
	if (req.method !== 'GET') return res.status(404).json({
		message: 'Path is not found!'
	});

	let query: ProductsAPIInput;
	try {
		query = queryValidator({
			limit: Number(req.query.limit),
			offset: Number(req.query.offset),
			filterBy:
				typeof req.query.filterBy === 'string'
					? JSON.parse(req.query.filterBy)
					: undefined
		});
	} catch (err) {
		err instanceof Error && console.error('err.message', err.message);
		return res.status(400).json({
				message: err instanceof Error ? err.message : JSON.stringify(err)
			});
	}

	console.log('server query', query)

	const filterBy = query.filterBy;

	const selectedProducts: Product[] = (
		filterBy && typeof filterBy === 'object'
			? products.filter((product) => {
					return (
						(!filterBy.category ||
							product.category
								.toLowerCase()
								.search(filterBy.category.toLowerCase()) !== -1) &&
						(!filterBy.title ||
							product.title
								.toLowerCase()
								.search(filterBy.title.toLowerCase()) !== -1) &&
						(!filterBy.priceGTE || product.price >= filterBy.priceGTE)
					);
			  })
			: products
	).slice(query.offset, query.offset + query.limit);

	return res.status(200).json({ products: selectedProducts });
}
