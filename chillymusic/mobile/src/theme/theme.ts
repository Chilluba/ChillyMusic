export const Colors = {
  dark: {
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
  },
  light: {
    // Add light theme colors later
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#F6F8FA',
    backgroundTertiary: '#EAEEF2',
    textPrimary: '#24292F',
    textSecondary: '#656D76',
    textMuted: '#8C959F',
    accentPrimary: '#2DA44E',
    accentSecondary: '#0969DA',
    border: '#D0D7DE',
    error: '#CF222E',
    warning: '#BF8700',
  }
};

export const Typography = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif', // Adjusted for React Native
    monospace: '\'SF Mono\', \'Monaco\', \'Inconsolata\', \'Roboto Mono\', monospace', // Adjusted
  },
  fontSize: {
    display: 32,
    h1: 24,
    h2: 20,
    bodyLarge: 16,
    body: 14,
    caption: 12,
    small: 10,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
};

// Initial theme setup (dark theme by default)
export const DefaultTheme = {
  colors: Colors.dark,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
};
