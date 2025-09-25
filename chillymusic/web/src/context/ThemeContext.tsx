import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getThemePreference as getWebThemePreference, saveThemePreference as saveWebThemePreference, ThemePreference } from '../services/webSettingsService';
// Import color definitions if Tailwind classes aren't sufficient or for JS logic
// import { Colors as AppColors } from '../theme/theme.constants'; // Assuming you have this structure

// For web, the theme object might be simpler if Tailwind handles most of it.
// It could just provide the preference and a way to toggle the root class.
export interface AppTheme { // Web version, might be simpler
  isDark: boolean;
  // Potentially add specific color values if needed beyond Tailwind classes
  // colors: typeof AppColors.dark | typeof AppColors.light;
}

interface ThemeContextType {
  themePreference: ThemePreference;
  setAppThemePreference: (preference: ThemePreference) => void;
  currentTheme: AppTheme; // The actual theme object, simplified for web
}

const defaultWebThemeContextValue: ThemeContextType = {
  themePreference: 'system',
  setAppThemePreference: () => {},
  currentTheme: { isDark: window.matchMedia('(prefers-color-scheme: dark)').matches }
};

export const ThemeContext = createContext<ThemeContextType>(defaultWebThemeContextValue);

export const ThemeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(defaultWebThemeContextValue.currentTheme);

  // Function to apply theme to DOM (e.g., body class)
  const applyThemeToDOM = (pref: ThemePreference) => {
    const root = window.document.documentElement;
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    root.classList.remove('dark', 'light');

    let newIsDark = false;
    if (pref === 'dark' || (pref === 'system' && isSystemDark)) {
      root.classList.add('dark');
      newIsDark = true;
    } else {
      root.classList.add('light');
      newIsDark = false;
    }
    setCurrentTheme({ isDark: newIsDark });
  };

  useEffect(() => {
    const savedPref = getWebThemePreference();
    setThemePreference(savedPref);
    applyThemeToDOM(savedPref);
  }, []);

  const handleSetAppThemePreference = (preference: ThemePreference) => {
    saveWebThemePreference(preference);
    setThemePreference(preference);
    applyThemeToDOM(preference);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themePreference === 'system') {
        applyThemeToDOM('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  return (
    <ThemeContext.Provider value={{ themePreference, setAppThemePreference: handleSetAppThemePreference, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
