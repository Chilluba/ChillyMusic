import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import { SearchFiltersState, initialState as initialFilters } from './searchFiltersSlice';
import { Song } from './songsSlice'; // Assuming search results are similar to Song objects

// Define a type for the search results
export type SearchResult = Song;

interface SearchState {
  query: string | null;
  results: SearchResult[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: SearchState = {
  query: null,
  results: [],
  loading: 'idle',
  error: null,
};

// Async thunk for fetching search results
export const fetchSearchResults = createAsyncThunk<
  SearchResult[],
  { query: string },
  { state: RootState }
>(
  'search/fetchResults',
  async ({ query }, thunkAPI) => {
    const state = thunkAPI.getState();
    const filters: SearchFiltersState = state.searchFilters;

    let queryString = `q=${encodeURIComponent(query)}`;

    if (filters.type !== initialFilters.type) {
      queryString += `&type=${filters.type}`;
    }
    if (filters.uploadDate !== initialFilters.uploadDate) {
      queryString += `&upload_date=${filters.uploadDate}`;
    }
    if (filters.duration !== initialFilters.duration) {
      queryString += `&duration=${filters.duration}`;
    }
    if (filters.sortBy !== initialFilters.sortBy) {
      queryString += `&sort_by=${filters.sortBy}`;
    }

    // VITE_API_BASE_URL should be used for web, from .env file
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Placeholder
    const response = await fetch(`${API_BASE_URL}/search?${queryString}`);

    console.log(`(Web) Fetching search results from: ${API_BASE_URL}/search?${queryString}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', response.status, errorData);
      return thunkAPI.rejectWithValue(`Failed to fetch results: ${response.status} ${errorData || response.statusText}`);
    }

    const data = await response.json();
    return data.results || data; // Adjust based on actual API response structure
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    clearSearchResults: (state) => {
      state.results = [];
      state.query = null;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state, action) => {
        state.loading = 'pending';
        state.query = action.meta.arg.query;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action: PayloadAction<SearchResult[]>) => {
        state.loading = 'succeeded';
        state.results = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || action.error.message;
      });
  },
});

export const { setSearchQuery, clearSearchResults } = searchSlice.actions;

// Selectors
export const selectCurrentSearchQuery = (state: RootState): string | null => state.search.query;
export const selectSearchResults = (state: RootState): SearchResult[] => state.search.results;
export const selectSearchLoading = (state: RootState): boolean => state.search.loading === 'pending';
export const selectSearchError = (state: RootState): string | null | undefined => state.search.error;

export default searchSlice.reducer;
