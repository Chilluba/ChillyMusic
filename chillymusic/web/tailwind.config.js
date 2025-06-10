/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

// For simplicity in this script, colors are hardcoded.
// In a real setup, you'd import from theme.constants.ts after setting up module aliases or relative paths.
const colorsDark = {
  backgroundPrimary: '#0D1117',
  backgroundSecondary: '#161B22',
  backgroundTertiary: '#21262D',
  textPrimary: '#F0F6FC',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',
  accentPrimary: '#2DA44E',
  accentSecondary: '#1F6FEB',
  border: '#30363D',
  error: '#F85149',
  warning: '#D29922',
  white: '#FFFFFF',
};

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': colorsDark.backgroundPrimary,
        'bg-secondary': colorsDark.backgroundSecondary,
        'bg-tertiary': colorsDark.backgroundTertiary,
        'text-primary': colorsDark.textPrimary,
        'text-secondary': colorsDark.textSecondary,
        'text-muted': colorsDark.textMuted,
        'accent-primary': colorsDark.accentPrimary,
        'accent-secondary': colorsDark.accentSecondary,
        'border-primary': colorsDark.border,
        'error-primary': colorsDark.error,
        'warning-primary': colorsDark.warning,
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['\"SF Mono\"', ...fontFamily.mono],
      },
      spacing: {
        'xs': '0.25rem', 'sm': '0.5rem', 'md': '1rem', 'lg': '1.5rem',
        'xl': '2rem', '2xl': '3rem', '3xl': '4rem',
      },
      borderRadius: {
        'sm': '0.375rem', 'md': '0.75rem', 'lg': '1rem', 'xl': '1.5rem',
      },
      fontSize: {
        'display': '2rem', 'h1': '1.5rem', 'h2': '1.25rem',
        'body-lg': '1rem', 'body': '0.875rem',
        'caption': '0.75rem', 'small': '0.625rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
