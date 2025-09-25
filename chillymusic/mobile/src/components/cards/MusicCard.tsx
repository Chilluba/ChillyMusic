import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SearchResult } from '../../types';
import { useAppTheme } from '../../context/ThemeContext'; // Import useAppTheme
import Icon from '../ui/Icon';

interface MusicCardProps {
  item: SearchResult;
  onPlayPause: (item: SearchResult) => void;
  onDownloadMp3?: (item: SearchResult) => void;
  isPlaying?: boolean;
  isLoading?: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ item, onPlayPause, onDownloadMp3, isPlaying = false, isLoading = false }) => {
  const { theme } = useAppTheme(); // Use theme

  const formatDuration = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const displayDuration = item.duration > 0 ? formatDuration(item.duration) : (item.duration === 0 ? '' : 'N/A');

  // Define styles inside or make it a function of theme
  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      height: 100,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'center',
      height: '100%'
    },
    title: {
      fontSize: theme.typography.fontSize.bodyLarge,
      fontWeight: theme.typography.fontWeight.medium as any,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.primary,
      marginBottom: theme.spacing.xs / 2
    },
    artist: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.fontFamily.primary
    },
    actionsContainer: {
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingLeft: theme.spacing.sm,
      height: '100%'
    },
    actionButton: {
      padding: theme.spacing.xs,
      minWidth: 30,
      minHeight: 30,
      justifyContent: 'center',
      alignItems: 'center'
    },
    disabledButton: {
      opacity: 0.5
    }
  });

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.thumbnail || 'https://via.placeholder.com/80' }} style={styles.thumbnail} />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.channel} {displayDuration ? `• ${displayDuration}` : ''}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onPlayPause(item)} disabled={isLoading} >
          {isLoading ? <ActivityIndicator size='small' color={theme.colors.accentPrimary} /> : <Icon name={isPlaying ? 'Pause' : 'Play'} size={22} color={theme.colors.accentPrimary} />}
        </TouchableOpacity>
        {onDownloadMp3 && // Conditionally render download button if handler is provided
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.disabledButton]}
            onPress={() => onDownloadMp3(item)}
            disabled={isLoading}
          >
            <Icon name='Download' size={18} color={theme.colors.accentSecondary} />
          </TouchableOpacity>
        }
      </View>
    </View>
  );
};
export default MusicCard;
