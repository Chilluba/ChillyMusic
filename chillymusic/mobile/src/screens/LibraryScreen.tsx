import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
// @ts-ignore
import Video, { OnLoadData, OnProgressData, OnErrorData } from 'react-native-video';

import { RootStackParamList } from '../navigation/types';
import { DownloadedMediaItem, SearchResult } from '../types'; // SearchResult might be needed if MusicCard expects it
import { getLibraryItems, removeLibraryItem } from '../services/libraryStorageService';
import { DefaultTheme, Spacing, Typography } from '../theme/theme';
import MusicCard from '../components/cards/MusicCard'; // Import MusicCard
import Icon from '../components/ui/Icon'; // For mini-player icons

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Library'>;

interface Props {
  navigation: LibraryScreenNavigationProp;
}

interface PlaybackProgress {
  currentTime: number;
  seekableDuration: number;
}

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const [libraryItems, setLibraryItems] = useState<DownloadedMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Playback states
  const [selectedTrack, setSelectedTrack] = useState<DownloadedMediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<PlaybackProgress>({ currentTime: 0, seekableDuration: 0 });
  const videoPlayerRef = useRef<Video>(null);

  // This state is for the stream URL if we were streaming. For local files, filePath is used.
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);


  const loadLibrary = async () => {
    setIsLoading(true);
    const items = await getLibraryItems();
    setLibraryItems(items.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())); // Sort by newest first
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLibrary();
      // Stop playback when navigating to library if something was playing (e.g. from search results)
      // This is a simple approach. A global player context would be more robust.
      if (selectedTrack) { // If a track from library was playing, it will be re-selected or cleared by new logic
          // If we want to stop any playback when entering library:
          // setIsPlaying(false);
          // setSelectedTrack(null);
          // setCurrentFilePath(null);
      }
    });
    return unsubscribe;
  }, [navigation]);


  const handlePlayPauseFromLibrary = (item: DownloadedMediaItem) => {
    setPlaybackError(null);
    if (selectedTrack?.id === item.id) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedTrack(item);
      setCurrentFilePath(`file://${item.filePath}`); // Set the local file path for the Video component
      setIsPlaying(true); // Auto-play when a new item is selected
      setPlaybackProgress({ currentTime: 0, seekableDuration: 0 }); // Reset progress
    }
  };

  const onVideoLoad = (data: OnLoadData) => {
    console.log('Library video loaded, duration:', data.duration);
    setPlaybackProgress(prev => ({ ...prev, seekableDuration: data.duration }));
  };

  const onVideoProgress = (data: OnProgressData) => {
    setPlaybackProgress({ currentTime: data.currentTime, seekableDuration: data.seekableDuration || playbackProgress.seekableDuration });
  };

  const onVideoError = (error: OnErrorData) => {
    console.error('Library video playback error:', error);
    const errorMessage = error.error?.localizedFailureReason || error.error?.localizedDescription || 'Unknown playback error';
    Alert.alert('Playback Error', `Could not play ${selectedTrack?.title}: ${errorMessage}`);
    setPlaybackError(errorMessage);
    setIsPlaying(false);
  };

  const onVideoEnd = () => {
    setIsPlaying(false);
    setPlaybackProgress({ currentTime: 0, seekableDuration: 0 });
    // Optionally clear selectedTrack or play next
  };


  const handleRemoveFromLibrary = async (item: DownloadedMediaItem) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${item.title}" from your library metadata? This will not delete the actual file.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
            if (selectedTrack?.id === item.id) { // Stop playback if removing current track
                setIsPlaying(false);
                setSelectedTrack(null);
                setCurrentFilePath(null);
            }
            await removeLibraryItem(item.id);
            loadLibrary();
        }}
      ]
    );
  };


  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size='large' color={DefaultTheme.colors.accentPrimary} /></View>;
  }

  if (libraryItems.length === 0) {
    return <View style={styles.centered}><Text style={styles.emptyText}>Your library is empty. Download some music!</Text></View>;
  }

  const renderLibraryItem = ({ item }: { item: DownloadedMediaItem }) => {
    const cardItemAdapter: SearchResult = {
        id: item.id, // Use the library item's unique ID
        videoId: item.videoId,
        title: item.title,
        channel: item.channel || 'Unknown Artist',
        thumbnail: item.thumbnail || '',
        duration: item.duration || 0,
        publishedAt: item.downloadedAt,
    };
    const isCurrentlyPlayingItem = selectedTrack?.id === item.id && isPlaying;

    return (
        <MusicCard
            item={cardItemAdapter}
            onPlayPause={() => handlePlayPauseFromLibrary(item)}
            isPlaying={isCurrentlyPlayingItem}
            isLoading={false} // No individual loading for local files
            onDownloadMp3={() => handleRemoveFromLibrary(item)} // Re-purpose download button for remove
        />
    );
  };

  const progressPercent = playbackProgress.seekableDuration > 0
    ? (playbackProgress.currentTime / playbackProgress.seekableDuration) * 100
    : 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={libraryItems}
        keyExtractor={(item) => item.id}
        renderItem={renderLibraryItem}
        // ItemSeparatorComponent={() => <View style={styles.separator} />} // MusicCard has marginBottom
        contentContainerStyle={styles.listContent}
      />

      {currentFilePath && selectedTrack && (
        <Video
          ref={videoPlayerRef}
          source={{ uri: currentFilePath }} // Use file URI scheme
          paused={!isPlaying}
          audioOnly={true}
          playInBackground={true}
          playWhenInactive={true}
          onError={onVideoError}
          onLoad={onVideoLoad}
          onProgress={onVideoProgress}
          onEnd={onVideoEnd}
          style={styles.videoPlayer}
          progressUpdateInterval={1000}
        />
      )}

      {selectedTrack && (
      <TouchableOpacity
        style={styles.miniPlayerTouchableWrapper} // New wrapper style
        onPress={() => {
          if (selectedTrack) {
            navigation.navigate('Player', {
              track: selectedTrack, // selectedTrack is DownloadedMediaItem here
              isPlaying: isPlaying,
              progress: playbackProgress
            });
          }
        }}
      >
        <View style={styles.miniPlayer}>
            <View style={styles.miniPlayerInfoAndButton}>
                <View style={styles.miniPlayerInfo}>
                    <Text style={styles.miniPlayerText} numberOfLines={1}>{selectedTrack.title}</Text>
                    <Text style={styles.miniPlayerArtist} numberOfLines={1}>{selectedTrack.channel}</Text>
                    {playbackError && (<Text style={styles.miniPlayerError} numberOfLines={1}>Error: {playbackError}</Text>)}
                </View>
                <TouchableOpacity onPress={() => handlePlayPauseFromLibrary(selectedTrack)} style={styles.miniPlayerButton}>
                    <Icon name={isPlaying ? 'Pause' : 'Play'} size={28} color={DefaultTheme.colors.textPrimary} />
                </TouchableOpacity>
            </View>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  emptyText: { fontSize: Typography.fontSize.bodyLarge, color: DefaultTheme.colors.textSecondary, textAlign: 'center' },
  listContent: { padding: Spacing.md, paddingBottom: 80 }, // Ensure paddingBottom accommodates miniPlayer
  // separator: { height: 1, backgroundColor: DefaultTheme.colors.border, marginHorizontal: Spacing.md, marginVertical: Spacing.xs },
  videoPlayer: { width: 0, height: 0 },
  miniPlayerTouchableWrapper: { // Style for the new TouchableOpacity
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it's above other flatlist content
  },
  miniPlayer: { position: 'absolute', bottom: 0,left: 0, right: 0, backgroundColor: DefaultTheme.colors.backgroundSecondary, borderTopWidth: 1, borderTopColor: DefaultTheme.colors.border, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.xs, },
  miniPlayerInfoAndButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs, },
  miniPlayerInfo: { flex: 1, marginRight: Spacing.sm, },
  miniPlayerText: { color: DefaultTheme.colors.textPrimary, fontSize: Typography.fontSize.body, fontWeight: 'bold', },
  miniPlayerArtist: { color: DefaultTheme.colors.textSecondary, fontSize: Typography.fontSize.caption, },
  miniPlayerError: { color: DefaultTheme.colors.error, fontSize: Typography.fontSize.caption, fontStyle: 'italic',},
  miniPlayerButton: { padding: Spacing.xs, },
  progressBarContainer: { height: 4, backgroundColor: DefaultTheme.colors.backgroundTertiary, borderRadius: 2, overflow: 'hidden',},
  progressBar: { height: '100%', backgroundColor: DefaultTheme.colors.accentPrimary, borderRadius: 2, },
});

export default LibraryScreen;
