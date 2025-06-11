import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
// @ts-ignore
import RNFS from 'react-native-fs'; // For deleting files

import { RootStackParamList } from '../navigation/types';
import { DownloadedMediaItem, SearchResult } from '../types';
import { getLibraryItems, removeLibraryItem as removeLibraryItemMeta } from '../services/libraryStorageService';
import { useAppTheme } from '../context/ThemeContext';
import { usePlayback } from '../context/PlaybackContext';
import MusicCard from '../components/cards/MusicCard';
import Icon from '../components/ui/Icon';

// Assume DownloadContext will provide this type or similar
interface ActiveDownload {
  progress: number;
  jobId?: number;
  error?: string;
  filePath?: string; // The final path once known
}

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Library'>;
interface Props { navigation: LibraryScreenNavigationProp; }

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const playback = usePlayback();

  const [libraryItems, setLibraryItems] = useState<DownloadedMediaItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Placeholder for active downloads - this would come from DownloadContext later
  const [mockActiveDownloads, _setMockActiveDownloads] = useState<{[key: string]: ActiveDownload}>({}); // Renamed setter to avoid unused var warning

  const loadLibrary = async () => {
    setIsLoadingList(true);
    const items = await getLibraryItems();
    setLibraryItems(items.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()));
    setIsLoadingList(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { loadLibrary(); });
    return unsubscribe;
  }, [navigation]);

  const handlePlayFromLibrary = (item: DownloadedMediaItem) => {
    playback.playTrack(item);
    navigation.navigate('Player');
  };

  const handleDeleteFileAndMeta = async (item: DownloadedMediaItem) => {
    try {
      if (item.filePath) {
        const fileExists = await RNFS.exists(item.filePath);
        if (fileExists) {
          console.log(`Deleting file: ${item.filePath}`);
          await RNFS.unlink(item.filePath);
        } else {
          console.warn(`File not found for deletion: ${item.filePath}`);
        }
      }
      await removeLibraryItemMeta(item.id); // Remove metadata
      loadLibrary(); // Refresh list
      Alert.alert('Deleted', `"${item.title}" has been deleted from your library and device.`);
    } catch (error: any) {
      console.error(`Error deleting item ${item.id}:`, error);
      Alert.alert('Error', `Could not delete item: ${error.message}`);
    }
  };

  const handleRemoveFromLibrary = async (item: DownloadedMediaItem) => {
    // Check if the item to be removed is currently selected for playback in the context
    const isCurrentlySelectedForPlayback = playback.currentTrack?.id === item.id;

    if (isCurrentlySelectedForPlayback && playback.isPlaying) {
      Alert.alert(
        'Confirm Deletion',
        `"${item.title}" is currently playing. Stop playback and delete the file and library entry?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {
              playback.clearPlayer();
              handleDeleteFileAndMeta(item);
          }}
        ]
      );
    } else {
      Alert.alert(
        'Confirm Deletion',
        `Are you sure you want to delete "${item.title}" from your library and device?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => handleDeleteFileAndMeta(item) }
        ]
      );
    }
  };

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
    progressBarContainerMini: { height: 4, backgroundColor: theme.colors.backgroundTertiary, borderRadius: theme.borderRadius.xs, overflow: 'hidden',},
    progressBarMini: { height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: theme.borderRadius.xs, },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.backgroundPrimary },
    emptyText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textSecondary, textAlign: 'center', fontFamily: theme.typography.fontFamily.primary },
    separator: { height: 1, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.md },
    progressContainer: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, marginTop: -theme.spacing.sm, },
    progressText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.accentPrimary, marginBottom: theme.spacing.xs / 2, fontFamily: theme.typography.fontFamily.primary },
    progressBarOuter: { height: 6, backgroundColor: theme.colors.backgroundTertiary, borderRadius: 3, overflow: 'hidden', },
    progressBarInner: { height: '100%', backgroundColor: theme.colors.accentSecondary, borderRadius: 3, },
    errorText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.error, fontFamily: theme.typography.fontFamily.primary },
  });


  if (isLoadingList) {
    return <View style={styles.centered}><ActivityIndicator size='large' color={theme.colors.accentPrimary} /></View>;
   }
  if (libraryItems.length === 0 && !isLoadingList) {
    return <View style={styles.centered}><Text style={styles.emptyText}>Your library is empty. Download some music!</Text></View>;
  }

  const renderLibraryItem = ({ item }: { item: DownloadedMediaItem }) => {
    const cardItemAdapter: SearchResult = {
        id: item.id, videoId: item.videoId, title: item.title,
        channel: item.channel || 'Unknown Artist',
        thumbnail: item.thumbnail || '', duration: item.duration || 0,
        publishedAt: item.downloadedAt,
    };
    const isCurrentlyPlayingItem = playback.currentTrack?.id === item.id && playback.isPlaying;
    const isLoadingItemPlayback = playback.isLoading && playback.currentTrack?.id === item.id;

    const downloadStatus = mockActiveDownloads[item.id];

    return (
      <View>
        <MusicCard
            item={cardItemAdapter}
            onPlayPause={() => handlePlayFromLibrary(item)}
            isPlaying={isCurrentlyPlayingItem}
            isLoading={isLoadingItemPlayback}
            onDownloadMp3={() => handleRemoveFromLibrary(item)}
        />
        {downloadStatus && downloadStatus.progress < 100 && !downloadStatus.error && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Downloading: {downloadStatus.progress.toFixed(0)}%</Text>
            <View style={styles.progressBarOuter}><View style={[styles.progressBarInner, {width: `${downloadStatus.progress}%`}]} /></View>
          </View>
        )}
         {downloadStatus && downloadStatus.error && (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, {color: theme.colors.error}]}>Download Error</Text>
          </View>
        )}
      </View>
    );
  };

  const progressPercent = playback.progress.seekableDuration > 0
    ? (playback.progress.currentTime / playback.progress.seekableDuration) * 100 : 0;

  return (
    <View style={styles.container}>
      <FlatList data={libraryItems} keyExtractor={(item) => item.id} renderItem={renderLibraryItem} ItemSeparatorComponent={() => <View style={styles.separator} />} contentContainerStyle={styles.listContent} />
      {playback.currentTrack && (
        <TouchableOpacity onPress={() => navigation.navigate('Player')} style={styles.miniPlayerTouchableWrapper}>
            <View style={styles.miniPlayer}>
                <View style={styles.miniPlayerInfoAndButton}>
                    <View style={styles.miniPlayerInfo}>
                        <Text style={styles.miniPlayerText} numberOfLines={1}>{playback.currentTrack.title}</Text>
                        <Text style={styles.miniPlayerArtist} numberOfLines={1}>{'channel' in playback.currentTrack ? playback.currentTrack.channel : ((playback.currentTrack as any).artist || 'Unknown Artist')}</Text>
                        {playback.error && !playback.isLoading && ( <Text style={styles.miniPlayerError} numberOfLines={1}>Error: {playback.error}</Text> )}
                    </View>
                    <TouchableOpacity onPress={playback.togglePlayPause} style={styles.miniPlayerButton}>
                        {(playback.isLoading && playback.currentTrack?.id === playback.currentTrack.id) ? ( <ActivityIndicator size='small' color={theme.colors.textPrimary} /> ) : ( <Icon name={playback.isPlaying ? 'Pause' : 'Play'} size={28} color={theme.colors.textPrimary} /> )}
                    </TouchableOpacity>
                </View>
                <View style={styles.progressBarContainerMini}><View style={[styles.progressBarMini, { width: `${progressPercent}%` }]} /></View>
            </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default LibraryScreen;
