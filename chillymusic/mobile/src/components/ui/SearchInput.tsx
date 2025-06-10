import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native'; // Removed Alert
import { DefaultTheme, Spacing, Typography, BorderRadius } from '../../theme/theme';
import Icon from './Icon';
// Removed API service imports, SearchInput will now be dumber

interface SearchInputProps {
  onSearchSubmit: (query: string) => void; // Changed to mandatory
  isLoading?: boolean; // isLoading is now a prop controlled by parent
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearchSubmit, isLoading }) => {
  const [query, setQuery] = useState('');

  const handlePressSearch = () => {
    if (!query.trim()) return;
    onSearchSubmit(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <View style={styles.iconWrapper}>
          <Icon name="MagnifyingGlass" size={20} color={DefaultTheme.colors.textMuted} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Search for music, artists, or albums"
          placeholderTextColor={DefaultTheme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handlePressSearch} // Trigger search on keyboard submit
          returnKeyType="search"
          selectionColor={DefaultTheme.colors.accentPrimary}
          editable={!isLoading} // Disable input when loading
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={DefaultTheme.colors.accentPrimary} style={styles.loader} />
        ) : (
          query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButtonTouchable} disabled={isLoading}>
              <Text style={styles.clearButtonText}>&times;</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DefaultTheme.colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
    height: 52,
  },
  iconWrapper: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
    fontSize: Typography.fontSize.bodyLarge,
    color: DefaultTheme.colors.textPrimary,
    fontFamily: Typography.fontFamily.primary,
  },
  loader: {
    marginRight: Spacing.md,
  },
  clearButtonTouchable: {
    paddingHorizontal: Spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: Typography.fontSize.h1,
    color: DefaultTheme.colors.textMuted,
  },
});

export default SearchInput;
