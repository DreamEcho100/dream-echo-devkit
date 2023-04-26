export interface Rating {
	[key: string]: unknown;
	rate: number;
	count: number;
}

export interface Product {
	[key: string]: unknown;
	id: number;
	title: string;
	price: number;
	description: string;
	category: string;
	image: string;
	rating: Rating;
}
