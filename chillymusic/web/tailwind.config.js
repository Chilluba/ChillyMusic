/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

// Dark theme colors (from original setup)
const colorsDark = {
  backgroundPrimary: '#0D1117', backgroundSecondary: '#161B22', backgroundTertiary: '#21262D',
  textPrimary: '#F0F6FC', textSecondary: '#8B949E', textMuted: '#6E7681',
  accentPrimary: '#2DA44E', accentSecondary: '#1F6FEB', border: '#30363D',
  error: '#F85149', warning: '#D29922', white: '#FFFFFF', black: '#000000',
};

// Light theme colors (from UI_UX Design Document or a light theme definition)
const colorsLight = {
  backgroundPrimary: '#FFFFFF', backgroundSecondary: '#F6F8FA', backgroundTertiary: '#EAEEF2',
  textPrimary: '#24292F', textSecondary: '#57606a', /* Adjusted from #656D76 for better contrast if needed */ textMuted: '#8C959F',
  accentPrimary: '#2DA44E', accentSecondary: '#0969DA', border: '#d0d7de', /* Adjusted from #D0D7DE */
  error: '#CF222E', warning: '#BF8700', white: '#FFFFFF', black: '#000000',
};

module.exports = {
  content: [ './src/**/*.{js,jsx,ts,tsx}', './public/index.html' ],
  darkMode: 'class', // This is key
  theme: {
    extend: {
      colors: {
        // Light theme (default)
        'bg-primary': colorsLight.backgroundPrimary,
        'bg-secondary': colorsLight.backgroundSecondary,
        'bg-tertiary': colorsLight.backgroundTertiary,
        'text-primary': colorsLight.textPrimary,
        'text-secondary': colorsLight.textSecondary,
        'text-muted': colorsLight.textMuted,
        'accent-primary': colorsLight.accentPrimary,
        'accent-secondary': colorsLight.accentSecondary,
        'border-primary': colorsLight.border,
        'error-primary': colorsLight.error,
        'warning-primary': colorsLight.warning,
        'white': colorsLight.white,
        'black': colorsLight.black,

        // Dark theme colors explicitly defined for dark: prefix usage
        // These names allow components to do e.g. className="bg-primary dark:bg-dark-bg-primary"
        // Or, more simply, className="bg-bg-primary" and rely on ThemeContext to set <html> class 'dark'
        // and then define overrides in this config:
        // 'bg-primary': { DEFAULT: colorsLight.backgroundPrimary, dark: colorsDark.backgroundPrimary }
        // For this project, we use the explicit dark- prefixed versions for clarity in component classes.
        // UPDATE: Simpler approach with Tailwind v3+ is to define light and use 'dark:' prefix to override.
        // So, we define the 'dark-...' versions here mostly for reference or if specific dark-only utilities are needed.
        // The main way will be: bg-bg-primary dark:bg-dark-bg-primary
        // For this to work, the 'dark:' variants must map to the specific dark colors.
        // Tailwind automatically enables dark variants for color utilities when darkMode: 'class' is set.
        // We just need to ensure our components use them.
        // The definitions below are for if we wanted to use, e.g., "text-dark-text-primary" directly.
        // However, the preferred method is "text-text-primary dark:text-dark-text-primary"
        // So, the direct 'dark-' versions here might be redundant if components are updated properly.
        // For safety and clarity, let's keep them for now.
        'dark-bg-primary': colorsDark.backgroundPrimary,
        'dark-bg-secondary': colorsDark.backgroundSecondary,
        'dark-bg-tertiary': colorsDark.backgroundTertiary,
        'dark-text-primary': colorsDark.textPrimary,
        'dark-text-secondary': colorsDark.textSecondary,
        'dark-text-muted': colorsDark.textMuted,
        'dark-accent-primary': colorsDark.accentPrimary,
        'dark-accent-secondary': colorsDark.accentSecondary,
        'dark-border-primary': colorsDark.border,
        'dark-error-primary': colorsDark.error,
        'dark-warning-primary': colorsDark.warning,
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['"SF Mono"', ...fontFamily.mono] // Ensure SF Mono is quoted if it contains spaces
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
  plugins: [ require('@tailwindcss/forms') ],
};
