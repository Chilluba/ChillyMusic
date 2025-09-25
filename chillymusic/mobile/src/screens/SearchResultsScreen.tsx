import React, { useState, useEffect } from 'react';
// ... (other imports from SearchResultsScreen) ...
import { useAppTheme } from '../context/ThemeContext';

type SearchResultsScreenRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
// ... (other types and props) ...

const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { results, query, searchError } = route.params; // Get searchError from params
  const { theme } = useAppTheme();
  // ... (playback, downloadContext hooks, modal states) ...

  // ... (openDownloadOptions, handleSelectDownloadOption, renderMusicCard) ...

  const styles = StyleSheet.create({ /* ... existing styles using theme ... */
    container: { flex: 1, backgroundColor: theme.colors.backgroundPrimary },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.md },
    emptyText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textSecondary, textAlign: 'center' },
    errorTextLarge: { fontSize: theme.typography.fontSize.h2, color: theme.colors.error, textAlign: 'center', marginBottom: theme.spacing.md },
  });


  if (searchError && (!results || results.length === 0)) { // Prioritize showing search error if results are empty
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="Error" size={48} color={theme.colors.error} /> {/* Assuming an Error icon exists */}
        <Text style={styles.errorTextLarge}>Failed to Load Results</Text>
        <Text style={styles.emptyText}>{searchError}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: theme.spacing.lg, padding: theme.spacing.sm, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.borderRadius.sm}}>
            <Text style={{color: theme.colors.white}}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!results || results.length === 0) { // No error, but no results
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No results found for "{query}".</Text>
      </View>
    );
  }

  // ... (rest of the component: FlatList, MiniPlayer, DownloadOptionsModal) ...
  return ( <View style={styles.container}> {/* ... FlatList etc. ... */} </View> );
};
// Ensure full component structure and styles are maintained by worker.
export default SearchResultsScreen;
