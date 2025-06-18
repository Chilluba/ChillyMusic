import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import FilterDropdown from './FilterDropdown';
import { FilterOption } from './FilterOptionModal';
import {
  setFilterType,
  setFilterUploadDate,
  setFilterDuration,
  setFilterSortBy,
  selectFilterType,
  selectFilterUploadDate,
  selectFilterDuration,
  selectFilterSortBy,
  FilterType,
  FilterUploadDate,
  FilterDuration,
  FilterSortBy,
} from '../../store/searchFiltersSlice';
import { RootState, AppDispatch } from '../../store';

// Define filter options statically
const typeOptions: FilterOption[] = [
  { label: 'All', value: 'all' }, { label: 'Track', value: 'track' },
  { label: 'Album', value: 'album' }, { label: 'Playlist', value: 'playlist' },
  { label: 'Artist', value: 'artist' },
];
const uploadDateOptions: FilterOption[] = [
  { label: 'Any Time', value: 'any' }, { label: 'Last Hour', value: 'hour' },
  { label: 'Today', value: 'today' }, { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' }, { label: 'This Year', value: 'year' },
];
const durationOptions: FilterOption[] = [
  { label: 'Any', value: 'any' }, { label: 'Short (<4 min)', value: 'short' },
  { label: 'Medium (4-20 min)', value: 'medium' }, { label: 'Long (>20 min)', value: 'long' },
];
const sortByOptions: FilterOption[] = [
  { label: 'Relevance', value: 'relevance' }, { label: 'View Count', value: 'view_count' },
  { label: 'Upload Date', value: 'upload_date' }, { label: 'Rating', value: 'rating' },
];

interface SearchFilterBarProps {
  // Optional: Callback for when any filter changes, could trigger search
  onAnyFilterChanged?: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onAnyFilterChanged }) => {
  const dispatch = useDispatch<AppDispatch>();

  const currentType = useSelector((state: RootState) => selectFilterType(state));
  const currentUploadDate = useSelector((state: RootState) => selectFilterUploadDate(state));
  const currentDuration = useSelector((state: RootState) => selectFilterDuration(state));
  const currentSortBy = useSelector((state: RootState) => selectFilterSortBy(state));

  const handleFilterChange = (actionCreator: Function, value: string) => {
    dispatch(actionCreator(value));
    onAnyFilterChanged?.(); // Notify parent that a filter has changed
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
        <FilterDropdown
          filterCategoryLabel="Type"
          options={typeOptions}
          currentValueFromState={currentType}
          onFilterChange={(value) => handleFilterChange(setFilterType, value as FilterType)}
        />
        <FilterDropdown
          filterCategoryLabel="Date"
          options={uploadDateOptions}
          currentValueFromState={currentUploadDate}
          onFilterChange={(value) => handleFilterChange(setFilterUploadDate, value as FilterUploadDate)}
        />
        <FilterDropdown
          filterCategoryLabel="Duration"
          options={durationOptions}
          currentValueFromState={currentDuration}
          onFilterChange={(value) => handleFilterChange(setFilterDuration, value as FilterDuration)}
        />
        <FilterDropdown
          filterCategoryLabel="Sort By"
          options={sortByOptions}
          currentValueFromState={currentSortBy}
          onFilterChange={(value) => handleFilterChange(setFilterSortBy, value as FilterSortBy)}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8, // space-sm
    paddingHorizontal: 8, // space-sm, if ScrollView doesn't have its own horizontal padding
    backgroundColor: '#161B22', // Background Secondary (Dark) - as per "Results meta"
    // borderBottomWidth: 1, // Optional: if it needs to be visually distinct from content below
    // borderBottomColor: '#30363D', // Border (Dark)
    height: 56, // Approximate height: 40px for button + 16px padding
  },
  scrollContentContainer: {
    flexGrow: 1, // Ensures items are aligned correctly if not enough to scroll
    alignItems: 'center', // Vertically center items in the scroll view
  },
});

export default SearchFilterBar;
