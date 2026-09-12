/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Same brand identity as the Flutter app's AppTheme (seed teal 700).
        brand: {
          50: '#E7F3F1',
          100: '#C4E3DE',
          200: '#9DD1C9',
          300: '#6FBCB0',
          400: '#3AA593',
          500: '#0E8B78',
          600: '#00796B', // seed
          700: '#00695C',
          800: '#005A4E',
          900: '#0B3B36',
        },
        success: { DEFAULT: '#2E7D32', bg: '#E8F3E8' },
        warning: { DEFAULT: '#B26A00', bg: '#FBF0DE' },
        danger: { DEFAULT: '#C62828', bg: '#FBE9E9' },
        canvas: '#F6F7F9', // scaffoldBackgroundColor (light)
        ink: '#121212', // scaffoldBackgroundColor (dark)
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(11, 59, 54, 0.06), 0 8px 24px -12px rgba(11, 59, 54, 0.18)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite',
      },
    },
  },
  plugins: [],
};
