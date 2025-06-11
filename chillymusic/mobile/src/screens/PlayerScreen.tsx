import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PlayerScreenParams } from '../navigation/types'; // PlayerScreenParams will be new
import { DefaultTheme, Spacing, Typography, BorderRadius } from '../theme/theme';
import Icon from '../components/ui/Icon';
// import Slider from '@react-native-community/slider'; // For seek bar - install later

// Mock data for UI layout before context integration
const MOCK_TRACK_DETAILS = {
  title: 'Midnight Serenade (Mock)',
  artist: 'Ethan Blake (Mock)',
  albumArtUrl: 'https://via.placeholder.com/300', // Placeholder
  duration: 245, // seconds
  currentTime: 60, // seconds
};

type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
// type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>; // Not used directly yet

interface Props {
  route: PlayerScreenRouteProp;
  // navigation: PlayerScreenNavigationProp; // Not used directly yet
}

const PlayerScreen: React.FC<Props> = ({ route }) => {
  // const { track, isPlaying: initialIsPlaying, currentTime, duration } = route.params; // From navigation params
  // For now, using mock data until PlaybackContext is integrated
  // Extract track data carefully, as it can be SearchResult or DownloadedMediaItem
  const passedTrack = route.params?.track;
  const trackTitle = passedTrack?.title || MOCK_TRACK_DETAILS.title;
  const trackArtist = passedTrack?.channel || (passedTrack as any)?.artist || MOCK_TRACK_DETAILS.artist; // Handle DownloadedMediaItem potentially having 'artist'
  const trackThumbnail = passedTrack?.thumbnail || MOCK_TRACK_DETAILS.albumArtUrl;

  const initialIsPlaying = route.params?.isPlaying || false;
  const currentTime = route.params?.progress?.currentTime || MOCK_TRACK_DETAILS.currentTime;
  const duration = route.params?.progress?.seekableDuration || passedTrack?.duration || MOCK_TRACK_DETAILS.duration;

  // Placeholder state and handlers - will be replaced by PlaybackContext
  const [isPlaying, setIsPlaying] = React.useState(initialIsPlaying);
  // const [currentPosition, setCurrentPosition] = React.useState(currentTime); // Not needed if context drives this
  // const [trackDuration, setTrackDuration] = React.useState(duration); // Not needed if context drives this

  const handlePlayPause = () => setIsPlaying(!isPlaying); // This will be replaced by context call
  const handleSkipNext = () => console.log('Skip Next');
  const handleSkipPrevious = () => console.log('Skip Previous');
  // const onSeek = (value: number) => console.log('Seek to:', value);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.albumArtContainer}>
        <Image source={{ uri: trackThumbnail }} style={styles.albumArt} />
      </View>

      <View style={styles.trackInfoContainer}>
        <Text style={styles.title} numberOfLines={2}>{trackTitle}</Text>
        <Text style={styles.artist} numberOfLines={1}>{trackArtist}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.progressBarStaticContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
        {/* <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          // onSlidingComplete={onSeek}
          minimumTrackTintColor={DefaultTheme.colors.accentPrimary}
          maximumTrackTintColor={DefaultTheme.colors.textMuted}
          thumbTintColor={DefaultTheme.colors.accentPrimary}
        /> */}
        <View style={styles.timeLabelsContainer}>
          <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handleSkipPrevious} style={styles.controlButton}>
          <Icon name="SkipBack" size={32} color={DefaultTheme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={[styles.controlButton, styles.playPauseButton]}>
          <Icon name={isPlaying ? 'Pause' : 'Play'} size={40} color={DefaultTheme.colors.backgroundPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkipNext} style={styles.controlButton}>
          <Icon name="SkipForward" size={32} color={DefaultTheme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DefaultTheme.colors.backgroundPrimary },
  contentContainer: { flexGrow: 1, padding: Spacing.lg, justifyContent: 'space-around' },
  albumArtContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  albumArt: {
    width: 300,
    height: 300,
    borderRadius: BorderRadius.lg,
  },
  trackInfoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold as any,
    color: DefaultTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.primary,
  },
  artist: {
    fontSize: Typography.fontSize.bodyLarge,
    color: DefaultTheme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.primary,
  },
  sliderContainer: {
    marginBottom: Spacing.xl,
  },
  progressBarStaticContainer: { height: 6, backgroundColor: DefaultTheme.colors.backgroundTertiary, borderRadius: 3, overflow: 'hidden', marginVertical: Spacing.md,},
  progressBar: { height: '100%', backgroundColor: DefaultTheme.colors.accentPrimary, borderRadius: 3, },
  timeLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  timeLabel: {
    fontSize: Typography.fontSize.caption,
    color: DefaultTheme.colors.textMuted,
    fontFamily: Typography.fontFamily.primary,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  controlButton: {
    padding: Spacing.sm,
  },
  playPauseButton: {
    backgroundColor: DefaultTheme.colors.accentPrimary,
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerScreen;
