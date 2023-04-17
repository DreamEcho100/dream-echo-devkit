// Credit to <https://stackoverflow.com/a/73883783/13961420>

import { defineConfig } from 'tsup';

import path from 'path';

export default defineConfig([
	{
		clean: true,
		dts: true,
		// minify: true,
		entry: ['./src/index.ts'],
		// Credit to: <https://stackoverflow.com/a/74604287/13961420>
		esbuildOptions(options) {
			options.external = ['use-sync-external-store', 'zod', 'zustand'];
		},
		format: ['esm'],
		sourcemap: true,
		tsconfig: path.resolve(__dirname, './tsconfig.build.json'),
		outDir: 'dist',
	},
]);
