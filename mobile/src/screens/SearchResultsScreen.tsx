import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import SearchFilterBar from '../components/search/SearchFilterBar';
import { selectSearchFilters, SearchFiltersState, initialState as initialFilterState } from '../store/searchFiltersSlice';
import { RootState, AppDispatch } from '../store';
import {
  fetchSearchResults,
  selectCurrentSearchQuery,
  selectSearchResults,
  selectSearchLoading,
  selectSearchError,
  SearchResult, // Assuming SearchResult is Song from songsSlice for now
} from '../store/searchSlice';

// Placeholder for SearchResultItem component if it were defined
// Using SearchResult (Song) type for item
const SearchResultItem = ({ item }: { item: SearchResult }) => (
  <View style={styles.itemContainer}>
    <View style={styles.thumbnailPlaceholder} /> {/* Replace with Image if thumbnail available */}
    <View style={styles.infoContainer}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.itemArtist} numberOfLines={1}>{item.artist}</Text>
      {/* Add duration or other relevant info if needed */}
    </View>
  </View>
);

const SearchResultsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => selectSearchFilters(state));
  const currentSearchQuery = useSelector((state: RootState) => selectCurrentSearchQuery(state));
  const searchResults = useSelector((state: RootState) => selectSearchResults(state));
  const isLoading = useSelector((state: RootState) => selectSearchLoading(state));
  const searchError = useSelector((state: RootState) => selectSearchError(state));

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      let isDefault = true;
      for (const key in initialFilterState) {
        if (filters[key as keyof SearchFiltersState] !== initialFilterState[key as keyof SearchFiltersState]) {
          isDefault = false;
          break;
        }
      }
      if (isDefault && !currentSearchQuery) { // If no query and default filters, don't do anything
        isInitialMount.current = false;
        return;
      }
      // If there IS a query on mount (e.g. from deep link), or filters are not default, allow search.
      isInitialMount.current = false;
    }

    if (currentSearchQuery) {
      console.log('(Mobile) Filters or query changed, dispatching fetchSearchResults:', { query: currentSearchQuery, filters });
      dispatch(fetchSearchResults({ query: currentSearchQuery }));
    }
    // The dependency array includes currentSearchQuery now.
    // If currentSearchQuery is cleared (e.g. user clears search input), this effect might run.
    // The searchSlice or component logic should handle whether to clear results or keep them.
  }, [filters, currentSearchQuery, dispatch]);


  const handleAnyFilterChangedInBar = () => {
    // The useEffect above will pick up the Redux state change.
    console.log('(Mobile) A filter was selected/changed in SearchFilterBar.');
  };

  // Placeholder for navigation props, e.g. to set header title
  // const navigation = useNavigation();
  // React.useLayoutEffect(() => {
  //   if (currentSearchQuery) {
  //     navigation.setOptions({ title: `Results for "${currentSearchQuery}"` });
  //   } else {
  //     navigation.setOptions({ title: 'Search' });
  //   }
  // }, [navigation, currentSearchQuery]);

  let content;
  if (isLoading) {
    content = <ActivityIndicator size="large" color="#F0F6FC" style={styles.centeredMessage} />;
  } else if (searchError) {
    content = <Text style={styles.centeredMessage}>Error: {searchError}</Text>;
  } else if (searchResults.length === 0 && currentSearchQuery) {
    content = <Text style={styles.centeredMessage}>No results found for "{currentSearchQuery}".</Text>;
  } else if (searchResults.length === 0 && !currentSearchQuery) {
    content = <Text style={styles.centeredMessage}>Search for something to see results.</Text>;
  } else {
    content = (
      <FlatList
        data={searchResults}
        renderItem={({ item }) => <SearchResultItem item={item} />}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    );
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16, // Body Large
    color: '#8B949E', // Text Secondary (Dark)
  }
});

export default SearchResultsScreen;
