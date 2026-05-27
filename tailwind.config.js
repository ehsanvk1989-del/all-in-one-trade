/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        surface: {
          50: '#0a0a0a',
          100: '#111111',
          200: '#1a1a1a',
          300: '#222222',
          400: '#2a2a2a',
          500: '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #b8860b, #ffd700, #b8860b)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(255, 215, 0, 0.15)',
        'gold-lg': '0 0 40px rgba(255, 215, 0, 0.2)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 50px rgba(0, 0, 0, 0.7)',
        'inner-gold': 'inset 0 1px 0 rgba(255, 215, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'ticker': 'ticker 30s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)' },
          'to': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      }
    },
  },
  plugins: [],
}

