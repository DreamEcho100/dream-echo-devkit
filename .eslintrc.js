/** @type {import("eslint").Linter.Config} */
const config = {
	root: true,
	extends: ['eslint-config'], // uses the config in `packages/config/eslint`
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		tsconfigRootDir: __dirname,
		project: [
			'./tsconfig.json',
			'./apps/*/tsconfig.json',
			'./packages/*/tsconfig.json',
		],
	},
	settings: {
		next: {
			rootDir: ['apps/web'],
		},
	},
};

module.exports = config;

// module.exports = {
// 	root: true,
// 	// This tells ESLint to load the config from the package `eslint-config-custom`
// 	extends: ['custom'],
// 	settings: {
// 		next: {
// 			rootDir: ['apps/*/'],
// 		},
// 	},
// };
