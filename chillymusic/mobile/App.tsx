import React, { useState } from 'react';
import { StatusBar, StyleSheet, LogBox, View, ScrollView, ActivityIndicator } from 'react-native'; // Added View, ScrollView, ActivityIndicator
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { StackNavigationProp } from '@react-navigation/stack';

// import HeaderComponent from './src/components/layout/Header'; // Not used in final App structure
import SearchInput from './src/components/ui/SearchInput';
import RecentSearches from './src/components/feature/RecentSearches';
import TrendingNow from './src/components/feature/TrendingNow';
import SearchResultsScreen from './src/screens/SearchResultsScreen';

import { DefaultTheme, Spacing } from './src/theme/theme';
import { SearchResult } from './src/types';
import { RootStackParamList } from './src/navigation/types';

// Ignore a specific log warning from React Navigation if it appears
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator<RootStackParamList>();

// Define navigation prop type for HomeScreen
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// New component to handle search logic and navigation
const StatefulHomeScreen: React.FC<{ navigation: HomeScreenNavigationProp }> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false); // Manage loading state here

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      // Assuming fetchSearchResults is imported or available
      const { fetchSearchResults } = require('./src/services/apiService'); // lazy require for subtask simplicity
      const response = await fetchSearchResults(query);
      console.log(`Navigating with ${response.results.length} results for query: ${query}`);
      navigation.navigate('SearchResults', { query, results: response.results });
    } catch (error) {
      console.error('Search failed:', error);
      // Alert.alert('Search Error', 'Could not fetch results.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps='handled'
    >
      {/* Header is now managed by Stack.Navigator for the Home screen */}
      <SearchInput
        onSearchSubmit={performSearch} // SearchInput calls this with the query
        isLoading={isLoading} // Pass loading state to SearchInput
      />
      {isLoading && <ActivityIndicator style={{marginTop: Spacing.md}} size='large' color={DefaultTheme.colors.accentPrimary}/>}
      <RecentSearches />
      <TrendingNow />
    </ScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer theme={{
      dark: true, // Use React Navigation's dark theme concept
      colors: {
        primary: DefaultTheme.colors.accentPrimary,
        background: DefaultTheme.colors.backgroundPrimary,
        card: DefaultTheme.colors.backgroundSecondary,
        text: DefaultTheme.colors.textPrimary,
        border: DefaultTheme.colors.border,
        notification: DefaultTheme.colors.accentPrimary,
      },
    }}>
      <StatusBar barStyle={'light-content'} backgroundColor={DefaultTheme.colors.backgroundPrimary} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: DefaultTheme.colors.backgroundPrimary,
            borderBottomWidth: 1,
            borderBottomColor: DefaultTheme.colors.border,
          },
          headerTintColor: DefaultTheme.colors.textPrimary,
          headerTitleStyle: {
            // fontWeight: 'bold', // Default is bold for iOS, semi-bold for Android
            fontFamily: DefaultTheme.typography.fontFamily.primary,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          options={{ title: 'ChillyMusic', headerTitleAlign: 'center' }}
        >
          {(props: any) => <StatefulHomeScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={({ route }) => ({
            title: route.params.query ? `Results: ${route.params.query}` : 'Search Results',
            headerBackTitleVisible: false, // Common pattern on iOS
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: DefaultTheme.colors.backgroundPrimary,
  },
  scrollContentContainer: {
    paddingBottom: Spacing.md,
  },
  // screenContainer: { // Not directly used by StatefulHomeScreen as it is a ScrollView itself
  //   flex: 1,
  //   backgroundColor: DefaultTheme.colors.backgroundPrimary,
  // }
});

export default App;
