// Credit to <https://stackoverflow.com/a/73883783/13961420>

import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig([
	{
		clean: true,
		dts: true,
		minify: true,
		splitting: true,
		entry: ['src/react/index.js'],
		// Credit to: <https://stackoverflow.com/a/74604287/13961420>
		esbuildOptions(options) {
			options.external = ['react'];
		},
		treeshake: true,
		format: ['esm', 'cjs'],
		sourcemap: true,
		tsconfig: path.resolve(process.cwd(), './tsconfig.build.json'),
		outDir: 'src/react/dist',
	},
]);