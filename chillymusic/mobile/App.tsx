import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import Header from './src/components/layout/Header';
import SearchInput from './src/components/ui/SearchInput';
import RecentSearches from './src/components/feature/RecentSearches';
import TrendingNow from './src/components/feature/TrendingNow';
import { DefaultTheme, Spacing } from './src/theme/theme';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.screenContainer}>
      <Header />
      <SearchInput />
      <RecentSearches />
      <TrendingNow />
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={'light-content'} backgroundColor={DefaultTheme.colors.backgroundPrimary} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled' // Good for search inputs in scroll views
      >
        <HomeScreen />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DefaultTheme.colors.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: Spacing.md, // Add some padding at the bottom
  },
  screenContainer: { // This View will be inside the ScrollView
    flex: 1, // Ensure it tries to take up available space
  }
});

export default App;
