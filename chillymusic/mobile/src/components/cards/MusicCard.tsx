import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SearchResult } from '../../types';
import { DefaultTheme, Spacing, Typography, BorderRadius } from '../../theme/theme';
import Icon from '../ui/Icon';

interface MusicCardProps {
  item: SearchResult;
  onPlayPause: (item: SearchResult) => void; // Changed from onPlay
  onDownloadMp3?: (item: SearchResult) => void;
  // onDownloadMp4?: (item: SearchResult) => void; // Keep commented for now
  isPlaying?: boolean; // Is this specific card's track currently playing?
  isLoading?: boolean; // Is this specific card's track currently loading media info?
}

const MusicCard: React.FC<MusicCardProps> = ({
  item,
  onPlayPause,
  onDownloadMp3,
  isPlaying = false,
  isLoading = false,
}) => {
  const formatDuration = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const displayDuration = item.duration > 0 ? formatDuration(item.duration) : (item.duration === 0 ? '' : 'N/A');

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.thumbnail || 'https://via.placeholder.com/80' }} style={styles.thumbnail} />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.channel} {displayDuration ? `• ${displayDuration}` : ''}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onPlayPause(item)}
          disabled={isLoading} // Disable button while this specific item is loading its media info
        >
          {isLoading ? (
            <ActivityIndicator size='small' color={DefaultTheme.colors.accentPrimary} />
          ) : (
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={22} color={DefaultTheme.colors.accentPrimary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, isLoading && styles.disabledButton]}
          onPress={() => onDownloadMp3 && onDownloadMp3(item)}
          disabled={isLoading}
        >
          <Icon name='Download' size={18} color={DefaultTheme.colors.accentSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DefaultTheme.colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    height: 100,
    borderWidth: 1,
    borderColor: DefaultTheme.colors.border,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  title: {
    fontSize: Typography.fontSize.bodyLarge,
    fontWeight: Typography.fontWeight.medium,
    color: DefaultTheme.colors.textPrimary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.xs / 2,
  },
  artist: {
    fontSize: Typography.fontSize.body,
    color: DefaultTheme.colors.textSecondary,
    fontFamily: Typography.fontFamily.primary,
  },
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
    height: '100%',
  },
  actionButton: {
    padding: Spacing.xs,
    minWidth: 30, // Ensure touchable area
    minHeight: 30, // Ensure touchable area
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  }
});

export default MusicCard;
