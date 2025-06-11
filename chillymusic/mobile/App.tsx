import React, { useState } from 'react'; // Keep useState for StatefulHomeScreen
import { StatusBar, StyleSheet, LogBox, View, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { StackNavigationProp } from '@react-navigation/stack';

import { ThemeProvider, useAppTheme, AppTheme } from './src/context/ThemeContext'; // Import provider and hook

import SearchInput from './src/components/ui/SearchInput';
import RecentSearches from './src/components/feature/RecentSearches';
import TrendingNow from './src/components/feature/TrendingNow';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HeaderComponent from './src/components/layout/Header';

import { DefaultTheme as AppDefaultTheme, Spacing, Typography, Colors } from './src/theme/theme'; // Import Colors for nav theme
// import { SearchResult } from './src/types'; // Not directly used in App.tsx
import { RootStackParamList } from './src/navigation/types';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator<RootStackParamList>();

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// StatefulHomeScreen remains the same as it doesn't directly consume the AppTheme for its own styles yet
// It would be refactored in a subsequent step if its internal styles needed to be dynamic.
const StatefulHomeScreen: React.FC<{ navigation: HomeScreenNavigationProp }> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  // const { theme } = useAppTheme(); // Example if StatefulHomeScreen needed theme

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const { fetchSearchResults } = require('./src/services/apiService');
      const response = await fetchSearchResults(query);
      navigation.navigate('SearchResults', { query, results: response.results });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles for StatefulHomeScreen would also adapt to theme if it had themed elements
  // For now, assuming its internal styles are compatible or use DefaultTheme from theme.ts
  const styles = StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: AppDefaultTheme.colors.backgroundPrimary },
    scrollContentContainer: { paddingBottom: Spacing.md, },
    loadingIndicator: { marginTop: Spacing.md }
  });


  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps='handled'
    >
      <SearchInput
        onSearchSubmit={performSearch}
        isLoading={isLoading}
      />
      {isLoading && <ActivityIndicator style={styles.loadingIndicator} size='large' color={AppDefaultTheme.colors.accentPrimary}/>}
      <RecentSearches />
      <TrendingNow />
    </ScrollView>
  );
};


// New component to access theme context for NavigationContainer and StatusBar
const AppContent: React.FC = () => {
  const { theme } = useAppTheme();

  // Adapt React Navigation theme based on AppTheme
  const navigationTheme = {
    ...(theme.isDark ? NavigationDarkTheme : NavigationDefaultTheme),
    colors: {
      ...(theme.isDark ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors),
      primary: theme.colors.accentPrimary,
      background: theme.colors.backgroundPrimary,
      card: theme.colors.backgroundSecondary,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.backgroundPrimary}
      />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.backgroundPrimary,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontFamily: Typography.fontFamily.primary,
            fontWeight: Typography.fontWeight.bold as any,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={StatefulHomeScreen} // StatefulHomeScreen itself is not yet theme-aware in its styles
          options={{
            header: (props) => <HeaderComponent {...props} />, // HeaderComponent will need to use useAppTheme
          }}
        />
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen} // Will need to use useAppTheme
          options={({ route }) => ({
            title: route.params.query ? `Results: ${route.params.query}` : 'Search Results',
          })}
        />
        <Stack.Screen
          name="Library"
          component={LibraryScreen} // Will need to use useAppTheme
          options={{ title: 'My Library' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen} // Already updated to use useAppTheme
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
