import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B6CA8',
          50: '#E8F4FC',
          100: '#C5E2F5',
          200: '#8EC5EB',
          300: '#57A8E1',
          400: '#2B8BCB',
          500: '#1B6CA8',
          600: '#165A8C',
          700: '#114870',
          800: '#0C3654',
          900: '#072438',
        },
        secondary: {
          DEFAULT: '#F5A623',
          50: '#FEF6E8',
          100: '#FDE9C5',
          200: '#FAD38B',
          300: '#F8BD51',
          400: '#F5A623',
          500: '#D88E14',
          600: '#B17310',
          700: '#8A590C',
          800: '#633F08',
          900: '#3C2605',
        },
        accent: {
          DEFAULT: '#27AE60',
          50: '#E9F7EF',
          500: '#27AE60',
          700: '#1E8449',
        },
        danger: {
          DEFAULT: '#E74C3C',
          50: '#FDECEB',
          500: '#E74C3C',
          700: '#C0392B',
        },
        dark: {
          bg: '#0F1624',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      backgroundColor: {
        app: '#F8F9FA',
      },
    },
  },
  plugins: [],
} satisfies Config
