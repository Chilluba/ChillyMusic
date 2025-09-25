import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Appearance }  from 'react-native'; // Removed ColorSchemeName as it's not directly used
import { getThemePreference, saveThemePreference, ThemePreference } from '../services/settingsService';
import { Colors, DefaultTheme as AppDefaultTheme, Typography, Spacing, BorderRadius } from '../theme/theme';

// Define the shape of our theme
export interface AppTheme {
  colors: typeof Colors.dark; // Or Colors.light
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  isDark: boolean;
}

// Define the context shape
interface ThemeContextType {
  theme: AppTheme;
  themePreference: ThemePreference;
  setAppThemePreference: (preference: ThemePreference) => void;
}

const initialSystemColorScheme = Appearance.getColorScheme() || 'light';
const initialSystemThemeColors = initialSystemColorScheme === 'dark' ? Colors.dark : Colors.light;

// Default context value
const defaultThemeContextValue: ThemeContextType = {
  theme: {
    ...AppDefaultTheme,
    colors: initialSystemThemeColors,
    isDark: initialSystemColorScheme === 'dark',
  },
  themePreference: 'system',
  setAppThemePreference: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultThemeContextValue);

export const ThemeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [currentAppTheme, setCurrentAppTheme] = useState<AppTheme>(defaultThemeContextValue.theme);

  useEffect(() => {
    const loadPreference = async () => {
      const savedPref = await getThemePreference();
      setThemePreference(savedPref);
    };
    loadPreference();
  }, []);

  useEffect(() => {
    const systemThemeValue = Appearance.getColorScheme() || 'light';
    let newColors = Colors.dark;
    let newIsDark = true;

    if (themePreference === 'light') {
      newColors = Colors.light;
      newIsDark = false;
    } else if (themePreference === 'dark') {
      newColors = Colors.dark;
      newIsDark = true;
    } else { // 'system'
      newColors = systemThemeValue === 'dark' ? Colors.dark : Colors.light;
      newIsDark = systemThemeValue === 'dark';
    }

    setCurrentAppTheme({
        ...AppDefaultTheme,
        colors: newColors,
        isDark: newIsDark,
    });

  }, [themePreference]); // Only re-evaluate when preference changes

  // Listener for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themePreference === 'system') { // Only update if preference is 'system'
        const systemThemeValue = colorScheme || 'light';
        setCurrentAppTheme(prevAppTheme => ({ // Use previous app theme for other properties
            ...prevAppTheme,
            colors: systemThemeValue === 'dark' ? Colors.dark : Colors.light,
            isDark: systemThemeValue === 'dark',
        }));
      }
    });
    return () => subscription.remove();
  }, [themePreference]); // Re-subscribe if themePreference changes (e.g., from/to 'system')


  const handleSetAppThemePreference = async (preference: ThemePreference) => {
    await saveThemePreference(preference);
    setThemePreference(preference);
  };

  return (
    <ThemeContext.Provider value={{ theme: currentAppTheme, themePreference, setAppThemePreference: handleSetAppThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
