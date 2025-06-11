import React, { useState, useEffect, useCallback } from 'react';
// ... other imports from PlayerScreen ...
import { useDownload, ActiveDownloadProgress } from '../context/DownloadContext';
import Icon from '../components/ui/Icon';
import * as favoritesService from '../services/favoritesService';
import { Alert } from 'react-native'; // Ensure Alert is imported if not already

const PlayerScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const playback = usePlayback();
  const downloadContext = useDownload();
  const [isCurrentTrackFavorite, setIsCurrentTrackFavorite] = useState(false);
  const [isLoadingDownloadOptions, setIsLoadingDownloadOptions] = useState(false); // Assuming this was defined elsewhere or should be
  // ... (state for download modal, e.g. isDownloadModalVisible, selectedTrackForDownload) ...


  const formatTime = (seconds: number): string => { /* ... */ return ''; };
  const openDownloadOptionsForCurrentTrack = async () => {
    if (!currentTrack) return;
    // Logic to show DownloadOptionsModal for currentTrack
    // Potentially set selectedTrackForDownload(currentTrack), setIsDownloadModalVisible(true)
    // This might involve fetching mediaInfo if not already available with currentTrack
    setIsLoadingDownloadOptions(true); // Example
    try {
      // const mediaInfo = await apiService.fetchMediaInfo(currentTrack.videoId);
      // setSelectedTrackForDownload({ ...currentTrack, mediaInfo });
      // setIsDownloadModalVisible(true);
      Alert.alert("Open Download Options", "Logic for opening download options needs to be connected here.");
    } catch (error) {
      Alert.alert("Error", "Could not load download options.");
    } finally {
      setIsLoadingDownloadOptions(false);
    }
  };
  const handleSelectDownloadOption = async (option: DownloadOption) => { /* ... */ }; // Uses downloadContext.startDownload
  const styles = StyleSheet.create({ /* ... existing styles ... */ });

  const currentTrack = playback.currentTrack;

  useEffect(() => {
    if (currentTrack) {
      favoritesService.isFavorite(currentTrack.videoId).then(setIsCurrentTrackFavorite);
    }
  }, [currentTrack]);

  const handleToggleFavorite = useCallback(async () => {
    if (!currentTrack) return;
    try {
      if (isCurrentTrackFavorite) {
        await favoritesService.removeFavorite(currentTrack.videoId);
        setIsCurrentTrackFavorite(false);
        Alert.alert('Unfavorited', `"${currentTrack.title}" removed from favorites.`);
      } else {
        await favoritesService.addFavorite({
          videoId: currentTrack.videoId,
          title: currentTrack.title,
          channel: currentTrack.channel || '',
          thumbnail: currentTrack.thumbnail || currentTrack.artwork || '',
          // duration will be fetched by backend if not passed or can be added if available
        });
        setIsCurrentTrackFavorite(true);
        Alert.alert('Favorited', `"${currentTrack.title}" added to favorites.`);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert('Error', 'Could not update favorites.');
    }
  }, [currentTrack, isCurrentTrackFavorite]);

  if (!currentTrack) { /* ... */ }

  const downloadKeyForCurrentTrack = Object.keys(downloadContext.activeDownloads).find(
    key => downloadContext.activeDownloads[key].itemMetadata?.videoId === currentTrack.videoId
  );
  const downloadForCurrentTrack = downloadKeyForCurrentTrack ? downloadContext.activeDownloads[downloadKeyForCurrentTrack] : null;

  let downloadButtonIconName: string = 'Download';
  let downloadButtonAction = openDownloadOptionsForCurrentTrack;
  let downloadButtonDisabled = !currentTrack || isLoadingDownloadOptions; // from local state
  let downloadStatusText = '';
  let iconColor = theme.colors.textSecondary;

  if (downloadForCurrentTrack) {
    const status = downloadForCurrentTrack.status;
    if (status === 'queued' || status === 'downloading') {
      downloadButtonAction = () => downloadContext.cancelDownload(downloadForCurrentTrack.itemMetadata!.id);
      downloadButtonIconName = 'Close'; // Use Close icon for cancel
      iconColor = theme.colors.error;
      downloadStatusText = status === 'queued' ? 'Queued' : `${downloadForCurrentTrack.progress.toFixed(0)}%`;
      downloadButtonDisabled = false;
    } else if (status === 'completed') {
      downloadButtonIconName = 'Check';
      iconColor = theme.colors.accentPrimary;
      downloadButtonDisabled = true;
    } else if (status === 'error') {
      downloadButtonIconName = 'Download'; // Or a specific error/retry icon
      iconColor = theme.colors.error;
      downloadStatusText = 'Error';
      // downloadButtonDisabled = false; // Keep true to force going through modal again for new attempt
    } else if (status === 'cancelled') {
        downloadButtonIconName = 'Download';
        iconColor = theme.colors.textMuted;
        downloadStatusText = 'Cancelled';
    }
  }


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ... Album Art, Track Info, Slider, Main Controls ... */}
      <View style={styles.actionsRow}>
        {/* Repeat Button */}
        <TouchableOpacity style={styles.actionButtonSmall} onPress={() => playback.toggleRepeatMode()} disabled={!currentTrack}>
            <Icon
                name={playback.repeatMode === 'off' ? 'Repeat' : playback.repeatMode === 'track' ? 'RepeatOne' : 'Repeat'}
                size={24}
                color={playback.repeatMode !== 'off' ? theme.colors.accentPrimary : theme.colors.textSecondary}
            />
        </TouchableOpacity>

        {/* Download Button (existing logic) */}
        <View style={styles.actionButtonSmall}>
            <TouchableOpacity onPress={downloadButtonAction} disabled={downloadButtonDisabled}>
                {(isLoadingDownloadOptions || (downloadForCurrentTrack?.status === 'downloading' && downloadContext.isLoading)) ?
                  <ActivityIndicator size="small" color={theme.colors.accentSecondary} /> :
                  <Icon name={downloadButtonIconName} size={24} color={iconColor} />
                }
            </TouchableOpacity>
            {downloadStatusText && <Text style={[styles.downloadProgressText, {color: iconColor}]}>{downloadStatusText}</Text>}
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.actionButtonSmall}
          onPress={handleToggleFavorite}
          disabled={!currentTrack}
        >
            <Icon
                name={isCurrentTrackFavorite ? "Heart" : "HeartOutline"}
                size={24}
                color={isCurrentTrackFavorite ? theme.colors.accentPrimary : theme.colors.textSecondary}
            />
        </TouchableOpacity>

        {/* Add to Playlist Button */}
        <TouchableOpacity
          style={styles.actionButtonSmall}
          onPress={() => Alert.alert('Add to Playlist', 'Add to Playlist functionality coming soon!')}
          disabled={!currentTrack}
        >
            <Icon name="PlaylistAdd" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      {/* ... DownloadOptionsModal ... */}
    </ScrollView>
  );
};
export default PlayerScreen;
