import React, { useState, useEffect } from 'react';
// ... other imports from PlayerScreen ...
import { useDownload, ActiveDownloadProgress } from '../context/DownloadContext';
import Icon from '../components/ui/Icon';

const PlayerScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const playback = usePlayback();
  const downloadContext = useDownload();
  // ... (state for download modal) ...

  const formatTime = (seconds: number): string => { /* ... */ return ''; };
  const openDownloadOptionsForCurrentTrack = async () => { /* ... */ };
  const handleSelectDownloadOption = async (option: DownloadOption) => { /* ... */ }; // Uses downloadContext.startDownload
  const styles = StyleSheet.create({ /* ... existing styles ... */ });

  const currentTrack = playback.currentTrack;
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
        {/* ... Repeat button ... */}
        <View style={styles.actionButtonSmall}>
            <TouchableOpacity onPress={downloadButtonAction} disabled={downloadButtonDisabled}>
                {(isLoadingDownloadOptions || (downloadForCurrentTrack?.status === 'downloading' && downloadContext.isLoading)) ?
                  <ActivityIndicator size="small" color={theme.colors.accentSecondary} /> :
                  <Icon name={downloadButtonIconName} size={24} color={iconColor} />
                }
            </TouchableOpacity>
            {downloadStatusText && <Text style={[styles.downloadProgressText, {color: iconColor}]}>{downloadStatusText}</Text>}
        </View>
        {/* ... Favorite, PlaylistAdd buttons ... */}
      </View>
      {/* ... DownloadOptionsModal ... */}
    </ScrollView>
  );
};
export default PlayerScreen;
