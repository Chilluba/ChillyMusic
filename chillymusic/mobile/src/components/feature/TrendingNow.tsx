import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { DefaultTheme, Spacing, Typography, BorderRadius } from '../../theme/theme';
import Icon from '../ui/Icon'; // Corrected path

const TRENDING_DATA = [
  { id: '1', title: 'Song Title 1', artist: 'Artist Name 1', duration: '3:45', thumbnail: 'https://via.placeholder.com/80' },
  { id: '2', title: 'Song Title 2', artist: 'Artist Name 2', duration: '4:12', thumbnail: 'https://via.placeholder.com/80' },
  { id: '3', title: 'Song Title 3', artist: 'Artist Name 3', duration: '2:50', thumbnail: 'https://via.placeholder.com/80' },
];

const TrendingNow: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending Now</Text>
        <TouchableOpacity onPress={() => console.log('View all trending')}>
          <Icon name="Fire" size={18} color={DefaultTheme.colors.accentPrimary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={TRENDING_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.infoContainer}>
              <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.artistName} numberOfLines={1}>{item.artist} • {item.duration}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: DefaultTheme.colors.accentPrimary }]} onPress={() => console.log('Play:', item.title)}>
                  <Icon name="Play" size={16} color={DefaultTheme.colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: DefaultTheme.colors.accentSecondary }]} onPress={() => console.log('Download MP3:', item.title)}>
                  <Text style={styles.actionText}>MP3</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={[styles.actionButton, { backgroundColor: DefaultTheme.colors.accentSecondary }]} onPress={() => console.log('Download MP4:', item.title)}>
                  <Text style={styles.actionText}>MP4</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    // Horizontal padding is handled by the list content to allow cards to go edge-to-edge if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md, // Add padding for the header text
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: DefaultTheme.colors.textPrimary,
    fontFamily: Typography.fontFamily.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.md, // Padding for the first and last card
    gap: Spacing.md,
  },
  card: {
    width: 280,
    height: 120,
    backgroundColor: DefaultTheme.colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: DefaultTheme.colors.border,
    flexDirection: 'row',
    padding: Spacing.sm,
    overflow: 'hidden', // Ensure content respects border radius
  },
  thumbnail: {
    width: 80,
    height: '100%', // Take full height of card padding
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between', // Distribute space between title/artist and actions
  },
  songTitle: {
    fontSize: Typography.fontSize.bodyLarge,
    fontWeight: Typography.fontWeight.medium,
    color: DefaultTheme.colors.textPrimary,
    fontFamily: Typography.fontFamily.primary,
  },
  artistName: {
    fontSize: Typography.fontSize.body,
    color: DefaultTheme.colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 'auto', // Push actions to the bottom
  },
  actionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 30, // Ensure touch target
  },
  actionText: {
    color: DefaultTheme.colors.white,
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
  }
});

export default TrendingNow;
