import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#fbeee9',
          200: '#f6d5c7',
          300: '#eeb299',
          400: '#e18462',
          500: '#d56037',
          600: '#c64c27',
          700: '#a53c1d',
          800: '#85321b',
          900: '#6d2b1a',
          950: '#3a130a',
        },
      },
    },
  },
}
