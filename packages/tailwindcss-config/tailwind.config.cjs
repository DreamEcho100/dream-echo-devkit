/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    // apps content
    'src/**/*.{js,ts,jsx,tsx}',
    // packages content
    '../../packages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
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
  // plugins: [
  //   // https://github.com/jorenvanhee/tailwindcss-debug-screens
  //   // class="{{ devMode ? 'debug-screens' : '' }}"
  //   require('tailwindcss-debug-screens'),
  //   // https://github.com/praveenjuge/tailwindcss-brand-colors
  //   require('tailwindcss-brand-colors'),
  //   // https://github.com/tailwindlabs/tailwindcss-line-clamp
  //   require('@tailwindcss/line-clamp'),
  //   // https://tailwindcss.com/docs/typography-plugin
  //   // <article class="prose lg:prose-xl"></article>
  //   require('@tailwindcss/typography'),
  //   // https://github.com/mertasan/tailwindcss-variables
  //   // require('@mertasan/tailwindcss-variables'),
  // ],
}

//
// tailwindcss-custom-forms
// https://github.com/tailwindlabs/tailwindcss-custom-forms
// https://tailwindcss-custom-forms.netlify.app/
//
// tailwindcss-accessibility
// https://github.com/jack-pallot/tailwindcss-accessibility
//
// tailwindcss-background-extended
// https://github.com/hacknug/tailwindcss-background-extended
//
// tailwindcss-blend-mode
// https://github.com/hacknug/tailwindcss-blend-mode
//
// tailwindcss-border-gradients
// https://github.com/cossssmin/tailwindcss-border-gradients
//
// tailwindcss-gradients
// https://github.com/benface/tailwindcss-gradients
//
//
// tailwindcss-border-styles
// https://github.com/log1x/tailwindcss-border-styles
//

// Animation
// https://tailwindcss.com/docs/animation
//
