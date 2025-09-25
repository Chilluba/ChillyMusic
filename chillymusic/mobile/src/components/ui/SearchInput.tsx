import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext'; // Import useAppTheme
import Icon from './Icon';

interface SearchInputProps {
  onSearchSubmit: (query: string) => void;
  isLoading?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearchSubmit, isLoading }) => {
  const { theme } = useAppTheme(); // Use theme from context
  const [query, setQuery] = useState('');

  const handlePressSearch = () => {
    if (!query.trim()) return;
    onSearchSubmit(query);
  };

  // Define styles inside or make it a function of theme to ensure it updates
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundTertiary,
      borderRadius: theme.borderRadius.md,
      height: 52
    },
    iconWrapper: {
      paddingLeft: theme.spacing.md
    },
    input: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      fontSize: theme.typography.fontSize.bodyLarge,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.primary
    },
    loader: {
      marginRight: theme.spacing.md
    },
    clearButtonTouchable: {
      paddingHorizontal: theme.spacing.md,
      height: '100%',
      justifyContent: 'center'
    },
    clearButtonText: {
      fontSize: theme.typography.fontSize.h1, // Typically larger for an 'X'
      color: theme.colors.textMuted
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <View style={styles.iconWrapper}>
          <Icon name="MagnifyingGlass" size={20} color={theme.colors.textMuted} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Search for music, artists, or albums"
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handlePressSearch}
          returnKeyType="search"
          selectionColor={theme.colors.accentPrimary}
          editable={!isLoading}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.accentPrimary} style={styles.loader} />
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

export default SearchInput;
