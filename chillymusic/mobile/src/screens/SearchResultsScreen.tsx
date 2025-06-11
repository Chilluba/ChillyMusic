import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
// @ts-ignore
import Video, { OnLoadData, OnProgressData, OnErrorData } from 'react-native-video';
// @ts-ignore
import RNFS from 'react-native-fs'; // Import react-native-fs

import { RootStackParamList } from '../navigation/types';
import { SearchResult, MediaInfo, DownloadedMediaItem } from '../types'; // Added DownloadedMediaItem
import MusicCard from '../components/cards/MusicCard';
import { DefaultTheme, Spacing, Typography } from '../theme/theme';
import { fetchMediaInfo, fetchDownloadLink, DownloadUrlResponse } from '../services/apiService';
import { saveLibraryItem } from '../services/libraryStorageService'; // Import saveLibraryItem
import Icon from '../components/ui/Icon';
import DownloadOptionsModal, { DownloadOption } from '../components/modals/DownloadOptionsModal';

type SearchResultsScreenRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type SearchResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchResults'>;

interface Props {
  route: SearchResultsScreenRouteProp;
  navigation: SearchResultsScreenNavigationProp;
}

interface PlaybackProgress {
  currentTime: number;
  seekableDuration: number;
}

const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { results, query } = route.params;
  const [selectedTrackForPlayback, setSelectedTrackForPlayback] = useState<SearchResult | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingMediaForTrackId, setIsLoadingMediaForTrackId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<PlaybackProgress>({ currentTime: 0, seekableDuration: 0 });

  const videoPlayerRef = useRef<Video>(null);

  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
  const [trackForDownload, setTrackForDownload] = useState<SearchResult | null>(null);
  const [mediaInfoForDownload, setMediaInfoForDownload] = useState<MediaInfo | null>(null);
  const [isLoadingDownloadOptions, setIsLoadingDownloadOptions] = useState(false);
  const [activeDownloads, setActiveDownloads] = useState<{[key: string]: {progress: number, jobId?: number, error?: string, path?: string}}>({});

  const handlePlayPause = async (track: SearchResult) => {
    setPlaybackError(null);
    if (selectedTrackForPlayback?.videoId === track.videoId) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedTrackForPlayback(track);
      setIsPlaying(false);
      setIsLoadingMediaForTrackId(track.videoId);
      setStreamUrl(null);
      setPlaybackProgress({ currentTime: 0, seekableDuration: 0 });
      try {
        const info = await fetchMediaInfo(track.videoId);
        if (!mediaInfoForDownload || mediaInfoForDownload.videoId !== info.videoId) {
            setMediaInfoForDownload(info);
        }
        const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || f.audioCodec);
        if (audioFormat?.url) {
          setStreamUrl(audioFormat.url);
          setIsPlaying(true);
        } else {
          setPlaybackError('No suitable audio stream found.');
        }
      } catch (error: any) {
        setPlaybackError(error.message || 'Failed to fetch media details.');
      } finally {
        setIsLoadingMediaForTrackId(null);
      }
    }
  };

  const openDownloadOptions = async (track: SearchResult) => {
    setTrackForDownload(track);
    setIsDownloadModalVisible(true);
    if (mediaInfoForDownload?.videoId === track.videoId) {
      setIsLoadingDownloadOptions(false);
      return;
    }
    if (selectedTrackForPlayback?.videoId === track.videoId && mediaInfoForDownload?.videoId === track.videoId) {
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

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'ChillyMusic Storage Permission',
            message: 'ChillyMusic needs access to your storage to download music.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleSelectDownloadOption = async (option: DownloadOption) => {
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
      const downloadPayload = {
        videoId: currentTrack.videoId,
        format: option.format,
        quality: option.quality,
      };
      const { downloadUrl, fileName: suggestedFileName } = await fetchDownloadLink(downloadPayload);

      const safeTitle = currentTrack.title.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
      const extension = option.format === 'mp3' ? 'mp3' : 'mp4';
      const fileName = suggestedFileName || `${safeTitle}_${option.quality}.${extension}`;

      const destPath = `${Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath}/${fileName}`;

      console.log(`Starting download for ${currentTrack.title} to ${destPath} from ${downloadUrl}`);

      const download = RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: destPath,
        background: true,
        progressDivider: 10,
        begin: (res) => {
          setActiveDownloads(prev => ({
            ...prev,
            [downloadKey]: { ...prev[downloadKey], jobId: res.jobId, progress: 0 }
          }));
        },
        progress: (res) => {
          const progressPercent = (res.bytesWritten / res.contentLength) * 100;
          setActiveDownloads(prev => ({
            ...prev,
            [downloadKey]: { ...prev[downloadKey], progress: progressPercent }
          }));
        },
      });

      setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], jobId: download.jobId } }));
      const result = await download.promise;

      if (result.statusCode === 200) {
        Alert.alert('Download Complete', `${currentTrack.title} downloaded successfully to ${destPath}!`);
        setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], progress: 100, path: destPath } }));

        // *** NEW CODE TO SAVE TO LIBRARY ***
        const libraryItemData: DownloadedMediaItem = {
          id: `${currentTrack.videoId}_${option.format}_${option.quality}`, // Composite ID for library
          videoId: currentTrack.videoId,
          title: currentTrack.title,
          channel: currentTrack.channel,
          filePath: destPath,
          thumbnail: currentTrack.thumbnail,
          downloadedAt: new Date().toISOString(),
          format: option.format,
          quality: option.quality,
          duration: mediaInfoForDownload?.duration,
        };
        await saveLibraryItem(libraryItemData);
        // *** END OF NEW CODE ***

      } else {
        throw new Error(`Download failed: Status ${result.statusCode}`);
      }

    } catch (error: any) {
      Alert.alert('Download Error', `Could not download ${currentTrack.title}: ${error.message}`);
      setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], error: error.message, progress: -1 } }));
    }
    // Not clearing trackForDownload here to allow status to be shown on card
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
    const isCurrentlyPlayingItem = selectedTrackForPlayback?.videoId === item.videoId && isPlaying;
    const isLoadingItemPlayback = isLoadingMediaForTrackId === item.videoId;
    const downloadKeyPrefix = `${item.videoId}_`;
    const currentDownloadStatus = Object.entries(activeDownloads).find(([key]) => key.startsWith(downloadKeyPrefix))?.[1];

    return (
      <View>
        <MusicCard
          item={item}
          onPlayPause={handlePlayPause}
          isPlaying={isCurrentlyPlayingItem}
          isLoading={isLoadingItemPlayback}
          onDownloadMp3={() => openDownloadOptions(item)}
        />
        {currentDownloadStatus && (
          <View style={styles.downloadStatusContainer}>
            {currentDownloadStatus.error && <Text style={styles.errorText}>Download Error: {currentDownloadStatus.error}</Text>}
            {!currentDownloadStatus.error && currentDownloadStatus.progress < 100 &&
              <Text style={styles.downloadProgressText}>Downloading: {currentDownloadStatus.progress.toFixed(0)}%</Text>}
            {!currentDownloadStatus.error && currentDownloadStatus.progress === 100 &&
              <Text style={styles.downloadCompleteText}>Downloaded ({currentDownloadStatus.path?.split('/').pop()})</Text>}
          </View>
        )}
      </View>
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
      {streamUrl && selectedTrackForPlayback && (
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
          progressUpdateInterval={1000}
        />
      )}

      {selectedTrackForPlayback && ( <View style={styles.miniPlayer}>
        <View style={styles.miniPlayerInfoAndButton}>
            <View style={styles.miniPlayerInfo}>
                <Text style={styles.miniPlayerText} numberOfLines={1}>{selectedTrackForPlayback.title}</Text>
                <Text style={styles.miniPlayerArtist} numberOfLines={1}>{selectedTrackForPlayback.channel}</Text>
                {playbackError && isLoadingMediaForTrackId !== selectedTrackForPlayback.videoId && (
                <Text style={styles.miniPlayerError} numberOfLines={1}>Error: {playbackError}</Text>
                )}
            </View>
            <TouchableOpacity onPress={() => handlePlayPause(selectedTrackForPlayback)} style={styles.miniPlayerButton}>
                {isLoadingMediaForTrackId === selectedTrackForPlayback.videoId ? (
                <ActivityIndicator size='small' color={DefaultTheme.colors.textPrimary} />
                ) : (
                <Icon name={isPlaying ? 'Pause' : 'Play'} size={28} color={DefaultTheme.colors.textPrimary} />
                )}
            </TouchableOpacity>
        </View>
        <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
      </View>)}

      <DownloadOptionsModal
        visible={isDownloadModalVisible}
        mediaInfo={mediaInfoForDownload}
        isLoading={isLoadingDownloadOptions}
        onClose={() => { setIsDownloadModalVisible(false); }}
        onSelectOption={handleSelectDownloadOption}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DefaultTheme.colors.backgroundPrimary },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
  listContent: { padding: Spacing.md, paddingBottom: 80 },
  emptyText: { fontSize: Typography.fontSize.bodyLarge, color: DefaultTheme.colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  goBackButton: {
    backgroundColor: DefaultTheme.colors.accentPrimary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  goBackButtonText: {
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
  downloadStatusContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: DefaultTheme.colors.backgroundTertiary,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  downloadProgressText: {
    fontSize: Typography.fontSize.caption,
    color: DefaultTheme.colors.accentSecondary,
  },
  downloadCompleteText: {
    fontSize: Typography.fontSize.caption,
    color: DefaultTheme.colors.accentPrimary,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: Typography.fontSize.caption,
    color: DefaultTheme.colors.error,
    // textAlign: 'center', // Not strictly needed here
  }
});

export default SearchResultsScreen;
