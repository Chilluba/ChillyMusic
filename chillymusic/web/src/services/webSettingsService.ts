export type ThemePreference = 'light' | 'dark' | 'system';
const THEME_PREFERENCE_KEY = 'ChillyMusic:WebThemePreference';

export const saveThemePreference = (theme: ThemePreference): void => {
  try {
    localStorage.setItem(THEME_PREFERENCE_KEY, theme);
    console.log('Web theme preference saved:', theme);
  } catch (e) {
    console.error('Error saving web theme preference to localStorage', e);
  }
};

export const getThemePreference = (): ThemePreference => {
  try {
    const value = localStorage.getItem(THEME_PREFERENCE_KEY);
    return (value as ThemePreference) || 'system'; // Default to 'system'
  } catch (e) {
    console.error('Error reading web theme preference from localStorage', e);
    return 'system'; // Default on error
  }
};
