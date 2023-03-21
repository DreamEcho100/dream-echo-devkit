/** @type {import("prettier").Config} */
module.exports = {
	tabWidth: 2,
	semi: false,
	trailingComma: 'all',
	printWidth: 80,
	singleQuote: true,
	useTabs: true,
	jsxSingleQuote: true,
	plugins: [
		require('@ianvs/prettier-plugin-sort-imports'),
		require('prettier-plugin-tailwindcss'),
	],
	//
	importOrder: [
		'^(react/(.*)$)|^(react$)',
		'^(next/(.*)$)|^(next$)',
		'<THIRD_PARTY_MODULES>',
		'',
		'^types$',
		'^@local/(.*)$',
		'^@/config/(.*)$',
		'^@/lib/(.*)$',
		'^@/components/(.*)$',
		'^@/styles/(.*)$',
		'^[./]',
	],
	importOrderSeparation: false,
	importOrderSortSpecifiers: true,
	importOrderBuiltinModulesToTop: true,
	importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
	importOrderMergeDuplicateImports: true,
	importOrderCombineTypeAndValueImports: true,
	//
}
