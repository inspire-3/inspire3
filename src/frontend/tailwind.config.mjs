/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          'DEFAULT': '1rem',
          'sm': '2rem',
          'lg': '4rem',
          'xl': '6rem',
          '2xl': '8rem',
        },
      },
      fontFamily: {
        body: ['\'DM Sans\'', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: ['acid'], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: 'acid', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  },
}
