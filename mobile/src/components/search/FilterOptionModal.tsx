import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterOptionModalProps {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (option: FilterOption) => void;
  onClose: () => void;
}

const FilterOptionModal: React.FC<FilterOptionModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const renderItem = ({ item }: { item: FilterOption }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        item.value === selectedValue && styles.selectedOptionButton,
      ]}
      onPress={() => {
        onSelect(item);
        // onClose(); // Typically close after selection
      }}
    >
      <Text
        style={[
          styles.optionText,
          item.value === selectedValue && styles.selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
      {item.value === selectedValue && <Text style={styles.checkMark}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalView} onStartShouldSetResponder={() => true}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
              style={styles.list}
            />
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Modal appears at the bottom
  },
  safeArea: {
    backgroundColor: '#161B22', // Background Secondary (Dark)
    borderTopLeftRadius: 16, // radius-lg
    borderTopRightRadius: 16, // radius-lg
  },
  modalView: {
    maxHeight: '70%', // Limit height
    borderTopLeftRadius: 16, // radius-lg
    borderTopRightRadius: 16, // radius-lg
    paddingBottom: 10, // Padding for content before safe area ends
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, // space-md
    paddingVertical: 12, // space-sm + space-xs
    borderBottomWidth: 1,
    borderBottomColor: '#30363D', // Border (Dark)
  },
  title: {
    fontSize: 18, // Based on Heading 2 / Body Large
    fontWeight: '600',
    color: '#F0F6FC', // Text Primary (Dark)
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16, // Body Large
    color: '#2DA44E', // Accent Primary
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 8, // space-sm
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16, // space-md
    paddingHorizontal: 16, // space-md
    borderBottomWidth: 1,
    borderBottomColor: '#21262D', // Background Tertiary for subtle separation
  },
  selectedOptionButton: {
    // backgroundColor: '#21262D', // Indicate selection, or rely on text/checkmark
  },
  optionText: {
    fontSize: 16, // Body Large
    color: '#F0F6FC', // Text Primary (Dark)
  },
  selectedOptionText: {
    color: '#2DA44E', // Accent Primary
    fontWeight: '600',
  },
  checkMark: {
    fontSize: 16,
    color: '#2DA44E', // Accent Primary
  }
});

export default FilterOptionModal;
