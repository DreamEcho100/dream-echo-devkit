// Credit to <https://stackoverflow.com/a/73883783/13961420>

import { defineConfig } from 'tsup';

import path from 'path';

// // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// const NODE_ENV = process.env!.NODE_ENV;

export default defineConfig([
	{
		clean: true,
		dts: true,
		minify: true,
		splitting: true,
		treeshake: true,
		entry: ['./src/index.ts'],
		format: ['esm', 'cjs'],
		sourcemap: true,
		tsconfig: path.resolve(__dirname, './tsconfig.build.json'),
		outDir: 'dist',
	},
]);
