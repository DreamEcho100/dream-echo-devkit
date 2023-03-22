/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'../../packages/ui/components/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			screens: {
				'xl-3-sm': '250px',
				// // => @media (min-width: 250px) { ... }
				'xl-2-sm': '400px',
				// // => @media (min-width: 400px) { ... }
				'xl-sm': '512px',
				// => @media (min-width: 512px) { ... }

				sm: '640px',
				// => @media (min-width: 640px) { ... }
				md: '768px',
				// => @media (min-width: 768px) { ... }
				lg: '1024px',
				// => @media (min-width: 1024px) { ... }
				// ...defaultTheme,

				xl: '1280px',
				// => @media (min-width: 1280px) { ... }
				'2xl': '1536px',
				// => @media (min-width: 1536px) { ... }
			},
		},
	},
	plugins: [],
};
