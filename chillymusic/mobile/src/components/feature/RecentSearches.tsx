import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { DefaultTheme, Spacing, Typography, BorderRadius } from '../../theme/theme';
import Icon from '../ui/Icon'; // Corrected path

const RECENT_SEARCHES_DATA = [
  { id: '1', term: 'Afrobeats 2024' },
  { id: '2', term: 'Chill Vibes' },
  { id: '3', term: 'Workout Mix' },
];

const RecentSearches: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <TouchableOpacity onPress={() => console.log('Clear recent searches')}>
          <Icon name="Clock" size={18} color={DefaultTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={RECENT_SEARCHES_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => console.log('Search for:', item.term)}>
            <Icon name="Clock" size={16} color={DefaultTheme.colors.textMuted} />
            <Text style={styles.itemText}>{item.term}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: DefaultTheme.colors.textPrimary,
    fontFamily: Typography.fontFamily.primary,
  },
  listContent: {
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DefaultTheme.colors.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl, // More rounded like chips
    height: 40, // Fixed height for chips
    gap: Spacing.xs,
  },
  itemText: {
    fontSize: Typography.fontSize.body,
    color: DefaultTheme.colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },
});

export default RecentSearches;
