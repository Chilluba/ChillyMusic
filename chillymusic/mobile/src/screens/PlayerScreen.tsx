import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { usePlayback } from '../context/PlaybackContext';
import { useDownload } from '../context/DownloadContext'; // Import useDownload
import Icon from '../components/ui/Icon';
import Slider from '@react-native-community/slider';
import DownloadOptionsModal, { DownloadOption } from '../components/modals/DownloadOptionsModal';
import { fetchMediaInfo } from '../services/apiService';
import { MediaInfo, PlayerScreenTrack } from '../navigation/types'; // PlayerScreenTrack used by playback context

const PlayerScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const playback = usePlayback();
  const downloadContext = useDownload(); // Use DownloadContext

  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
  const [mediaInfoForDownloadOpts, setMediaInfoForDownloadOpts] = useState<MediaInfo | null>(null);
  const [isLoadingDownloadOptions, setIsLoadingDownloadOptions] = useState(false);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) { return '0:00'; }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const openDownloadOptionsForCurrentTrack = async () => {
    if (!playback.currentTrack) {
      Alert.alert('Error', 'No track selected to download.');
      return;
    }
    setIsDownloadModalVisible(true);
    if (mediaInfoForDownloadOpts?.videoId === playback.currentTrack.videoId) {
        setIsLoadingDownloadOptions(false);
        return;
    }
    setIsLoadingDownloadOptions(true);
    try {
      const info = await fetchMediaInfo(playback.currentTrack.videoId);
      setMediaInfoForDownloadOpts(info);
    } catch (error: any) {
      Alert.alert('Error', 'Could not fetch download options.');
      console.error('PlayerScreen: Error fetching media info for download options:', error);
      setMediaInfoForDownloadOpts(null);
    } finally {
      setIsLoadingDownloadOptions(false);
    }
  };

  const handleSelectDownloadOption = async (option: DownloadOption) => {
    setIsDownloadModalVisible(false);
    if (!playback.currentTrack) return;

    console.log(`PlayerScreen: Download selected for ${playback.currentTrack.title}: ${option.label}`);
    // Use DownloadContext to start the download
    await downloadContext.startDownload(playback.currentTrack, option, mediaInfoForDownloadOpts);

    // setMediaInfoForDownloadOpts(null); // Clear after initiating, or keep for re-opening modal
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundPrimary },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.backgroundPrimary },
    emptyText: { fontSize: theme.typography.fontSize.h2, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.primary },
    errorText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.error, textAlign: 'center', padding: theme.spacing.md, fontFamily: theme.typography.fontFamily.primary },
    contentContainer: { flexGrow: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xl, justifyContent: 'space-between' },
    albumArtContainer: { alignItems: 'center', marginVertical: theme.spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8, },
    albumArt: { width: 300, height: 300, borderRadius: theme.borderRadius.lg, },
    trackInfoContainer: { alignItems: 'center', marginVertical: theme.spacing.md, paddingHorizontal:theme.spacing.sm },
    title: { fontSize: theme.typography.fontSize.h1, fontWeight: theme.typography.fontWeight.bold as any, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: theme.spacing.xs, fontFamily: theme.typography.fontFamily.primary },
    artist: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textSecondary, textAlign: 'center', fontFamily: theme.typography.fontFamily.primary },
    sliderContainer: { marginVertical: theme.spacing.md, paddingHorizontal: theme.spacing.sm },
    sliderComponent: { width: '100%', height: 40 },
    timeLabelsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs, paddingHorizontal: theme.spacing.xs },
    timeLabel: { fontSize: theme.typography.fontSize.caption, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.primary },
    controlsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: theme.spacing.md, },
    controlButton: { padding: theme.spacing.sm, },
    playPauseButton: { backgroundColor: theme.colors.accentPrimary, borderRadius: 50, width: 70, height: 70, justifyContent: 'center', alignItems: 'center', },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: theme.spacing.md, marginTop: theme.spacing.sm, borderTopWidth:1, borderTopColor: theme.colors.border },
    actionButtonSmall: { padding: theme.spacing.sm, alignItems: 'center', minWidth: 60 }, // Added minWidth for better touch target
    downloadProgressText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.accentSecondary, marginTop: theme.spacing.xs / 2, textAlign: 'center' }
  });

  if (playback.isLoading && !playback.currentTrack && !playback.error) {
    return <View style={styles.centered}><ActivityIndicator size='large' color={theme.colors.accentPrimary} /><Text style={[styles.emptyText, {marginTop: theme.spacing.md}]}>Loading track...</Text></View>;
  }
  if (!playback.currentTrack) {
    return <View style={styles.centered}><Text style={styles.emptyText}>Nothing selected to play.</Text></View>;
  }
  // Error display for playback error related to current track, not for full screen "nothing selected"
  const currentTrackPlaybackError = playback.error && playback.currentTrack;


  const currentTrack = playback.currentTrack;
  const albumArtUrl = currentTrack.thumbnail || 'https://via.placeholder.com/300';
  const displayTitle = currentTrack.title;
  const displayArtist = 'channel' in currentTrack ? currentTrack.channel : ((currentTrack as any).artist || 'Unknown Artist');
  const trackDuration = playback.progress.seekableDuration;
  const currentTime = playback.progress.currentTime;

  // Find download status for the current track
  let currentTrackDownloadDisplay: React.ReactNode = null;
  if (currentTrack) {
    const activeDownloadEntry = Object.values(downloadContext.activeDownloads).find(
      dl => dl.itemMetadata?.videoId === currentTrack.videoId
    );
    if (activeDownloadEntry) {
      if (activeDownloadEntry.error) {
        currentTrackDownloadDisplay = <Text style={[styles.downloadProgressText, { color: theme.colors.error }]}>Download Error</Text>;
      } else if (activeDownloadEntry.progress < 100) {
        currentTrackDownloadDisplay = <Text style={styles.downloadProgressText}>{activeDownloadEntry.progress.toFixed(0)}%</Text>;
      } else if (activeDownloadEntry.progress === 100) {
        currentTrackDownloadDisplay = <Icon name="Check" size={20} color={theme.colors.accentPrimary} />; // Placeholder, add Check icon
      }
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.albumArtContainer}><Image source={{ uri: albumArtUrl }} style={styles.albumArt} /></View>
      <View style={styles.trackInfoContainer}>
        <Text style={styles.title} numberOfLines={2}>{displayTitle}</Text>
        <Text style={styles.artist} numberOfLines={1}>{displayArtist}</Text>
        {currentTrackPlaybackError && <Text style={[styles.errorText, {fontSize: theme.typography.fontSize.caption}]}>Error: {playback.error}</Text>}
      </View>
      <View style={styles.sliderContainer}>
        <Slider style={styles.sliderComponent} minimumValue={0} maximumValue={trackDuration > 0 ? trackDuration : 1} value={currentTime} onSlidingComplete={(value) => playback.seekTo(value)} minimumTrackTintColor={theme.colors.accentPrimary} maximumTrackTintColor={theme.colors.textMuted} thumbTintColor={theme.colors.accentPrimary} disabled={playback.isLoading || trackDuration === 0 || !!playback.error} />
        <View style={styles.timeLabelsContainer}><Text style={styles.timeLabel}>{formatTime(currentTime)}</Text><Text style={styles.timeLabel}>{formatTime(trackDuration)}</Text></View>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={() => { /* playback.skipPrevious() */ }} style={styles.controlButton} disabled={true}>
          <Icon name="SkipBack" size={32} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={playback.togglePlayPause} style={[styles.controlButton, styles.playPauseButton, (playback.isLoading || !currentTrack || trackDuration === 0 || !!playback.error) && {backgroundColor: theme.colors.textMuted}]} disabled={playback.isLoading || !currentTrack || trackDuration === 0 || !!playback.error}>
          {(playback.isLoading && currentTrack) ? <ActivityIndicator size='large' color={theme.colors.white} /> : <Icon name={playback.isPlaying ? 'Pause' : 'Play'} size={40} color={theme.colors.white} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { /* playback.skipNext() */ }} style={styles.controlButton} disabled={true}>
          <Icon name="SkipForward" size={32} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButtonSmall} onPress={() => Alert.alert('Repeat', 'Repeat functionality TBD')}>
          <Icon name="Repeat" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.actionButtonSmall}>
            <TouchableOpacity onPress={openDownloadOptionsForCurrentTrack}
                              disabled={!currentTrack || isLoadingDownloadOptions || (!!currentTrackDownloadDisplay && currentTrackDownloadStatus !== 'Error' && currentTrackDownloadStatus !== 'Downloaded' )}>
            {isLoadingDownloadOptions ? <ActivityIndicator size="small" color={theme.colors.accentPrimary}/> :
             currentTrackDownloadDisplay || <Icon name="Download" size={24} color={theme.colors.textSecondary} />
            }
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButtonSmall} onPress={() => Alert.alert('Favorite', 'Favorite functionality TBD')}>
          <Icon name="Heart" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSmall} onPress={() => Alert.alert('Add to Playlist', 'Playlist functionality TBD')}>
          <Icon name="PlaylistAdd" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <DownloadOptionsModal
        visible={isDownloadModalVisible}
        mediaInfo={mediaInfoForDownloadOpts}
        isLoading={isLoadingDownloadOptions}
        onClose={() => { setIsDownloadModalVisible(false); /* setMediaInfoForDownloadOpts(null); */ }}
        onSelectOption={handleSelectDownloadOption}
      />
    </ScrollView>
  );
};

export default PlayerScreen;
