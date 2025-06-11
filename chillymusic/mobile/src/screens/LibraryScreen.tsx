import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../navigation/types';
import { DownloadedMediaItem } from '../types'; // SearchResult removed as adapter handles it
import { getLibraryItems, removeLibraryItem } from '../services/libraryStorageService';
import { useAppTheme } from '../context/ThemeContext';
import { usePlayback } from '../context/PlaybackContext';
import MusicCard from '../components/cards/MusicCard';
import Icon from '../components/ui/Icon';

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Library'>;
interface Props { navigation: LibraryScreenNavigationProp; }

// PlaybackProgress interface is now in PlaybackContext via PlaybackProgressState

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const playback = usePlayback();

  const [libraryItems, setLibraryItems] = useState<DownloadedMediaItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // REMOVED: selectedTrack, isPlaying, playbackError, playbackProgress, videoPlayerRef, currentFilePath local states

  const loadLibrary = async () => {
    setIsLoadingList(true);
    const items = await getLibraryItems();
    setLibraryItems(items.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()));
    setIsLoadingList(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLibrary();
      // If a track from another screen was playing, it will continue via context.
      // If we specifically want to stop it when entering library, call playback.clearPlayer() or playback.togglePlayPause()
      // For now, playback continues unless a new track is played from library.
    });
    return unsubscribe;
  }, [navigation]);

  const handleRemoveFromLibrary = async (item: DownloadedMediaItem) => {
    Alert.alert( 'Remove Item', `Are you sure you want to remove "${item.title}"?`,
      [ { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
            if (playback.currentTrack?.id === item.id) { // Check against context's current track
              playback.clearPlayer();
            }
            await removeLibraryItem(item.id);
            loadLibrary();
        }}
      ]
    );
  };

  if (isLoadingList) {
    return <View style={styles.centered}><ActivityIndicator size='large' color={theme.colors.accentPrimary} /></View>;
   }
  if (libraryItems.length === 0 && !isLoadingList) {
    return <View style={styles.centered}><Text style={styles.emptyText}>Your library is empty. Download some music!</Text></View>;
  }

  const renderLibraryItem = ({ item }: { item: DownloadedMediaItem }) => {
    // Adapt DownloadedMediaItem to PlayerTrack for playTrack function
    // MusicCard expects SearchResult-like, so adapter is still useful.
    const cardItemAdapter = {
        id: item.id, videoId: item.videoId, title: item.title,
        channel: item.channel || 'Unknown Artist',
        thumbnail: item.thumbnail || '', duration: item.duration || 0,
        publishedAt: item.downloadedAt,
    };
    const isCurrentlyPlayingItem = playback.currentTrack?.id === item.id && playback.isPlaying;
    // isLoading for playback of THIS item is playback.isLoading && playback.currentTrack?.id === item.id
    const isLoadingItemPlayback = playback.isLoading && playback.currentTrack?.id === item.id;

    return (
        <MusicCard
            item={cardItemAdapter}
            onPlayPause={() => playback.playTrack(item)} // Pass DownloadedMediaItem
            isPlaying={isCurrentlyPlayingItem}
            isLoading={isLoadingItemPlayback} // Loading state from context for this specific item
            onDownloadMp3={() => handleRemoveFromLibrary(item)}
        />
    );
  };

  const progressPercent = playback.progress.seekableDuration > 0
    ? (playback.progress.currentTime / playback.progress.seekableDuration) * 100 : 0;

  // Styles are now a function of theme
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundPrimary },
    listContent: { padding: theme.spacing.md, paddingBottom: playback.currentTrack ? 80 + theme.spacing.md : theme.spacing.md },
    miniPlayerTouchableWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },
    miniPlayer: { backgroundColor: theme.colors.backgroundSecondary, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xs, },
    miniPlayerInfoAndButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xs, },
    miniPlayerInfo: { flex: 1, marginRight: theme.spacing.sm, },
    miniPlayerText: { color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.body, fontWeight: theme.typography.fontWeight.bold as any, fontFamily: theme.typography.fontFamily.primary },
    miniPlayerArtist: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.caption, fontFamily: theme.typography.fontFamily.primary },
    miniPlayerError: { color: theme.colors.error, fontSize: theme.typography.fontSize.caption, fontStyle: 'italic', fontFamily: theme.typography.fontFamily.primary },
    miniPlayerButton: { padding: theme.spacing.xs, },
    progressBarContainer: { height: 4, backgroundColor: theme.colors.backgroundTertiary, borderRadius: theme.borderRadius.xs, overflow: 'hidden',},
    progressBar: { height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: theme.borderRadius.xs, },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.backgroundPrimary },
    emptyText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textSecondary, textAlign: 'center', fontFamily: theme.typography.fontFamily.primary },
    separator: { height: 1, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.md }, // Kept for FlatList ItemSeparatorComponent
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={libraryItems}
        keyExtractor={(item) => item.id}
        renderItem={renderLibraryItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
      {playback.currentTrack && (
        <TouchableOpacity
            style={styles.miniPlayerTouchableWrapper}
            onPress={() => navigation.navigate('Player')} // Navigate without params
        >
            <View style={styles.miniPlayer}>
                <View style={styles.miniPlayerInfoAndButton}>
                    <View style={styles.miniPlayerInfo}>
                        <Text style={styles.miniPlayerText} numberOfLines={1}>{playback.currentTrack.title}</Text>
                        <Text style={styles.miniPlayerArtist} numberOfLines={1}>{'channel' in playback.currentTrack ? playback.currentTrack.channel : (playback.currentTrack as any).artist || ''}</Text>
                        {playback.error && !playback.isLoading && (
                          <Text style={styles.miniPlayerError} numberOfLines={1}>Error: {playback.error}</Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={playback.togglePlayPause} style={styles.miniPlayerButton}>
                        {playback.isLoading && playback.currentTrack?.id === playback.currentTrack.id ? ( // check if loading THIS track
                          <ActivityIndicator size='small' color={theme.colors.textPrimary} />
                        ) : (
                          <Icon name={playback.isPlaying ? 'Pause' : 'Play'} size={28} color={theme.colors.textPrimary} />
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                </View>
            </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default LibraryScreen;
