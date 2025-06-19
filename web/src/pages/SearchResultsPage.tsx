import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
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


// Modified SearchResultItem to accept style prop for react-window
const SearchResultItem = ({ index, style, data }: { index: number; style: React.CSSProperties; data: SearchResult[] }) => {
  const item = data[index];
  return (
    <div style={style} className="border-b border-border">
      <div className="flex items-center p-4 hover:bg-background-tertiary h-full"> {/* Ensure h-full for inner content if style has fixed height */}
        <PlaceholderImage
          src={item.thumbnail}
          alt={item.title}
          className="w-16 h-16 rounded-md mr-4 flex-shrink-0 object-cover" // Tailwind for size
          // placeholderClassName="bg-background-tertiary" // Default is already this
        />
        <div className="flex-grow overflow-hidden">
          <h3 className="text-lg font-semibold text-text-primary truncate" title={item.title}>{item.title}</h3>
          <p className="text-sm text-text-secondary truncate" title={item.artist}>{item.artist}</p>
          {/* Display duration or other info if relevant */}
        </div>
      </div>
    </div>
  );
};

const SEARCH_RESULT_ITEM_HEIGHT = 96; // p-4 (16px*2=32px) + h-16 (64px) for thumbnail area

const SearchResultsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Keep dispatch if other actions (like setSearchQuery) are needed
  const filters = useSelector((state: RootState) => selectSearchFilters(state));
  const currentSearchQuery = useSelector((state: RootState) => selectCurrentSearchQuery(state));
  // const isInitialMount = useRef(true); // May not be needed with RTK Query's skip logic

  const {
    data: searchApiData,
    isLoading,
    isFetching,
    error: rtkQueryError, // Renamed to avoid conflict with any component-level error state
    // refetch, // For pull-to-refresh or manual refresh
  } = useGetSearchResultsQuery(
    { query: currentSearchQuery || '', filters },
    { skip: !currentSearchQuery } // Skip query if no currentSearchQuery (e.g., on initial load without a query)
  );

  const searchResults = searchApiData?.results || [];
  const totalResults = searchApiData?.total || 0; // If backend provides total

  // useEffect for logging or other side effects based on query/filter changes is now optional,
  // as RTK Query handles data fetching automatically.
  // useEffect(() => {
  //   if (currentSearchQuery) {
  //     console.log('(Web) Query or Filters changed, RTK Query will refetch:', { query: currentSearchQuery, filters });
  //   }
  // }, [filters, currentSearchQuery]);

  const handleAnyFilterChangedInBar = () => {
    // This function is called when a filter changes in SearchFilterBar.
    // RTK Query's useGetSearchResultsQuery will automatically re-fetch because 'filters' is part of its queryArg.
    console.log('(Web) A filter was selected/changed in SearchFilterBar. RTK Query will handle refetch.');
  };

  let content;
  const actualIsLoading = isLoading || isFetching;

  if (actualIsLoading) {
    content = <p className="text-center text-text-secondary py-10">Loading...</p>;
  } else if (rtkQueryError) {
    content = <p className="text-center text-error py-10">Error: {(rtkQueryError as any)?.data?.error || (rtkQueryError as any)?.error || 'Failed to load results'}</p>;
  } else if (currentSearchQuery && searchResults.length === 0) {
    content = <p className="text-center text-text-secondary py-10">No results found for "{currentSearchQuery}".</p>;
  } else if (!currentSearchQuery && searchResults.length === 0) {
     content = <p className="text-center text-text-secondary py-10">Enter a search term to see results.</p>;
  } else if (searchResults.length > 0) {
    content = (
      <div className="bg-background-secondary rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 250px)' /* Placeholder: Adjust as needed */ }}>
        <List
          height={600} // Placeholder: This should be dynamic based on the container style={{height: ...}}
          itemCount={searchResults.length}
          itemSize={SEARCH_RESULT_ITEM_HEIGHT}
          width="100%"
          itemData={searchResults}
        >
          {SearchResultItem}
        </List>
      </div>
    );
  } else {
    // Fallback if none of the above conditions are met (e.g. no query, no results, no error, no loading)
    content = <p className="text-center text-text-secondary py-10">Please enter a search query.</p>;
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary flex flex-col"> {/* Ensure flex-col for main layout */}
      <header className="bg-background-secondary shadow-md p-4 sticky top-0 z-50">
        <div className="container mx-auto">
          <input
            type="search"
            defaultValue={currentSearchQuery || ""}
            // onChange={(e) => dispatch(setSearchQuery(e.target.value))} // Example
            // onKeyDown={(e) => { /* ... dispatch fetchSearchResults ... */ }}
            className="w-full p-3 bg-background-tertiary text-text-primary rounded-md border border-border focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
            placeholder="Search for music..."
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-2">
        <div className="h-10 flex items-center text-sm text-text-secondary mb-2">
            {isLoading ? 'Loading...' : `${searchResults.length} results`}
        </div>
        <SearchFilterBar onAnyFilterChanged={handleAnyFilterChangedInBar} />
      </div>

      {/* Ensure this main area can grow and the List has a bounded height */}
      <main className="container mx-auto px-4 mt-4 flex-grow overflow-auto">
        {content}
      </main>
    </div>
  );
};

export default SearchResultsPage;
