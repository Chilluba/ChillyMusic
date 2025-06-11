import React, { useState, useEffect } from 'react'; // Added useEffect for potential error clearing
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native'; // Added Text, Alert
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { StackNavigationProp } from '@react-navigation/stack';

// ... (other imports: HeaderComponent, SearchInput, RecentSearches, TrendingNow, Screens, Contexts, Types)
import HeaderComponent from './src/components/layout/Header';
import SearchInput from './src/components/ui/SearchInput';
import RecentSearches from './src/components/feature/RecentSearches';
import TrendingNow from './src/components/feature/TrendingNow';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import DownloadsScreen from './src/screens/DownloadsScreen';

import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { PlaybackProvider } from './src/context/PlaybackContext';
import { DownloadProvider } from './src/context/DownloadContext';
import { RootStackParamList } from './src/navigation/types';
import { fetchSearchResults, ApiError } from './src/services/apiService'; // Import ApiError

const Stack = createStackNavigator<RootStackParamList>();
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// StatefulHomeScreen component (remains inside App.tsx or can be moved out)
const StatefulHomeScreen: React.FC<{ navigation: HomeScreenNavigationProp }> = ({ navigation }) => {
  const { theme } = useAppTheme(); // For styling error message
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Clear search error when query changes (e.g., user types something new)
  // This would ideally be tied to SearchInput's onChangeText, but for now, a simple clear on focus/re-render.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchError(null); // Clear error when screen is focused
    });
    return unsubscribe;
  }, [navigation]);


  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoadingSearch(true);
    setSearchError(null); // Clear previous error
    try {
      const response = await fetchSearchResults(query); // apiService now throws ApiError
      navigation.navigate('SearchResults', { query, results: response.results, searchError: null });
    } catch (error: any) {
      const typedError = error as ApiError; // Cast to ApiError
      console.error('Search failed in StatefulHomeScreen:', typedError.message, typedError.status, typedError.details);
      const errorMessage = typedError.message || 'An unknown error occurred during search.';
      setSearchError(errorMessage); // Set error for display on Home screen itself
      // Optionally navigate to results screen with error, or display error directly on Home
      // For this iteration, we display on Home and also pass to SearchResults for it to handle if results are empty
      navigation.navigate('SearchResults', { query, results: [], searchError: errorMessage });
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const styles = StyleSheet.create({ /* ... styles for StatefulHomeScreen ... */
    scrollView: { flex: 1, backgroundColor: theme.colors.backgroundPrimary },
    scrollContentContainer: { paddingBottom: theme.spacing.md },
    errorTextContainer: { padding: theme.spacing.md, backgroundColor: theme.colors.error, margin: theme.spacing.md, borderRadius: theme.borderRadius.sm },
    errorText: { color: theme.colors.white, textAlign: 'center', fontSize: theme.typography.fontSize.body },
  });

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps='handled'
    >
      <SearchInput onSearchSubmit={performSearch} isLoading={isLoadingSearch} />
      {searchError && (
        <View style={styles.errorTextContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
          {/* Optional: Add a dismiss button for the error message */}
        </View>
      )}
      {!searchError && ( // Only show these if no error is displayed
        <>
          <RecentSearches />
          <TrendingNow />
        </>
      )}
    </ScrollView>
  );
};

// AppContent and App components remain largely the same, just ensure StatefulHomeScreen is used correctly.
// ... (AppContent and App component structure as before) ...
const AppContent = () => {
  const { theme } = useAppTheme(); // Use theme from context for NavigationContainer
  return (
    <NavigationContainer theme={{
        dark: theme.name === 'dark',
        colors: {
          primary: theme.colors.accentPrimary,
          background: theme.colors.backgroundPrimary,
          card: theme.colors.backgroundSecondary,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: theme.colors.error, // Example
        },
      }}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={StatefulHomeScreen}
          options={({ navigation }) => ({
            header: () => <HeaderComponent navigation={navigation} />
          })}
        />
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={({ route }) => ({
            title: `Results: ${route.params.query}`,
            headerStyle: { backgroundColor: theme.colors.backgroundSecondary },
            headerTintColor: theme.colors.textPrimary,
            headerTitleStyle: { fontFamily: theme.typography.fontFamily.primary },
          })}
        />
        <Stack.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            title: 'My Library',
            headerStyle: { backgroundColor: theme.colors.backgroundSecondary },
            headerTintColor: theme.colors.textPrimary,
            headerTitleStyle: { fontFamily: theme.typography.fontFamily.primary },
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerStyle: { backgroundColor: theme.colors.backgroundSecondary },
            headerTintColor: theme.colors.textPrimary,
            headerTitleStyle: { fontFamily: theme.typography.fontFamily.primary },
          }}
        />
         <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            headerShown: false, // Player screen is typically full-screen modal like
          }}
        />
        <Stack.Screen
            name="Downloads"
            component={DownloadsScreen}
            options={{
              title: 'Current Downloads',
              headerStyle: { backgroundColor: theme.colors.backgroundSecondary },
              headerTintColor: theme.colors.textPrimary,
              headerTitleStyle: { fontFamily: theme.typography.fontFamily.primary },
            }}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
const App = () => { return <ThemeProvider><PlaybackProvider><DownloadProvider><AppContent/></DownloadProvider></PlaybackProvider></ThemeProvider>; };
export default App;
