module.exports = {
	// extends: ['next', 'turbo', 'prettier'],
	// rules: {
	// 	'@next/next/no-html-link-for-pages': 'off',
	// },
	// parserOptions: {
	// 	babelOptions: {
	// 		presets: [require.resolve('next/babel')],
	// 	},
	// },
	extends: [
		'next',
		'turbo',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'prettier',
	],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
		'@typescript-eslint/restrict-template-expressions': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
			},
		],
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{ prefer: 'type-imports', fixStyle: 'inline-type-imports' },
		],
		'@typescript-eslint/no-unnecessary-type-assertion': 1,
	},
	ignorePatterns: ['**/*.config.js', '**/*.config.cjs', 'packages/config/**'],
	reportUnusedDisableDirectives: true,
};
