import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { usePlayback } from '../context/PlaybackContext';
import Icon from '../components/ui/Icon';
import Slider from '@react-native-community/slider'; // Import Slider

const PlayerScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const {
    currentTrack,
    isPlaying,
    progress,
    isLoading,
    error,
    togglePlayPause,
    seekTo
  } = usePlayback();

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) { return '0:00'; }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundPrimary },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.backgroundPrimary },
    emptyText: { fontSize: theme.typography.fontSize.h2, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.primary },
    errorText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.error, textAlign: 'center', padding: theme.spacing.md, fontFamily: theme.typography.fontFamily.primary },
    contentContainer: { flexGrow: 1, padding: theme.spacing.lg, justifyContent: 'space-around' },
    albumArtContainer: { alignItems: 'center', marginBottom: theme.spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10, },
    albumArt: { width: 300, height: 300, borderRadius: theme.borderRadius.lg, },
    trackInfoContainer: { alignItems: 'center', marginBottom: theme.spacing.lg, },
    title: { fontSize: theme.typography.fontSize.h1, fontWeight: theme.typography.fontWeight.bold as any, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: theme.spacing.xs, fontFamily: theme.typography.fontFamily.primary },
    artist: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textSecondary, textAlign: 'center', fontFamily: theme.typography.fontFamily.primary },
    sliderContainer: { marginBottom: theme.spacing.xl, paddingHorizontal: theme.spacing.sm },
    sliderComponent: { width: '100%', height: 40 },
    timeLabelsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs, paddingHorizontal: theme.spacing.xs },
    timeLabel: { fontSize: theme.typography.fontSize.caption, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.primary },
    controlsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: theme.spacing.xl, },
    controlButton: { padding: theme.spacing.sm, },
    playPauseButton: {
      backgroundColor: theme.colors.accentPrimary,
      borderRadius: 50,
      width: 70,
      height: 70,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading && !currentTrack && !error) { // Show loading only if no track and no error yet
    return <View style={styles.centered}><ActivityIndicator size='large' color={theme.colors.accentPrimary} /><Text style={[styles.emptyText, {marginTop: theme.spacing.md}]}>Loading track...</Text></View>;
  }
  // If there's an error, display it, prioritized over "Nothing selected" if a track load failed.
  if (error && !isLoading) {
     return <View style={styles.centered}><Text style={styles.errorText}>Error: {error}</Text></View>;
  }
  if (!currentTrack) {
    return <View style={styles.centered}><Text style={styles.emptyText}>Nothing selected to play.</Text></View>;
  }

  const albumArtUrl = currentTrack.thumbnail || 'https://via.placeholder.com/300';
  const displayTitle = currentTrack.title;
  const displayArtist = 'channel' in currentTrack ? currentTrack.channel : ((currentTrack as any).artist || 'Unknown Artist');
  const trackDuration = progress.seekableDuration;
  const currentTime = progress.currentTime;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.albumArtContainer}><Image source={{ uri: albumArtUrl }} style={styles.albumArt} /></View>
      <View style={styles.trackInfoContainer}>
        <Text style={styles.title} numberOfLines={2}>{displayTitle}</Text>
        <Text style={styles.artist} numberOfLines={1}>{displayArtist}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.sliderComponent}
          minimumValue={0}
          maximumValue={trackDuration > 0 ? trackDuration : 1}
          value={currentTime}
          onSlidingComplete={(value) => seekTo(value)}
          minimumTrackTintColor={theme.colors.accentPrimary}
          maximumTrackTintColor={theme.colors.textMuted}
          thumbTintColor={theme.colors.accentPrimary}
          disabled={isLoading || trackDuration === 0 || !!error}
        />
        <View style={styles.timeLabelsContainer}>
          <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeLabel}>{formatTime(trackDuration)}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={() => { /* playback.skipPrevious() */ }} style={styles.controlButton} disabled={true}>
          <Icon name="SkipBack" size={32} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={togglePlayPause}
          style={[
            styles.controlButton,
            styles.playPauseButton,
            (isLoading || !currentTrack || trackDuration === 0 || !!error) && {backgroundColor: theme.colors.textMuted} // Disabled style for play/pause
          ]}
          disabled={isLoading || !currentTrack || trackDuration === 0 || !!error}
        >
          {isLoading ? <ActivityIndicator size='large' color={theme.colors.white} /> : <Icon name={isPlaying ? 'Pause' : 'Play'} size={40} color={theme.colors.white} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { /* playback.skipNext() */ }} style={styles.controlButton} disabled={true}>
          <Icon name="SkipForward" size={32} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PlayerScreen;
