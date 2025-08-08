/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss,css}",
    "./src/**/*.component.{html,ts,scss}",
    "./src/index.html"
  ],
  corePlugins: {
    preflight: true
  },
  theme: {
    extend: {
      colors: {
        'agri-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        }
      },
      fontFamily: {
        'epilogue': ['Epilogue', 'system-ui', 'sans-serif'],
        'noto-sans': ['Noto Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-scale': 'fadeInScale 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'auth-card': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'premium': '0 32px 64px -12px rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        'premium': '16px',
      },
    },
  },
  plugins: [],
};