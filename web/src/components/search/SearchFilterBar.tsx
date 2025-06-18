import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FilterDropdown, { FilterOption } from './FilterDropdown';
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
} from '../../store/searchFiltersSlice'; // Adjust path if necessary
import { RootState, AppDispatch } from '../../store'; // Adjust path if necessary


// Static filter options (same as mobile)
const typeOptions: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Track', value: 'track' },
  { label: 'Album', value: 'album' },
  { label: 'Playlist', value: 'playlist' },
  { label: 'Artist', value: 'artist' },
];

const uploadDateOptions: FilterOption[] = [
  { label: 'Any Time', value: 'any' },
  { label: 'Last Hour', value: 'hour' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
];

const durationOptions: FilterOption[] = [
  { label: 'Any', value: 'any' },
  { label: 'Short (<4 min)', value: 'short' },
  { label: 'Medium (4-20 min)', value: 'medium' },
  { label: 'Long (>20 min)', value: 'long' },
];

const sortByOptions: FilterOption[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'View Count', value: 'view_count' },
  { label: 'Upload Date', value: 'upload_date' },
  { label: 'Rating', value: 'rating' },
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
    <div className="p-2 bg-background-secondary flex flex-wrap gap-2 items-center"> {/* Changed to flex-wrap and gap */}
      <FilterDropdown
        filterCategoryLabel="Type"
        options={typeOptions}
        currentValueFromState={currentType}
        onFilterChange={(value) => handleFilterChange(setFilterType, value as FilterType)}
        zIndex={40}
      />
      <FilterDropdown
        filterCategoryLabel="Date"
        options={uploadDateOptions}
        currentValueFromState={currentUploadDate}
        onFilterChange={(value) => handleFilterChange(setFilterUploadDate, value as FilterUploadDate)}
        zIndex={30}
      />
      <FilterDropdown
        filterCategoryLabel="Duration"
        options={durationOptions}
        currentValueFromState={currentDuration}
        onFilterChange={(value) => handleFilterChange(setFilterDuration, value as FilterDuration)}
        zIndex={20}
      />
      <FilterDropdown
        filterCategoryLabel="Sort By"
        options={sortByOptions}
        currentValueFromState={currentSortBy}
        onFilterChange={(value) => handleFilterChange(setFilterSortBy, value as FilterSortBy)}
        zIndex={10}
      />
    </div>
  );
};

export default SearchFilterBar;
