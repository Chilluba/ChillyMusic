import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FilterOptionModal, { FilterOption } from './FilterOptionModal';
// Consider adding an icon library for the down arrow, or use a text symbol.
// For now, a text symbol '▼' will be used.

interface FilterDropdownProps {
  filterCategoryLabel: string; // e.g., "Type", "Sort By"
  options: FilterOption[];
  initialValue?: string; // The value of the initially selected option
  onFilterChange: (selectedValue: string) => void; // Callback with the new selected value
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filterCategoryLabel,
  options,
  // initialValue, // This will now come from Redux state via parent
  currentValueFromState, // New prop to pass selected value from Redux
  onFilterChange, // This will now be a dispatching function from parent
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  // const [selectedValue, setSelectedValue] = useState<string>(
  //   initialValue || options[0]?.value || ''
  // );
  // SelectedValue is now managed by Redux, passed via currentValueFromState

  const selectedOption = options.find(opt => opt.value === currentValueFromState) || options[0];

  const handleSelectOption = (option: FilterOption) => {
    // setSelectedValue(option.value); // Redux will handle this change
    onFilterChange(option.value); // This prop should now dispatch the Redux action
    setModalVisible(false); // Close modal after selection
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>
          {filterCategoryLabel}: <Text style={styles.selectedValueText}>{selectedOption?.label || 'Any'}</Text> ▼
        </Text>
      </TouchableOpacity>

      <FilterOptionModal
        visible={modalVisible}
        title={`Select ${filterCategoryLabel}`}
        options={options}
        selectedValue={selectedValue}
        onSelect={handleSelectOption}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    backgroundColor: '#21262D', // Background Tertiary (Dark)
    paddingVertical: 8, // space-sm
    paddingHorizontal: 12, // space-sm + space-xs
    borderRadius: 6, // radius-sm
    marginRight: 8, // space-sm for spacing between dropdowns
    borderWidth: 1,
    borderColor: '#30363D', // Border (Dark)
    minHeight: 38, // Ensure touch target and consistent height
    justifyContent: 'center',
  },
  dropdownButtonText: {
    fontSize: 14, // Body
    color: '#8B949E', // Text Secondary (Dark) - for the label part
  },
  selectedValueText: {
    color: '#F0F6FC', // Text Primary (Dark) - for the selected value part
    fontWeight: '600',
  },
});

export default FilterDropdown;
