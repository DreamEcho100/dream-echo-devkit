// Credit to <https://stackoverflow.com/a/73883783/13961420>

import { defineConfig } from 'tsup';

import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const NODE_ENV = process.env!.NODE_ENV;

export default defineConfig([
	{
		clean: true,
		dts: true,
		minify: NODE_ENV === 'production',
		entry: ['./src/index.ts'],
		// // Credit to: <https://stackoverflow.com/a/74604287/13961420>
		// esbuildOptions(options) {
		// 	options.external = [];
		// },
		format: ['esm', 'cjs'],
		sourcemap: true,
		tsconfig: path.resolve(__dirname, './tsconfig.build.json'),
		outDir: 'dist',
	},
]);
