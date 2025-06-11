import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
// PermissionsAndroid and Platform are now handled by DownloadContext
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../navigation/types';
import { SearchResult, MediaInfo, DownloadedMediaItem } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { useAppTheme } from '../context/ThemeContext';
import { usePlayback } from '../context/PlaybackContext';
import { useDownload } from '../context/DownloadContext'; // Import useDownload
import { fetchMediaInfo } from '../services/apiService';
// fetchDownloadLink and saveLibraryItem are now used by DownloadContext
import Icon from '../components/ui/Icon';
import DownloadOptionsModal, { DownloadOption } from '../components/modals/DownloadOptionsModal';
// RNFS is now used by DownloadContext

type SearchResultsScreenRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type SearchResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchResults'>;

interface Props {
  route: SearchResultsScreenRouteProp;
  navigation: SearchResultsScreenNavigationProp;
}

const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { results, query } = route.params;
  const { theme } = useAppTheme();
  const playback = usePlayback();
  const downloadContext = useDownload();

  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
  const [trackForDownloadModal, setTrackForDownloadModal] = useState<SearchResult | null>(null);
  const [mediaInfoForModal, setMediaInfoForModal] = useState<MediaInfo | null>(null);
  const [isLoadingDLOptsModal, setIsLoadingDLOptsModal] = useState(false);

  // REMOVED: local activeDownloads state and requestStoragePermission function.

  const openDownloadOptions = async (track: SearchResult) => {
    setTrackForDownloadModal(track);
    setIsDownloadModalVisible(true);
    if (mediaInfoForModal?.videoId === track.videoId) {
      setIsLoadingDLOptsModal(false);
      return;
    }
    setIsLoadingDLOptsModal(true);
    try {
      const info = await fetchMediaInfo(track.videoId);
      setMediaInfoForModal(info);
    } catch (error: any) {
      Alert.alert('Error', 'Could not fetch download options.');
      console.error('SearchResults: Error fetching media info for download options:', error);
      setMediaInfoForModal(null);
    } finally {
      setIsLoadingDLOptsModal(false);
    }
  };

  const handleSelectDownloadOption = async (option: DownloadOption) => {
    setIsDownloadModalVisible(false);
    if (!trackForDownloadModal) return;

    // Call startDownload from DownloadContext
    // Pass mediaInfoForModal which contains full format details and duration for DownloadedMediaItem creation
    await downloadContext.startDownload(trackForDownloadModal, option, mediaInfoForModal);

    setTrackForDownloadModal(null);
    setMediaInfoForModal(null); // Clear after initiating
  };

  // REMOVED: requestStoragePermission (now in DownloadContext)

  if (!results) {
    return ( <View style={[styles.container, styles.centerContent]}><ActivityIndicator size='large' color={theme.colors.accentPrimary} /><Text style={styles.emptyText}>Loading results...</Text></View> );
  }
  if (results.length === 0 && query) {
    return ( <View style={[styles.container, styles.centerContent]}><Text style={styles.emptyText}>No results found for "{query}".</Text><TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}><Text style={styles.goBackButtonText}>Try another search</Text></TouchableOpacity></View> );
  }

  const renderMusicCard = ({ item }: { item: SearchResult }) => {
    const isCurrentlyPlayingItem = playback.currentTrack?.videoId === item.videoId && playback.isPlaying;
    const isLoadingItemPlayback = playback.isLoading && playback.currentTrack?.videoId === item.videoId;

    // Find download status from context
    // Construct potential keys or iterate. For now, iterate as keys are composite.
    const activeDownloadEntry = Object.values(downloadContext.activeDownloads).find(
      dl => dl.itemMetadata?.videoId === item.videoId
    );

    return (
      <View>
        <MusicCard
          item={item}
          onPlayPause={() => playback.playTrack(item)}
          isPlaying={isCurrentlyPlayingItem}
          isLoading={isLoadingItemPlayback}
          onDownloadMp3={() => openDownloadOptions(item)}
        />
        {activeDownloadEntry && (
          <View style={styles.downloadStatusContainer}>
            {activeDownloadEntry.error ? (
              <Text style={[styles.downloadStatusText, { color: theme.colors.error }]}>Download Error</Text>
            ) : activeDownloadEntry.progress < 100 ? (
              <>
                <Text style={[styles.downloadStatusText, { color: theme.colors.accentSecondary }]}>
                  Downloading: {activeDownloadEntry.progress.toFixed(0)}%
                  {activeDownloadEntry.itemMetadata ? ` (${activeDownloadEntry.itemMetadata.format}, ${activeDownloadEntry.itemMetadata.quality})` : ''}
                </Text>
                <View style={styles.itemProgressBarOuter}>
                  <View style={[styles.itemProgressBarInner, { width: `${activeDownloadEntry.progress}%` }]} />
                </View>
              </>
            ) : ( // progress === 100
              <Text style={[styles.downloadStatusText, { color: theme.colors.accentPrimary }]}>
                Downloaded {activeDownloadEntry.itemMetadata ? `(${activeDownloadEntry.itemMetadata.format} - ${activeDownloadEntry.itemMetadata.quality})` : ''}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const progressPercent = playback.progress.seekableDuration > 0
    ? (playback.progress.currentTime / playback.progress.seekableDuration) * 100
    : 0;

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
    emptyText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.md },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.backgroundPrimary },
    goBackButton: { backgroundColor: theme.colors.accentPrimary, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.sm, marginTop: theme.spacing.md, },
    goBackButtonText: { color: theme.colors.white, fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.medium as any, fontFamily: theme.typography.fontFamily.primary },
    downloadStatusContainer: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, backgroundColor: theme.colors.backgroundTertiary, marginTop: -theme.spacing.sm + theme.spacing.xs, marginBottom: theme.spacing.sm, borderRadius: theme.borderRadius.sm, },
    downloadStatusText: { fontSize: theme.typography.fontSize.caption, marginBottom: theme.spacing.xs / 2, fontFamily: theme.typography.fontFamily.primary },
    itemProgressBarOuter: { height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden', }, // Changed to border for better contrast
    itemProgressBarInner: { height: '100%', backgroundColor: theme.colors.accentSecondary, borderRadius: 3, },
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

      {playback.currentTrack && (
        <TouchableOpacity
            style={styles.miniPlayerTouchableWrapper}
            onPress={() => navigation.navigate('Player')}
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
                        {(playback.isLoading && playback.currentTrack?.videoId === playback.currentTrack.videoId) ?
                          <ActivityIndicator size='small' color={theme.colors.textPrimary} />
                         : <Icon name={playback.isPlaying ? 'Pause' : 'Play'} size={28} color={theme.colors.textPrimary} />
                        }
                    </TouchableOpacity>
                </View>
                <View style={styles.progressBarContainerMini}>
                    <View style={[styles.progressBarMini, { width: `${progressPercent}%` }]} />
                </View>
            </View>
        </TouchableOpacity>
      )}

      <DownloadOptionsModal
        visible={isDownloadModalVisible}
        mediaInfo={mediaInfoForModal}
        isLoading={isLoadingDLOptsModal}
        onClose={() => { setIsDownloadModalVisible(false); setTrackForDownloadModal(null); setMediaInfoForModal(null);}}
        onSelectOption={handleSelectDownloadOption}
      />
    </View>
  );
};

export default SearchResultsScreen;
