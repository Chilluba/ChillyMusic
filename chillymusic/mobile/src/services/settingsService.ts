import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';
const THEME_PREFERENCE_KEY = '@ChillyMusic:ThemePreference';

export const saveThemePreference = async (theme: ThemePreference): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, theme);
    console.log('Theme preference saved:', theme);
  } catch (e) {
    console.error('Error saving theme preference to AsyncStorage', e);
  }
};

export const getThemePreference = async (): Promise<ThemePreference> => {
  try {
    const value = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    return (value as ThemePreference) || 'system'; // Default to 'system'
  } catch (e) {
    console.error('Error reading theme preference from AsyncStorage', e);
    return 'system'; // Default on error
  }
};
