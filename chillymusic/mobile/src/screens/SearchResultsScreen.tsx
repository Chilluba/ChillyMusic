import React, { useState, useEffect } from 'react';
// ... other imports from SearchResultsScreen ...
import { useDownload, ActiveDownloadProgress } from '../context/DownloadContext';
import Icon from '../components/ui/Icon'; // Make sure Icon is imported

type SearchResultsScreenRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type SearchResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchResults'>;
interface Props { route: SearchResultsScreenRouteProp; navigation: SearchResultsScreenNavigationProp; }


const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { theme } = useAppTheme();
  const playback = usePlayback();
  const downloadContext = useDownload();
  // ... (state for download modal) ...

  const openDownloadOptions = async (track: SearchResult) => { /* ... */ };
  const handleSelectDownloadOption = async (option: DownloadOption) => { /* ... */ }; // Uses downloadContext.startDownload

  const renderMusicCard = ({ item }: { item: SearchResult }) => {
    const isCurrentlyPlayingItem = playback.currentTrack?.videoId === item.videoId && playback.isPlaying;
    const isLoadingItemPlayback = playback.isLoading && playback.currentTrack?.videoId === item.videoId;

    // Find download status from context. This logic might need refinement based on how keys are stored/generated.
    // Assuming downloadKey is videoId_format_quality, but for display we might only know videoId from `item`.
    // We need to find any download associated with item.videoId.
    const activeDownloadEntry = Object.values(downloadContext.activeDownloads).find(
      dl => dl.itemMetadata?.videoId === item.videoId
    );
    const downloadKey = activeDownloadEntry?.itemMetadata?.id; // Get the actual key if entry found

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
            {/* ... (existing status display: Queued, Downloading, Error, Completed, Cancelled) ... */}
            {(activeDownloadEntry.status === 'queued' || activeDownloadEntry.status === 'downloading') && downloadKey && (
              <TouchableOpacity onPress={() => downloadContext.cancelDownload(downloadKey)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    /* ... existing styles ... */
    downloadStatusContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, marginTop: -theme.spacing.sm + theme.spacing.xs, },
    downloadStatusText: { fontSize: theme.typography.fontSize.caption, flex: 1 }, // Added flex:1 to allow button to be on side
    itemProgressBarOuter: { /* ... */ }, itemProgressBarInner: { /* ... */ },
    cancelButton: { marginLeft: theme.spacing.sm, paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, backgroundColor: theme.colors.error, borderRadius: theme.borderRadius.sm },
    cancelButtonText: { color: theme.colors.white, fontSize: theme.typography.fontSize.caption, fontWeight: '500' }
  });

  return ( <View style={styles.container}> {/* ... FlatList, MiniPlayer, DownloadOptionsModal ... */} </View> );
};
export default SearchResultsScreen;
