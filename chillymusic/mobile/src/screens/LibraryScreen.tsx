import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
// @ts-ignore
import RNFS from 'react-native-fs';

import { RootStackParamList } from '../navigation/types';
import { DownloadedMediaItem, SearchResult } from '../types';
import { getLibraryItems, removeLibraryItem as removeLibraryItemMeta } from '../services/libraryStorageService';
import { useAppTheme } from '../context/ThemeContext';
import { usePlayback } from '../context/PlaybackContext';
import { useDownload, ActiveDownloadProgress } from '../context/DownloadContext';
import MusicCard from '../components/cards/MusicCard';
import Icon from '../components/ui/Icon';

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Library'>;
interface Props { navigation: LibraryScreenNavigationProp; }

type LibraryDisplayItem = DownloadedMediaItem | ActiveDownloadProgress;

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const playback = usePlayback();
  const downloadContext = useDownload();

  const [displayItems, setDisplayItems] = useState<LibraryDisplayItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const loadLibraryAndDownloads = useCallback(async () => {
    setIsLoadingList(true);
    const libraryMetaItems = await getLibraryItems();
    const activeDownloadsArray = Object.values(downloadContext.activeDownloads);

    const combinedItemsMap = new Map<string, LibraryDisplayItem>();

    activeDownloadsArray.forEach(dl => {
      if (dl.itemMetadata?.id) { // itemMetadata.id is the composite downloadKey
        combinedItemsMap.set(dl.itemMetadata.id, dl);
      }
    });

    libraryMetaItems.forEach(libItem => {
      // libItem.id is already the composite downloadKey
      const activeVersion = combinedItemsMap.get(libItem.id);
      // If no active version, or if the active version is NOT currently downloading or queued, then use the library item.
      // This means if an active download is completed or errored out, the library item (which is the source of truth for completed items) will be shown.
      if (!activeVersion || (activeVersion.status !== 'downloading' && activeVersion.status !== 'queued')) {
        combinedItemsMap.set(libItem.id, libItem);
      }
    });

    const combinedItems = Array.from(combinedItemsMap.values());

    combinedItems.sort((a, b) => {
      const aIsActiveNonError = 'status' in a && (a.status === 'downloading' || a.status === 'queued');
      const bIsActiveNonError = 'status' in b && (b.status === 'downloading' || b.status === 'queued');
      if (aIsActiveNonError && !bIsActiveNonError) return -1;
      if (!aIsActiveNonError && bIsActiveNonError) return 1;

      const dateA = 'downloadedAt' in a ? a.downloadedAt : ('itemMetadata' in a && a.itemMetadata?.id ? new Date(0).toISOString() : new Date(0).toISOString());
      const dateB = 'downloadedAt' in b ? b.downloadedAt : ('itemMetadata' in b && b.itemMetadata?.id ? new Date(0).toISOString() : new Date(0).toISOString());
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    setDisplayItems(combinedItems);
    setIsLoadingList(false);
  }, [downloadContext.activeDownloads]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLibraryAndDownloads();
    });
    loadLibraryAndDownloads();
    return unsubscribe;
  }, [navigation, loadLibraryAndDownloads]);


  const handlePlayItem = (item: LibraryDisplayItem) => {
    // If it's a completed download from activeDownloads list or a persisted DownloadedMediaItem
    if (('status' in item && item.status === 'completed' && item.filePath && item.itemMetadata) || ('filePath' in item && !('status' in item))) {
       const playableItem: DownloadedMediaItem = 'status' in item && item.itemMetadata && item.filePath ?
        { // Reconstruct DownloadedMediaItem from completed ActiveDownloadProgress
            id: item.itemMetadata.id, videoId: item.itemMetadata.videoId, title: item.itemMetadata.title,
            channel: item.itemMetadata.channel, filePath: item.filePath, thumbnail: item.itemMetadata.thumbnail,
            downloadedAt: new Date().toISOString(), // This might not be the original download time
            format: item.itemMetadata.format, quality: item.itemMetadata.quality, duration: item.itemMetadata.duration,
        } : item as DownloadedMediaItem; // Already a DownloadedMediaItem

       playback.playTrack(playableItem);
       navigation.navigate('Player');
    } else {
      Alert.alert('Cannot Play', 'Item is still downloading or has an error.');
    }
  };

  const handleDeleteItem = async (item: LibraryDisplayItem) => {
    const itemId = 'id' in item ? item.id : (item.itemMetadata?.id || ''); // item.id for DownloadedMediaItem, item.itemMetadata.id for ActiveDownload
    const itemTitle = 'title' in item ? item.title : (item.itemMetadata?.title || 'this item');
    let itemFilePath = 'filePath' in item ? item.filePath : undefined;
    if (!itemFilePath && 'itemMetadata' in item && item.itemMetadata?.id) { // If it's an active download, path might be there if completed
        const activeDl = downloadContext.activeDownloads[item.itemMetadata.id];
        if (activeDl?.status === 'completed') itemFilePath = activeDl.filePath;
    }


    if (!itemId) { Alert.alert("Error", "Item ID not found, cannot delete."); return; }

    const isCurrentlyPlayingThisItem = playback.currentTrack?.id === itemId && playback.isPlaying;

    Alert.alert( 'Confirm Deletion', `Are you sure you want to remove "${itemTitle}"? This will cancel ongoing downloads and delete the file if downloaded.`,
      [ { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'destructive', onPress: async () => {
            if (isCurrentlyPlayingThisItem) { playback.clearPlayer(); }

            if ('status' in item && item.jobId && item.status === 'downloading') { // It's an active, ongoing download
              await downloadContext.cancelDownload(itemId);
            }

            if (itemFilePath) {
              try {
                const fileExists = await RNFS.exists(itemFilePath);
                if (fileExists) await RNFS.unlink(itemFilePath);
              } catch (e) { console.error('Error deleting file during library removal:', e); }
            }
            await removeLibraryItemMeta(itemId);
            downloadContext.clearCompletedOrErroredDownload(itemId);
            loadLibraryAndDownloads();
            Alert.alert('Removed', `"${itemTitle}" removed.`);
        }}
      ]
    );
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
    downloadStatusContainer: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, backgroundColor: theme.colors.backgroundTertiary, marginTop: -theme.spacing.sm + theme.spacing.xs, marginBottom: theme.spacing.sm, borderRadius: theme.borderRadius.sm, },
    downloadStatusText: { fontSize: theme.typography.fontSize.caption, marginBottom: theme.spacing.xs / 2, fontFamily: theme.typography.fontFamily.primary },
    itemProgressBarOuter: { height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden', },
    itemProgressBarInner: { height: '100%', backgroundColor: theme.colors.accentSecondary, borderRadius: 3, },
    errorText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.error, fontFamily: theme.typography.fontFamily.primary },
  });

  if (isLoadingList) {  return <View style={styles.centered}><ActivityIndicator size='large' color={theme.colors.accentPrimary} /></View>; }
  if (displayItems.length === 0 && !isLoadingList) { return <View style={styles.centered}><Text style={styles.emptyText}>Your library is empty. Download some music!</Text></View>; }

  const renderDisplayItem = ({ item }: { item: LibraryDisplayItem }) => {
    const isActualDownloadProgressEntry = 'status' in item && typeof item.status === 'string'; // Check if it's ActiveDownloadProgress

    const title = isActualDownloadProgressEntry ? item.itemMetadata?.title : item.title;
    const channel = isActualDownloadProgressEntry ? item.itemMetadata?.channel : item.channel;
    const thumbnail = isActualDownloadProgressEntry ? item.itemMetadata?.thumbnail : item.thumbnail;
    const duration = isActualDownloadProgressEntry ? item.itemMetadata?.duration : item.duration;
    const id = isActualDownloadProgressEntry ? item.itemMetadata!.id : item.id;
    const videoId = isActualDownloadProgressEntry ? item.itemMetadata!.videoId : item.videoId;
    const downloadedAt = 'downloadedAt' in item ? item.downloadedAt : (isActualDownloadProgressEntry ? new Date(item.itemMetadata!.addedAt || 0).toISOString() : new Date(0).toISOString());


    const cardItemAdapter: SearchResult = {
        id: id, videoId: videoId, title: title || 'N/A',
        channel: channel || 'Unknown Artist', thumbnail: thumbnail || '',
        duration: duration || 0, publishedAt: downloadedAt
    };

    const isCurrentlyPlayingItem = playback.currentTrack?.id === id && playback.isPlaying;
    const isLoadingItemPlayback = playback.isLoading && playback.currentTrack?.id === id;

    return (
      <View>
        <MusicCard
            item={cardItemAdapter}
            onPlayPause={() => handlePlayItem(item)}
            isPlaying={isCurrentlyPlayingItem}
            isLoading={isLoadingItemPlayback}
            onDownloadMp3={() => handleDeleteItem(item)}
        />
        {isActualDownloadProgressEntry && (
          <View style={styles.downloadStatusContainer}>
            {item.status === 'queued' && ( <Text style={[styles.downloadStatusText, { color: theme.colors.textMuted }]}>Queued</Text> )}
            {item.status === 'downloading' && (
              <>
                <Text style={[styles.downloadStatusText, { color: theme.colors.accentSecondary }]}> Downloading: {item.progress.toFixed(0)}% </Text>
                <View style={styles.itemProgressBarOuter}><View style={[styles.itemProgressBarInner, {width: `${item.progress}%`}]} /></View>
              </>
            )}
            {item.status === 'error' && ( <Text style={[styles.downloadStatusText, {color: theme.colors.error}]}>Error: {item.error}</Text> )}
            {/* Completed status is implicitly handled by item being a DownloadedMediaItem from storage if not actively downloading */}
            {item.status === 'cancelled' && ( <Text style={[styles.downloadStatusText, {color: theme.colors.textMuted}]}>Cancelled</Text> )}
          </View>
        )}
      </View>
    );
  };

  const progressPercent = playback.progress.seekableDuration > 0 ? (playback.progress.currentTime / playback.progress.seekableDuration) * 100 : 0;

  return (
    <View style={styles.container}>
      <FlatList data={displayItems} keyExtractor={(item, index) => ('id' in item ? item.id : item.itemMetadata?.id || index.toString())} renderItem={renderDisplayItem} ItemSeparatorComponent={() => <View style={styles.separator} />} contentContainerStyle={styles.listContent} />
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
