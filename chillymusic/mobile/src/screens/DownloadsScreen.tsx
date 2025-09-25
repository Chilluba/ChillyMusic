import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native'; // Added Image
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../context/ThemeContext';
import { useDownload, ActiveDownloadProgress, PendingDownload } from '../context/DownloadContext';
import { usePlayback } from '../context/PlaybackContext'; // For playing completed items
import { getLibraryItems, removeLibraryItem as removeLibraryItemMeta } from '../services/libraryStorageService';
import { DownloadedMediaItem } from '../types';
import Icon from '../components/ui/Icon';
// @ts-ignore
import RNFS from 'react-native-fs'; // For delete functionality

type DownloadsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Downloads'>;
interface Props { navigation: DownloadsScreenNavigationProp; }

// Combined type for display list
type UnifiedDownloadListItem =
  | (ActiveDownloadProgress & { type: 'active'; key: string; })
  | (PendingDownload & { type: 'queued'; })
  | (DownloadedMediaItem & { type: 'completed'; });


const DownloadsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { activeDownloads, downloadQueue, cancelDownload, clearCompletedOrErroredDownload } = useDownload();
  const playback = usePlayback(); // For playing completed items

  const [displayItems, setDisplayItems] = useState<UnifiedDownloadListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllDownloads = useCallback(async () => {
    setIsLoading(true);
    const libraryMetaItems = await getLibraryItems();
    const activeDLsArray = Object.values(activeDownloads);
    const queuedDLsArray = [...downloadQueue];

    let combined: UnifiedDownloadListItem[] = [];
    const processedKeysForCompleted = new Set<string>(); // To avoid showing a completed item if it's also somehow active

    // Add active and queued items first
    queuedDLsArray.forEach(item => {
      combined.push({ ...item, type: 'queued' });
      processedKeysForCompleted.add(item.key); // item.key is composite videoId_format_quality
    });
    activeDLsArray.forEach(item => {
      // item.itemMetadata.id is the composite key
      if (item.itemMetadata && !processedKeysForCompleted.has(item.itemMetadata.id) && item.status !== 'completed') {
        combined.push({ ...item, type: 'active', key: item.itemMetadata.id });
        processedKeysForCompleted.add(item.itemMetadata.id);
      } else if (item.itemMetadata && item.status === 'completed' && !processedKeysForCompleted.has(item.itemMetadata.id)) {
         // If an active download just completed, it might be here. We prefer the libraryStorage version if available.
         // But add it if not yet in libraryMetaItems (e.g., library not refreshed yet)
         // This logic can be complex, libraryStorageService should be source of truth for 'completed' long-term
         // For now, let's assume activeDownloads 'completed' are session-only visual cues.
         // The libraryStorageService will be the main source for the "Completed" section.
      }
    });

    // Add completed items from library storage, ensuring no overlap with active/queued being displayed
    libraryMetaItems.forEach(libItem => {
      if (!processedKeysForCompleted.has(libItem.id)) { // libItem.id is composite videoId_format_quality
        combined.push({ ...libItem, type: 'completed' });
      }
    });

    // Sort: Queued -> Downloading -> Error/Cancelled -> Completed (by date)
    combined.sort((a, b) => {
        const getOrder = (status: string | undefined) => {
            if (status === 'queued') return 1;
            if (status === 'downloading') return 2;
            if (status === 'error' || status === 'cancelled') return 3;
            if (status === 'completed' || a.type === 'completed') return 4; // type 'completed' for library items
            return 5; // Should not happen
        };
        const orderA = getOrder(a.type === 'active' ? a.status : a.type);
        const orderB = getOrder(b.type === 'active' ? b.status : b.type);
        if (orderA !== orderB) return orderA - orderB;
        // For completed, sort by date
        if (a.type === 'completed' && b.type === 'completed') {
            return new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime();
        }
        if (a.type === 'queued' && b.type === 'queued') return a.addedToQueueAt - b.addedToQueueAt;
        return 0;
    });

    setDisplayItems(combined);
    setIsLoading(false);
  }, [activeDownloads, downloadQueue]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { loadAllDownloads(); });
    loadAllDownloads(); // Initial load
    return unsubscribe;
  }, [navigation, loadAllDownloads]);

  const handlePlayItem = (item: DownloadedMediaItem) => {
    playback.playTrack(item);
    navigation.navigate('Player', { track: item, isPlaying: true });
  };

  const handleDelete = async (item: UnifiedDownloadListItem) => {
    const itemId = item.type === 'active' || item.type === 'queued' ? item.key : item.id;
    const itemTitle = (item.type === 'active' || item.type === 'queued' ? item.itemMetadata?.title : item.title) || 'this item';
    const itemFilePath = item.type === 'completed' ? item.filePath : (item.type === 'active' && item.status === 'completed' ? item.filePath : undefined);

    Alert.alert('Confirm Deletion', `Are you sure you want to remove "${itemTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'destructive', onPress: async () => {
            if (playback.currentTrack?.id === itemId || playback.currentTrack?.videoId === (item.type !== 'completed' ? item.itemMetadata?.videoId : item.videoId) ) {
                playback.clearPlayer();
            }
            if (item.type === 'active' && (item.status === 'downloading' || item.status === 'queued')) {
                await cancelDownload(itemId);
            } else if (item.type === 'active' && (item.status === 'error' || item.status === 'cancelled' || item.status === 'completed')) {
                clearCompletedOrErroredDownload(itemId); // Clear from active session view
            }
            // For completed items (from library or just finished in activeDownloads), delete file and meta
            if (item.type === 'completed' || (item.type === 'active' && item.status === 'completed')) {
                if (itemFilePath) {
                    try { await RNFS.unlink(itemFilePath); } catch (e) { console.error('Error deleting file:', e); }
                }
                await removeLibraryItemMeta(itemId); // Remove from AsyncStorage using composite ID
            }
            loadAllDownloads(); // Refresh list
            Alert.alert('Removed', `"${itemTitle}" removed.`);
        }}
      ]
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundPrimary, padding: theme.spacing.md },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.backgroundPrimary },
    title: { fontSize: theme.typography.fontSize.h1, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.md, fontFamily: theme.typography.fontFamily.primary },
    emptyText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.xl, fontFamily: theme.typography.fontFamily.primary },
    itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.xs, backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm },
    thumbnail: { width: 50, height: 50, borderRadius: theme.borderRadius.sm, marginRight: theme.spacing.sm },
    itemInfo: { flex: 1, justifyContent: 'center' },
    itemTitle: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textPrimary, fontWeight: '500', fontFamily: theme.typography.fontFamily.primary },
    itemStatusText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.primary },
    itemProgressText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.accentSecondary, fontFamily: theme.typography.fontFamily.primary },
    itemErrorText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.error, fontFamily: theme.typography.fontFamily.primary },
    itemProgressBarOuter: { height: 6, backgroundColor: theme.colors.backgroundTertiary, borderRadius: 3, overflow: 'hidden', marginTop: theme.spacing.xs/2 },
    itemProgressBarInner: { height: '100%', backgroundColor: theme.colors.accentSecondary, borderRadius: 3 },
    actionButton: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, marginLeft: theme.spacing.sm, minWidth: 60, alignItems: 'center' },
    cancelButton: { backgroundColor: theme.colors.error },
    clearButton: { backgroundColor: theme.colors.textMuted },
    viewButton: { backgroundColor: theme.colors.accentPrimary },
    buttonText: { color: theme.colors.white, fontSize: theme.typography.fontSize.caption, fontWeight: 'bold', fontFamily: theme.typography.fontFamily.primary },
  });

  const renderItem = ({ item }: { item: UnifiedDownloadListItem }) => {
    const metadata = item.type === 'active' ? item.itemMetadata : (item.type === 'queued' ? item.track : item);
    const status = item.type === 'active' ? item.status : item.type;
    const progress = item.type === 'active' ? item.progress : 0;
    const error = item.type === 'active' ? item.error : undefined;
    const itemKey = item.type === 'active' || item.type === 'queued' ? item.key : item.id; // Use item.id for completed

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: metadata.thumbnail || 'https://via.placeholder.com/50' }} style={styles.thumbnail} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{metadata.title}</Text>
          {/* Status Display Logic */}
          {status === 'queued' && <Text style={styles.itemStatusText}>Queued...</Text>}
          {status === 'downloading' && (<><Text style={styles.itemProgressText}>Downloading: {progress.toFixed(0)}%</Text><View style={styles.itemProgressBarOuter}><View style={[styles.itemProgressBarInner, {width: `${progress}%`}]} /></View></>)}
          {status === 'error' && <Text style={styles.itemErrorText}>Error: {error || 'Unknown'}</Text>}
          {status === 'completed' && <Text style={[styles.itemStatusText, {color: theme.colors.accentPrimary}]}>Downloaded</Text>}
          {status === 'cancelled' && <Text style={styles.itemStatusText}>Cancelled</Text>}
        </View>
        <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
            {(status === 'queued' || status === 'downloading') && (
                <TouchableOpacity onPress={() => cancelDownload(itemKey)} style={[styles.actionButton, styles.cancelButton]}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
            )}
            {(status === 'error' || status === 'cancelled') && (
                <TouchableOpacity onPress={() => clearCompletedOrErroredDownload(itemKey)} style={[styles.actionButton, styles.clearButton]}><Text style={styles.buttonText}>Clear</Text></TouchableOpacity>
            )}
            {status === 'completed' && item.type === 'completed' && ( // Only show Play for actual completed library items
                 <>
                    <TouchableOpacity onPress={() => handlePlayItem(item)} style={[styles.actionButton, styles.viewButton, {marginBottom: theme.spacing.xs}]}><Text style={styles.buttonText}>Play</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionButton, styles.cancelButton]}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>
                 </>
            )}
             {status === 'completed' && item.type === 'active' && ( // Just finished in this session
                 <TouchableOpacity onPress={() => { clearCompletedOrErroredDownload(itemKey); navigation.navigate('Library');}} style={[styles.actionButton, styles.viewButton]}><Text style={styles.buttonText}>View</Text></TouchableOpacity>
            )}
        </View>
      </View>
    );
  };

  if (isLoading) { return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.accentPrimary} /></View>; }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Downloads</Text>
      {itemsToDisplay.length === 0 ? (
        <Text style={styles.emptyText}>No active, queued, or completed downloads.</Text>
      ) : (
        <FlatList data={itemsToDisplay} renderItem={renderItem} keyExtractor={(item, index) => (item.type === 'active' || item.type === 'queued' ? item.key : item.id) + index.toString()} />
      )}
    </View>
  );
};
export default DownloadsScreen;
