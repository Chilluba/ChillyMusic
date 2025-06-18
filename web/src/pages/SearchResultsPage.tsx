import React, { useEffect, useRef } from 'react';
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
  SearchResult, // Assuming SearchResult is Song from songsSlice
} from '../store/searchSlice';


// Placeholder for SearchResultItem component
const SearchResultItem = ({ item }: { item: SearchResult }) => ( // item is a SearchResult (Song)
  <div className="flex items-center p-4 border-b border-border hover:bg-background-tertiary">
    {item.thumbnail ?
      <img src={item.thumbnail} alt={item.title} className="w-16 h-16 bg-background-tertiary rounded-md mr-4 flex-shrink-0 object-cover" />
      : <div className="w-16 h-16 bg-background-tertiary rounded-md mr-4 flex-shrink-0"></div>
    }
    <div className="flex-grow overflow-hidden">
      <h3 className="text-lg font-semibold text-text-primary truncate" title={item.title}>{item.title}</h3>
      <p className="text-sm text-text-secondary truncate" title={item.artist}>{item.artist}</p>
      {/* Display duration or other info if relevant */}
    </div>
  </div>
);


const SearchResultsPage: React.FC = () => {
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
        for(const key in initialFilterState){
            if(filters[key as keyof SearchFiltersState] !== initialFilterState[key as keyof SearchFiltersState]){
                isDefault = false;
                break;
            }
        }
        if(isDefault && !currentSearchQuery){
            isInitialMount.current = false;
            return;
        }
        isInitialMount.current = false;
    }

    if (currentSearchQuery) {
      console.log('(Web) Filters or query changed, dispatching fetchSearchResults:', { query: currentSearchQuery, filters });
      dispatch(fetchSearchResults({ query: currentSearchQuery }));
    }
  }, [filters, currentSearchQuery, dispatch]);

  const handleAnyFilterChangedInBar = () => {
    console.log('(Web) A filter was selected/changed in SearchFilterBar.');
  };

  // Example: To simulate initiating a search, you might have a search input elsewhere
  // that dispatches setSearchQuery, which then would trigger the useEffect if query changes.
  // For now, if currentSearchQuery is null initially, nothing will be fetched.

  let content;
  if (isLoading) {
    content = <p className="text-center text-text-secondary py-10">Loading...</p>;
  } else if (searchError) {
    content = <p className="text-center text-error py-10">Error: {searchError}</p>;
  } else if (searchResults.length === 0 && currentSearchQuery) {
    content = <p className="text-center text-text-secondary py-10">No results found for "{currentSearchQuery}".</p>;
  } else if (searchResults.length === 0 && !currentSearchQuery) {
     content = <p className="text-center text-text-secondary py-10">Enter a search term to see results.</p>;
  } else {
    content = (
      <div className="bg-background-secondary rounded-lg shadow">
        {searchResults.map(item => (
          <SearchResultItem key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <header className="bg-background-secondary shadow-md p-4 sticky top-0 z-50">
        <div className="container mx-auto">
          <input
            type="search"
            defaultValue={currentSearchQuery || ""} // Use currentSearchQuery from store
            // onChange={(e) => dispatch(setSearchQuery(e.target.value))} // Example of how query might be set
            // onKeyDown={(e) => e.key === 'Enter' && currentSearchQuery && dispatch(fetchSearchResults({ query: currentSearchQuery }))}
            className="w-full p-3 bg-background-tertiary text-text-primary rounded-md border border-border focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
            placeholder="Search for music..." // Updated placeholder
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-2">
        <div className="h-10 flex items-center text-sm text-text-secondary mb-2">
            {isLoading ? 'Loading...' : `${searchResults.length} results`}
        </div>
        <SearchFilterBar onAnyFilterChanged={handleAnyFilterChangedInBar} />
      </div>

      <main className="container mx-auto px-4 mt-4">
        {content}
      </main>
    </div>
  );
};

export default SearchResultsPage;
