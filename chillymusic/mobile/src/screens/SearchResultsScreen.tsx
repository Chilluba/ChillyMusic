import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types'; // Will create this
import { SearchResult } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { DefaultTheme, Spacing, Typography } from '../theme/theme';
import Icon from '../components/ui/Icon';

type SearchResultsScreenRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type SearchResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchResults'>;

interface Props {
  route: SearchResultsScreenRouteProp;
  navigation: SearchResultsScreenNavigationProp;
}

const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { results, query } = route.params;

  if (!results) { // Should ideally handle loading state passed as param or from a global store
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size='large' color={DefaultTheme.colors.accentPrimary} />
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No results found for "{query}".</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <Text style={styles.goBackButtonText}>Try another search</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header is part of StackNavigator, but we can add a sub-header here if needed */}
      {/* <Text style={styles.headerText}>Results for "{query}"</Text> */}
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <MusicCard
            item={item}
            onPlay={(track) => console.log('Play (Results):', track.title)}
            onDownloadMp3={(track) => console.log('Download MP3 (Results):', track.title)}
          />
        )}
        keyExtractor={(item) => item.id + item.videoId} // Ensure unique key
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DefaultTheme.colors.backgroundPrimary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  headerText: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: DefaultTheme.colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  listContent: {
    padding: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.bodyLarge,
    color: DefaultTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  goBackButton: {
    backgroundColor: DefaultTheme.colors.accentPrimary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  goBackButtonText: {
    color: DefaultTheme.colors.white,
    fontSize: Typography.fontSize.bodyLarge,
    fontWeight: Typography.fontWeight.medium,
  }
});

export default SearchResultsScreen;
