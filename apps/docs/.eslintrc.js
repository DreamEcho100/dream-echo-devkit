module.exports = {
	root: true,
	extends: ['custom'],
	// ...require('config/eslint-next.js'),
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
	},
};
