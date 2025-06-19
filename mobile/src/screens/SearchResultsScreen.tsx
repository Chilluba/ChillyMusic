import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import SearchFilterBar from '../components/search/SearchFilterBar';
import PlaceholderImage from '../components/ui/PlaceholderImage'; // Import PlaceholderImage
import { selectSearchFilters, SearchFiltersState, initialState as initialFilterState } from '../store/searchFiltersSlice';
import { RootState, AppDispatch } from '../store';
import {
  // fetchSearchResults, // To be removed
  selectCurrentSearchQuery,
  // selectSearchResults, // To be removed
  // selectSearchLoading, // To be removed
  // selectSearchError, // To be removed
  SearchResult,
} from '../store/searchSlice'; // Keep SearchResult and selectCurrentSearchQuery for now
import { useGetSearchResultsQuery } from '../store/apiSlice'; // Import RTK Query hook

// Using SearchResult (Song) type for item
// Memoize the item component
const MemoizedSearchResultItem = React.memo(({ item }: { item: SearchResult }) => (
  <View style={styles.itemContainer}>
    <PlaceholderImage
      sourceURI={item.thumbnail}
      style={styles.thumbnailPlaceholder} // Use existing style for dimensions
      // placeholderStyle={{ backgroundColor: '#30363D' }} // Optional
    />
    <View style={styles.infoContainer}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.itemArtist} numberOfLines={1}>{item.artist}</Text>
      {/* Add duration or other relevant info if needed */}
    </View>
  </View>
));

const SEARCH_RESULT_ITEM_HEIGHT = 112; // Estimated: padding (16*2) + thumbnail (80)

const SearchResultsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Keep dispatch if other actions are needed
  const filters = useSelector((state: RootState) => selectSearchFilters(state));
  const currentSearchQuery = useSelector((state: RootState) => selectCurrentSearchQuery(state));
  const isInitialQueryEmpty = useRef(!currentSearchQuery); // Track if query was empty on mount

  // RTK Query hook
  const {
    data: searchApiData, // Renamed to avoid conflict with searchResults variable if any
    isLoading,
    isFetching,
    error: searchError, // Renamed to avoid conflict
    // refetch // Can be used for pull-to-refresh
  } = useGetSearchResultsQuery(
    { query: currentSearchQuery || '', filters },
    { skip: !currentSearchQuery } // Skip query if no currentSearchQuery
  );

  const searchResults = searchApiData?.results || [];
  const totalResults = searchApiData?.total || 0;

  // This useEffect is no longer needed for dispatching fetch, RTK Query handles it.
  // It could be used for other side effects if needed when query/filters change.
  // useEffect(() => {
  //   console.log('(Mobile) Query or Filters changed:', { currentSearchQuery, filters });
  //   // If using useLazyGetSearchResultsQuery, trigger it here.
  //   // With useGetSearchResultsQuery, it re-fetches automatically.
  // }, [filters, currentSearchQuery]);

  const handleAnyFilterChangedInBar = () => {
    // RTK Query will automatically refetch if 'filters' is a dependency of its parameters.
    console.log('(Mobile) A filter was selected/changed in SearchFilterBar.');
    // If currentSearchQuery was empty and now a filter is changed, it might be a UX decision
    // whether to trigger a search or wait for a query. Current setup skips query if no query string.
    // If we want to search on filter change even with empty query, adjust skipCondition.
    if (isInitialQueryEmpty.current && !currentSearchQuery) {
        // If query was initially empty, and still is, maybe don't auto-search on filter change alone.
        // This depends on desired UX. For now, RTK Query handles based on `skip`.
    }
  };

  let content;
  const actualIsLoading = isLoading || isFetching; // Consider both for loading state

  if (actualIsLoading) {
    content = <ActivityIndicator size="large" color="#F0F6FC" style={styles.centeredMessage} />;
  } else if (searchError) {
    // Type assertion for error if needed, e.g. if (searchError as any).status
    content = <Text style={styles.centeredMessage}>Error: {(searchError as any)?.data?.error || (searchError as any)?.error || 'Failed to load results'}</Text>;
  } else if (currentSearchQuery && searchResults.length === 0) {
    content = <Text style={styles.centeredMessage}>No results found for "{currentSearchQuery}".</Text>;
  } else if (!currentSearchQuery && searchResults.length === 0) {
    content = <Text style={styles.centeredMessage}>Search for something to see results.</Text>;
  } else if (searchResults.length > 0) {
    content = (
      <FlatList
        data={searchResults}
        renderItem={({ item }) => <MemoizedSearchResultItem item={item} />}
        keyExtractor={(item) => item.id} // Ensure item.id is unique and stable
        style={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={4}
        windowSize={11}
        getItemLayout={(data, index) => (
          { length: SEARCH_RESULT_ITEM_HEIGHT, offset: SEARCH_RESULT_ITEM_HEIGHT * index, index }
        )}
        // ListEmptyComponent is not strictly needed here if parent conditions handle empty states,
        // but good for safety if searchResults could be empty despite currentSearchQuery having a value.
        // For now, the outer conditions handle the primary empty/error states.
      />
    );
  } else {
    // Fallback, though above conditions should cover all scenarios
    content = <Text style={styles.centeredMessage}>Enter a search query to begin.</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>
          {currentSearchQuery ? `Results for "${currentSearchQuery}"` : "Search"}
        </Text>
        <View style={styles.resultsMeta}>
            <Text style={styles.resultsMetaText}>
              {isLoading ? 'Loading...' : `${searchResults.length} results`}
              {/* Filter chips could be displayed here from 'filters' state */}
            </Text>
        </View>
      </View>

      <SearchFilterBar onAnyFilterChanged={handleAnyFilterChangedInBar} />
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1117', // Background Primary (Dark)
  },
  headerContainer: {
    paddingHorizontal: 16, // space-md
    paddingTop: 10, // space-sm
    paddingBottom: 8, // space-sm
    backgroundColor: '#0D1117', // Background Primary (Dark)
    // borderBottomWidth: 1,
    // borderBottomColor: '#30363D',
  },
  pageTitle: { // Placeholder for actual search query display
    fontSize: 20, // Heading 2
    fontWeight: 'bold',
    color: '#F0F6FC', // Text Primary (Dark)
    marginBottom: 8, // space-sm
  },
  resultsMeta: {
    height: 40, // As per UI Doc
    justifyContent: 'center',
    // backgroundColor: '#161B22', // Background Secondary (Dark) - Moved to FilterBar for now
    // paddingHorizontal: 16, // If it were separate
    marginBottom: 4, // Small space before filter bar
  },
  resultsMetaText: {
    fontSize: 14, // Body
    color: '#8B949E', // Text Secondary (Dark)
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16, // space-md
    borderBottomWidth: 1,
    borderBottomColor: '#30363D', // Border (Dark)
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#21262D', // Background Tertiary
    borderRadius: 6, // radius-sm
    marginRight: 16, // space-md
  },
  infoContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16, // Body Large
    color: '#F0F6FC', // Text Primary (Dark)
    marginBottom: 4,
  },
  itemArtist: {
    fontSize: 14, // Body
    color: '#8B949E', // Text Secondary (Dark)
  },
  centeredMessage: { // Updated style for centered messages
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center', // For Android vertical centering
    color: '#8B949E', // Text Secondary (Dark)
    fontSize: 16,     // Body Large
    padding: 20,      // Add some padding
  }
});

export default SearchResultsScreen;
