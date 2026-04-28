import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00B4D8',
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00B4D8',
          600: '#0097A7',
          700: '#00838F',
          800: '#006064',
          900: '#004D40',
        },
        accent: {
          DEFAULT: '#00E676',
          50: '#E8F5E9',
          400: '#66BB6A',
          500: '#00E676',
          600: '#00C853',
        },
        danger: {
          DEFAULT: '#FF5252',
          50: '#FFEBEE',
          500: '#FF5252',
          700: '#D32F2F',
        },
        warning: {
          DEFAULT: '#FFB74D',
          500: '#FFB74D',
        },
        dark: {
          950: '#070B14',
          900: '#0A1628',
          800: '#0F1D32',
          700: '#15253D',
          600: '#1C2E49',
          500: '#243754',
          400: '#2E4260',
          300: '#3D5475',
          200: '#5A7394',
          100: '#8899B0',
        },
        surface: {
          DEFAULT: '#111B2E',
          light: '#162033',
          lighter: '#1A2740',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 180, 216, 0.3)',
        'glow-sm': '0 0 10px rgba(0, 180, 216, 0.2)',
        card: '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        ripple: 'ripple 1.5s ease-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
