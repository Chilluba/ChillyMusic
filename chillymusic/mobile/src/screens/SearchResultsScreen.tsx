import React, { useState, useEffect /* Removed useRef */ } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
// Removed Video import as it's now in PlaybackContext
// @ts-ignore
import RNFS from 'react-native-fs';

import { RootStackParamList } from '../navigation/types';
import { SearchResult, MediaInfo, DownloadedMediaItem } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { useAppTheme } from '../context/ThemeContext'; // Import AppTheme
import { usePlayback } from '../context/PlaybackContext'; // Import PlaybackContext
import { fetchMediaInfo, fetchDownloadLink } from '../services/apiService'; // DownloadUrlResponse removed as it's internal to apiService
import { saveLibraryItem } from '../services/libraryStorageService';
import Icon from '../components/ui/Icon';
import DownloadOptionsModal, { DownloadOption } from '../components/modals/DownloadOptionsModal';

type SearchResultsScreenRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type SearchResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchResults'>;

interface Props {
  route: SearchResultsScreenRouteProp;
  navigation: SearchResultsScreenNavigationProp;
}

// PlaybackProgress interface is now in PlaybackContext via PlaybackProgressState

const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { results, query } = route.params;
  const { theme } = useAppTheme();
  const playback = usePlayback(); // Use PlaybackContext

  // Local state for this screen (download modal, download progress) remains
  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
  const [trackForDownload, setTrackForDownload] = useState<SearchResult | null>(null);
  const [mediaInfoForDownload, setMediaInfoForDownload] = useState<MediaInfo | null>(null);
  const [isLoadingDownloadOptions, setIsLoadingDownloadOptions] = useState(false);
  const [activeDownloads, setActiveDownloads] = useState<{[key: string]: {progress: number, jobId?: number, error?: string, path?: string}}>({});

  // REMOVED: selectedTrackForPlayback, streamUrl, isPlaying, isLoadingMediaForTrackId, playbackError, playbackProgress, videoPlayerRef

  // Download related functions remain the same
  const openDownloadOptions = async (track: SearchResult) => { /* ... existing implementation ... */
    setTrackForDownload(track);
    setIsDownloadModalVisible(true);
    if (mediaInfoForDownload?.videoId === track.videoId || playback.currentTrack?.videoId === track.videoId && mediaInfoForDownload?.videoId === playback.currentTrack.videoId) {
      // If mediaInfo for this track is already cached (either for download or from playback context)
      // For playback context, we'd need to expose mediaInfo or selected formats from it if needed by DownloadOptionsModal.
      // For now, assume mediaInfoForDownload is the primary cache for modal.
      setIsLoadingDownloadOptions(false);
      return;
    }
    setIsLoadingDownloadOptions(true);
    try {
      const info = await fetchMediaInfo(track.videoId);
      setMediaInfoForDownload(info);
    } catch (error: any) {
      Alert.alert('Error', 'Could not fetch download options.');
      setMediaInfoForDownload(null);
    } finally {
      setIsLoadingDownloadOptions(false);
    }
  };
  const handleSelectDownloadOption = async (option: DownloadOption) => { /* ... existing implementation, ensure saveLibraryItem is awaited ... */
    setIsDownloadModalVisible(false);
    if (!trackForDownload) return;

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to download files.');
      return;
    }

    const currentTrack = trackForDownload;
    const downloadKey = `${currentTrack.videoId}_${option.format}_${option.quality}`;
    setActiveDownloads(prev => ({ ...prev, [downloadKey]: { progress: 0, error: undefined, path: undefined } }));

    try {
      Alert.alert('Download Starting', `Preparing to download: ${currentTrack.title} (${option.label})`);
      const downloadPayload = { videoId: currentTrack.videoId, format: option.format, quality: option.quality };
      const { downloadUrl, fileName: suggestedFileName } = await fetchDownloadLink(downloadPayload);
      const safeTitle = currentTrack.title.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
      const extension = option.format === 'mp3' ? 'mp3' : 'mp4';
      const fileName = suggestedFileName || `${safeTitle}_${option.quality}.${extension}`;
      const destPath = `${Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath}/${fileName}`;

      const download = RNFS.downloadFile({
        fromUrl: downloadUrl, toFile: destPath, background: true, progressDivider: 10,
        begin: (res) => setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], jobId: res.jobId, progress: 0 }})),
        progress: (res) => setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], progress: (res.bytesWritten / res.contentLength) * 100 }})),
      });
      setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], jobId: download.jobId } }));
      const result = await download.promise;

      if (result.statusCode === 200) {
        Alert.alert('Download Complete', `${currentTrack.title} downloaded successfully to ${destPath}!`);
        setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], progress: 100, path: destPath } }));
        const libraryItemData: DownloadedMediaItem = {
          id: `${currentTrack.videoId}_${option.format}_${option.quality}`,
          videoId: currentTrack.videoId, title: currentTrack.title, channel: currentTrack.channel,
          filePath: destPath, thumbnail: currentTrack.thumbnail, downloadedAt: new Date().toISOString(),
          format: option.format, quality: option.quality, duration: mediaInfoForDownload?.duration,
        };
        await saveLibraryItem(libraryItemData);
      } else { throw new Error(`Download failed: Status ${result.statusCode}`); }
    } catch (error: any) {
      Alert.alert('Download Error', `Could not download ${currentTrack.title}: ${error.message}`);
      setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], error: error.message, progress: -1 } }));
    }
  };
  const requestStoragePermission = async (): Promise<boolean> => { /* ... existing ... */
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          { title: 'Storage Permission', message: 'App needs access to your storage to download files.', buttonPositive: 'OK', },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) { console.warn(err); return false; }
    } return true;
  };

  // REMOVED: onVideoLoad, onVideoProgress, onVideoError, onVideoEnd (handled by context)

  if (!results) { /* ... loading/empty states ... */ }
  if (results.length === 0 && query) { /* ... */ }

  const renderMusicCard = ({ item }: { item: SearchResult }) => {
    const isCurrentlyPlayingItem = playback.currentTrack?.videoId === item.videoId && playback.isPlaying;
    const isLoadingItemPlayback = playback.isLoading && playback.currentTrack?.videoId === item.videoId;
    const downloadKeyPrefix = `${item.videoId}_`;
    const currentDownloadStatus = Object.entries(activeDownloads).find(([key]) => key.startsWith(downloadKeyPrefix))?.[1];

    return (
      <View>
        <MusicCard
          item={item}
          onPlayPause={() => playback.playTrack(item)} // Use context's playTrack
          isPlaying={isCurrentlyPlayingItem}
          isLoading={isLoadingItemPlayback}
          onDownloadMp3={() => openDownloadOptions(item)}
        />
        {currentDownloadStatus && ( /* ... download status display ... */ )}
      </View>
    );
  };

  const progressPercent = playback.progress.seekableDuration > 0
    ? (playback.progress.currentTime / playback.progress.seekableDuration) * 100
    : 0;

  const styles = StyleSheet.create({ /* Styles use theme from useAppTheme() */
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
    emptyText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.backgroundPrimary },
    goBackButton: { backgroundColor: theme.colors.accentPrimary, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.sm, marginTop: theme.spacing.md, },
    goBackButtonText: { color: theme.colors.white, fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.medium as any, fontFamily: theme.typography.fontFamily.primary },
    downloadStatusContainer: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, backgroundColor: theme.colors.backgroundTertiary, marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm, borderRadius: theme.borderRadius.sm, },
    downloadProgressText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.accentSecondary, fontFamily: theme.typography.fontFamily.primary },
    downloadCompleteText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.accentPrimary, fontWeight: theme.typography.fontWeight.bold as any, fontFamily: theme.typography.fontFamily.primary },
    errorText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.error, fontFamily: theme.typography.fontFamily.primary },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        renderItem={renderMusicCard}
        keyExtractor={(item) => item.id + item.videoId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Mini Player UI using PlaybackContext */}
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
                        {playback.isLoading && playback.currentTrack?.videoId === playback.currentTrack.videoId ? ( // check if loading THIS track
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

      <DownloadOptionsModal
        visible={isDownloadModalVisible}
        mediaInfo={mediaInfoForDownload}
        isLoading={isLoadingDownloadOptions}
        onClose={() => { setIsDownloadModalVisible(false); setTrackForDownload(null);}}
        onSelectOption={handleSelectDownloadOption}
      />
    </View>
  );
};

export default SearchResultsScreen;
