import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
// @ts-ignore
import Video, { OnLoadData, OnProgressData, OnErrorData } from 'react-native-video';

import { RootStackParamList } from '../navigation/types';
import { SearchResult, MediaInfo, MediaFormatDetails } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { DefaultTheme, Spacing, Typography } from '../theme/theme';
import { fetchMediaInfo } from '../services/apiService';
import Icon from '../components/ui/Icon';

type SearchResultsScreenRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type SearchResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchResults'>;

interface Props {
  route: SearchResultsScreenRouteProp;
  navigation: SearchResultsScreenNavigationProp;
}

interface PlaybackProgress {
  currentTime: number;
  seekableDuration: number; // Total duration of the playable media
}

const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { results, query } = route.params;
  const [selectedTrack, setSelectedTrack] = useState<SearchResult | null>(null);
  // mediaInfo is not directly used in UI for now, but good to have if expanding
  // const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingMediaForTrackId, setIsLoadingMediaForTrackId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<PlaybackProgress>({ currentTime: 0, seekableDuration: 0 });

  const videoPlayerRef = useRef<Video>(null);

  const handlePlayPause = async (track: SearchResult) => {
    setPlaybackError(null);
    if (selectedTrack?.videoId === track.videoId) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedTrack(track);
      setIsPlaying(false);
      setIsLoadingMediaForTrackId(track.videoId); // Indicate loading for this specific track
      setStreamUrl(null);
      setPlaybackProgress({ currentTime: 0, seekableDuration: 0 }); // Reset progress
      try {
        const info = await fetchMediaInfo(track.videoId);
        // setMediaInfo(info);
        const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || f.audioCodec);
        if (audioFormat?.url) {
          setStreamUrl(audioFormat.url);
          setIsPlaying(true);
        } else {
          Alert.alert('Playback Error', 'No suitable audio stream found for this track.');
          setPlaybackError('No suitable audio stream found.');
        }
      } catch (error: any) {
        Alert.alert('Playback Error', error.message || 'Failed to fetch media details.');
        setPlaybackError(error.message || 'Failed to fetch media details.');
      } finally {
        setIsLoadingMediaForTrackId(null);
      }
    }
  };

  const onVideoLoad = (data: OnLoadData) => {
    console.log('Video loaded, duration:', data.duration);
    setPlaybackProgress(prev => ({ ...prev, seekableDuration: data.duration }));
  };

  const onVideoProgress = (data: OnProgressData) => {
    setPlaybackProgress({ currentTime: data.currentTime, seekableDuration: data.seekableDuration || playbackProgress.seekableDuration });
  };

  const onVideoError = (error: OnErrorData) => {
    console.error('Video playback error:', error);
    const errorMessage = error.error?.localizedFailureReason || error.error?.localizedDescription || 'Unknown playback error';
    Alert.alert('Playback Error', errorMessage);
    setPlaybackError(errorMessage);
    setIsPlaying(false);
  };

  const onVideoEnd = () => {
    setIsPlaying(false);
    // Optionally: play next track, clear selection, etc.
    // For now, just stop.
    // setSelectedTrack(null);
    // setStreamUrl(null);
    setPlaybackProgress({ currentTime: 0, seekableDuration: 0 });
  };

  if (!results) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size='large' color={DefaultTheme.colors.accentPrimary} />
        <Text style={styles.emptyText}>Loading results...</Text>
      </View>
    );
  }
  if (results.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No results found for "{query}".</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <Text style={styles.goBackButtonText}>Try another search</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMusicCard = ({ item }: { item: SearchResult }) => {
    const isCurrentlyPlayingItem = selectedTrack?.videoId === item.videoId && isPlaying;
    const isLoadingItem = isLoadingMediaForTrackId === item.videoId;

    return (
      <MusicCard
        item={item}
        onPlayPause={handlePlayPause} // Pass unified play/pause handler
        isPlaying={isCurrentlyPlayingItem}
        isLoading={isLoadingItem}
      />
    );
  };

  const progressPercent = playbackProgress.seekableDuration > 0
    ? (playbackProgress.currentTime / playbackProgress.seekableDuration) * 100
    : 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        renderItem={renderMusicCard}
        keyExtractor={(item) => item.id + item.videoId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {streamUrl && selectedTrack && (
        <Video
          ref={videoPlayerRef}
          source={{ uri: streamUrl }}
          paused={!isPlaying}
          audioOnly={true}
          playInBackground={true}
          playWhenInactive={true}
          onError={onVideoError}
          onLoad={onVideoLoad}
          onProgress={onVideoProgress}
          onEnd={onVideoEnd}
          style={styles.videoPlayer}
          progressUpdateInterval={1000} // Update progress every second
        />
      )}
      {selectedTrack && (
        <View style={styles.miniPlayer}>
          <View style={styles.miniPlayerInfoAndButton}>
            <View style={styles.miniPlayerInfo}>
              <Text style={styles.miniPlayerText} numberOfLines={1}>{selectedTrack.title}</Text>
              <Text style={styles.miniPlayerArtist} numberOfLines={1}>{selectedTrack.channel}</Text>
              {playbackError && isLoadingMediaForTrackId !== selectedTrack.videoId && ( // Show error only if not currently loading this track
                <Text style={styles.miniPlayerError} numberOfLines={1}>Error: {playbackError}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => handlePlayPause(selectedTrack)} style={styles.miniPlayerButton}>
              {isLoadingMediaForTrackId === selectedTrack.videoId ? (
                <ActivityIndicator size='small' color={DefaultTheme.colors.textPrimary} />
              ) : (
                <Icon name={isPlaying ? 'Pause' : 'Play'} size={28} color={DefaultTheme.colors.textPrimary} />
              )}
            </TouchableOpacity>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DefaultTheme.colors.backgroundPrimary },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
  listContent: { padding: Spacing.md, paddingBottom: 80 }, // Add paddingBottom for mini player
  emptyText: { fontSize: Typography.fontSize.bodyLarge, color: DefaultTheme.colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  goBackButton: { // Added from previous version of this screen
    backgroundColor: DefaultTheme.colors.accentPrimary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  goBackButtonText: { // Added from previous version of this screen
    color: DefaultTheme.colors.white,
    fontSize: Typography.fontSize.bodyLarge,
    fontWeight: Typography.fontWeight.medium,
  },
  videoPlayer: { width: 0, height: 0 },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DefaultTheme.colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: DefaultTheme.colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  miniPlayerInfoAndButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  miniPlayerInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  miniPlayerText: {
    color: DefaultTheme.colors.textPrimary,
    fontSize: Typography.fontSize.body,
    fontWeight: 'bold',
  },
  miniPlayerArtist: {
    color: DefaultTheme.colors.textSecondary,
    fontSize: Typography.fontSize.caption,
  },
  miniPlayerError: {
    color: DefaultTheme.colors.error,
    fontSize: Typography.fontSize.caption,
    fontStyle: 'italic',
  },
  miniPlayerButton: {
    padding: Spacing.xs,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: DefaultTheme.colors.backgroundTertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: DefaultTheme.colors.accentPrimary,
    borderRadius: 2,
  },
});

export default SearchResultsScreen;
