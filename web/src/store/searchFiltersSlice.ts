import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index'; // For selector typing

// Define types for filter values
export type FilterType = 'all' | 'track' | 'album' | 'playlist' | 'artist';
export type FilterUploadDate = 'any' | 'hour' | 'today' | 'week' | 'month' | 'year';
export type FilterDuration = 'any' | 'short' | 'medium' | 'long';
export type FilterSortBy = 'relevance' | 'view_count' | 'upload_date' | 'rating';

// Define the state structure
export interface SearchFiltersState {
  type: FilterType;
  uploadDate: FilterUploadDate;
  duration: FilterDuration;
  sortBy: FilterSortBy;
}

// Define the initial state
const initialState: SearchFiltersState = {
  type: 'all',
  uploadDate: 'any',
  duration: 'any',
  sortBy: 'relevance',
};

const searchFiltersSlice = createSlice({
  name: 'searchFilters',
  initialState,
  reducers: {
    setFilterType: (state, action: PayloadAction<FilterType>) => {
      state.type = action.payload;
    },
    setFilterUploadDate: (state, action: PayloadAction<FilterUploadDate>) => {
      state.uploadDate = action.payload;
    },
    setFilterDuration: (state, action: PayloadAction<FilterDuration>) => {
      state.duration = action.payload;
    },
    setFilterSortBy: (state, action: PayloadAction<FilterSortBy>) => {
      state.sortBy = action.payload;
    },
    setAllFilters: (state, action: PayloadAction<Partial<SearchFiltersState>>) => {
      return { ...state, ...action.payload };
    },
    resetFilters: (state) => {
      state.type = initialState.type;
      state.uploadDate = initialState.uploadDate;
      state.duration = initialState.duration;
      state.sortBy = initialState.sortBy;
    },
  },
});

export const {
  setFilterType,
  setFilterUploadDate,
  setFilterDuration,
  setFilterSortBy,
  setAllFilters,
  resetFilters,
} = searchFiltersSlice.actions;

// Selectors
export const selectSearchFilters = (state: RootState): SearchFiltersState => state.searchFilters;
export const selectFilterType = (state: RootState): FilterType => state.searchFilters.type;
export const selectFilterUploadDate = (state: RootState): FilterUploadDate => state.searchFilters.uploadDate;
export const selectFilterDuration = (state: RootState): FilterDuration => state.searchFilters.duration;
export const selectFilterSortBy = (state: RootState): FilterSortBy => state.searchFilters.sortBy;

export default searchFiltersSlice.reducer;
