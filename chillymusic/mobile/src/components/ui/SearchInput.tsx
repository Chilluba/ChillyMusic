import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { DefaultTheme, Spacing, Typography, BorderRadius } from '../../theme/theme';
import Icon from './Icon'; // Corrected path

const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Icon name="MagnifyingGlass" size={20} color={DefaultTheme.colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search for music, artists, or albums"
          placeholderTextColor={DefaultTheme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          selectionColor={DefaultTheme.colors.accentPrimary}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearButton}>X</Text>
          </TouchableOpacity>
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
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.bodyLarge,
    color: DefaultTheme.colors.textPrimary,
    fontFamily: Typography.fontFamily.primary,
  },
  clearButton: {
    fontSize: Typography.fontSize.bodyLarge,
    color: DefaultTheme.colors.textMuted,
    paddingLeft: Spacing.sm,
  },
});

export default SearchInput;
