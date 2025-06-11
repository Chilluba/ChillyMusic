import React, { useState } from 'react';
import { StatusBar, StyleSheet, LogBox, View, ScrollView, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { StackNavigationProp } from '@react-navigation/stack';

import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { PlaybackProvider } from './src/context/PlaybackContext';
import { DownloadProvider } from './src/context/DownloadContext'; // Import DownloadProvider

import SearchInput from './src/components/ui/SearchInput';
import RecentSearches from './src/components/feature/RecentSearches';
import TrendingNow from './src/components/feature/TrendingNow';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import HeaderComponent from './src/components/layout/Header';

import { DefaultTheme as AppDefaultThemeConfig, Spacing, Typography } from './src/theme/theme';
import { RootStackParamList } from './src/navigation/types';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator<RootStackParamList>();

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const StatefulHomeScreen: React.FC<{ navigation: HomeScreenNavigationProp }> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useAppTheme();

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

  const styles = StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: theme.colors.backgroundPrimary },
    scrollContentContainer: { paddingBottom: theme.spacing.md, },
    loadingIndicator: { marginTop: theme.spacing.md }
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
      {isLoading && <ActivityIndicator style={styles.loadingIndicator} size='large' color={theme.colors.accentPrimary}/>}
      <RecentSearches />
      <TrendingNow />
    </ScrollView>
  );
};

const AppContent: React.FC = () => {
  const { theme } = useAppTheme();

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
          component={StatefulHomeScreen}
          options={{
            header: (props) => <HeaderComponent {...props} />,
          }}
        />
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={({ route }) => ({
            title: route.params.query ? `Results: ${route.params.query}` : 'Search Results',
          })}
        />
        <Stack.Screen
          name="Library"
          component={LibraryScreen}
          options={{ title: 'My Library' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            title: 'Now Playing',
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <PlaybackProvider>
        <DownloadProvider> {/* Wrap AppContent with DownloadProvider */}
          <AppContent />
        </DownloadProvider>
      </PlaybackProvider>
    </ThemeProvider>
  );
};

export default App;
