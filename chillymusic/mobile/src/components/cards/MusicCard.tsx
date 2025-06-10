import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SearchResult } from '../../types'; // Path to types
import { DefaultTheme, Spacing, Typography, BorderRadius } from '../../theme/theme';
import Icon from '../ui/Icon'; // Path to Icon component

interface MusicCardProps {
  item: SearchResult;
  onPlay?: (item: SearchResult) => void;
  onDownloadMp3?: (item: SearchResult) => void;
  onDownloadMp4?: (item: SearchResult) => void;
}

const MusicCard: React.FC<MusicCardProps> = ({ item, onPlay, onDownloadMp3, onDownloadMp4 }) => {
  // Duration formatting (example: from seconds to MM:SS)
  const formatDuration = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // API returns duration as 0 for now, so we'll show a placeholder or the raw value
  const displayDuration = item.duration > 0 ? formatDuration(item.duration) : (item.duration === 0 ? '' : 'N/A');


  return (
    <View style={styles.card}>
      <Image source={{ uri: item.thumbnail || 'https://via.placeholder.com/80' }} style={styles.thumbnail} />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.channel} {displayDuration ? `• ${displayDuration}` : ''}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onPlay && onPlay(item)}>
          <Icon name='Play' size={22} color={DefaultTheme.colors.accentPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onDownloadMp3 && onDownloadMp3(item)}>
          <Icon name='Download' size={18} color={DefaultTheme.colors.accentSecondary} />
          {/* <Text style={styles.actionText}>MP3</Text> */}
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.actionButton} onPress={() => onDownloadMp4 && onDownloadMp4(item)}>
          <Icon name='Download' size={18} color={DefaultTheme.colors.accentSecondary} />
           <Text style={styles.actionText}>MP4</Text>
        </TouchableOpacity> */}
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
    height: 100, // As per UI_UX Design Document (Result Card)
    borderWidth: 1,
    borderColor: DefaultTheme.colors.border,
  },
  thumbnail: {
    width: 80,
    height: 80, // Square thumbnail inside the card
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
    flexDirection: 'column', // As per UI/UX Doc, actions can be stacked or side-by-side for more space
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
    height: '100%',
  },
  actionButton: {
    padding: Spacing.xs,
    // backgroundColor: DefaultTheme.colors.backgroundTertiary, // Example if buttons need bg
    // borderRadius: BorderRadius.sm,
  },
  actionText: {
    color: DefaultTheme.colors.accentSecondary,
    fontSize: Typography.fontSize.caption,
  }
});

export default MusicCard;
