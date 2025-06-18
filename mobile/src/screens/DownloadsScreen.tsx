import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { RootState, AppDispatch } from '../store';
import {
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  DownloadedMediaItem,
  selectSortedDownloads,
  selectTotalDownloadsSize,
  removeDownloadedItem, // Now the synchronous action
  setDownloadsSortPreference,
  SortKeyDownloads,
  SortOrderDownloads,
} from '../store/downloadsSlice';
import FilterOptionModal, { FilterOption } from '../components/search/FilterOptionModal';
// import { deleteLocalFile } from '../services/fileSystem'; // No longer directly used here
// import { deleteLocalFile } from '../services/fileSystem'; // No longer directly used here - already removed
import { handleDeleteItemService } from '../services/downloadManagerService'; // Import the new service
import { setCurrentTrack, PlayerTrackInfo } from '../store/playerSlice'; // Import setCurrentTrack and PlayerTrackInfo

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface DownloadedItemRowProps {
  item: DownloadedMediaItem;
  onPlay: (item: DownloadedMediaItem) => void;
  onDelete: (id: string, title: string, filePath: string) => void; // filePath added
  isDeletingThisItem: boolean; // To show loading on this specific item
}

const DownloadedItemRow: React.FC<DownloadedItemRowProps> = ({ item, onPlay, onDelete, isDeletingThisItem }) => (
  <View style={styles.itemContainer}>
    {item.thumbnail ? <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} /> : <View style={styles.thumbnail} />}
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.itemArtist} numberOfLines={1}>{item.artist}</Text>
      <Text style={styles.itemMeta} numberOfLines={1}>
        {formatBytes(item.format.filesize)} • {new Date(item.downloadedAt).toLocaleDateString()}
        {item.duration ? ` • ${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : ''}
      </Text>
    </View>
    <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => onPlay(item)} style={styles.playButton} disabled={isDeletingThisItem}>
            <Text style={styles.actionText}>▶️</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => onDelete(item.id, item.title, item.filePath)}
            style={styles.deleteButton}
            disabled={isDeletingThisItem}
        >
            {isDeletingThisItem ? <ActivityIndicator size="small" color="#F85149" /> : <Text style={styles.actionText}>🗑️</Text>}
        </TouchableOpacity>
    </View>
  </View>
);

const sortKeyOptions: FilterOption[] = [
    { label: 'Date Downloaded', value: 'downloadedAt' },
    { label: 'Title', value: 'title' },
    { label: 'Artist', value: 'artist' },
    { label: 'File Size', value: 'filesize' },
];

const DownloadsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sortedDownloads = useSelector(selectSortedDownloads);
  const totalSize = useSelector(selectTotalDownloadsSize);
  const currentSortBy = useSelector((state: RootState) => state.downloads.sortBy);
  const currentSortOrder = useSelector((state: RootState) => state.downloads.sortOrder);

  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // Track deleting item ID

  const handlePlayItem = (item: DownloadedMediaItem) => {
    const fileUri = `file://${item.filePath}`;
    console.log('Attempting to play downloaded item:', item.title, fileUri);

    const trackInfo: PlayerTrackInfo = {
      id: item.id, // Or item.videoId if more appropriate for player context
      uri: fileUri,
      title: item.title,
      artist: item.artist,
      thumbnail: item.thumbnail,
      duration: item.duration || 0,
      isLocalFile: true,
      // These might not be directly on DownloadedMediaItem, adapt as needed or fetch from songsSlice
      videoId: item.videoId,
      addedAt: new Date().toISOString(), // Placeholder, not directly relevant for playback of downloaded
    };

    dispatch(setCurrentTrack(trackInfo));

    // Simulate navigation
    console.log(`NAVIGATE to PlayerScreen with track: ${JSON.stringify(trackInfo, null, 2)}`);
    // Example: navigation.navigate('PlayerScreen', trackInfo); // If passing params
    navigation.navigate('PlayerScreen'); // PlayerScreen will pick up from Redux state
  };

  // Renamed to handleDeleteItemPress to avoid confusion if we had a handleDeleteItem in a useEffect for example
  const handleDeleteItemPress = async (id: string, title: string, filePath: string) => {
    if (isDeletingId) return; // Prevent concurrent deletions if one is already in progress

    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete "${title}"? This will remove the file from your device.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} }, // User cancelled
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingId(id); // Set loading state for this item
            const success = await handleDeleteItemService(id, filePath, dispatch);
            if (success) {
              Alert.alert('Success', `"${title}" has been deleted.`);
            } else {
              Alert.alert('Error', `Could not delete "${title}". Please try again.`);
            }
            setIsDeletingId(null); // Clear loading state for this item
          }
        },
      ]
    );
  };

  const handleSortSelection = (option: FilterOption) => {
    dispatch(setDownloadsSortPreference({ sortBy: option.value as SortKeyDownloads, sortOrder: currentSortOrder }));
    setSortModalVisible(false);
  };

  const toggleSortOrder = () => {
    dispatch(setDownloadsSortPreference({ sortBy: currentSortBy, sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc' }));
  };

  const currentSortOption = sortKeyOptions.find(opt => opt.value === currentSortBy);

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.totalSizeText}>Total Size: {formatBytes(totalSize)}</Text>
        <View style={styles.sortControls}>
            <TouchableOpacity onPress={() => setSortModalVisible(true)} style={styles.sortButton}>
                <Text style={styles.sortButtonText}>Sort By: {currentSortOption?.label}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
                <Text style={styles.sortButtonText}>{currentSortOrder === 'asc' ? '🔼 Asc' : '🔽 Desc'}</Text>
            </TouchableOpacity>
        </View>
      </View>

      {sortedDownloads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No downloaded media yet.</Text>
          <Text style={styles.emptySubText}>Go find some music and download it!</Text>
        </View>
      ) : (
        <FlatList
          data={sortedDownloads}
          renderItem={({ item }) =>
            <DownloadedItemRow
                item={item}
                onPlay={handlePlayItem}
                onDelete={handleDeleteItemPress} // Use the new handler
                isDeletingThisItem={isDeletingId === item.id}
            />
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          extraData={isDeletingId} // To help FlatList re-render items when deleting state changes
        />
      )}
      <FilterOptionModal
        visible={sortModalVisible}
        title="Sort Downloads By"
        options={sortKeyOptions}
        selectedValue={currentSortBy}
        onSelect={handleSortSelection}
        onClose={() => setSortModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117', // Background Primary
  },
  headerBar: {
    padding: 16, // space-md
    backgroundColor: '#161B22', // Background Secondary
    borderBottomWidth: 1,
    borderBottomColor: '#30363D', // Border
  },
  totalSizeText: {
    fontSize: 14, // Body
    color: '#8B949E', // Text Secondary
    marginBottom: 8, // space-sm
  },
  sortControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortButton: {
    backgroundColor: '#21262D', // Background Tertiary
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6, // radius-sm
  },
  sortButtonText: {
    fontSize: 14,
    color: '#F0F6FC', // Text Primary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#F0F6FC',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#8B949E',
  },
  listContentContainer: {
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, // space-md
    paddingVertical: 12, // space-sm + space-xs
    backgroundColor: '#161B22', // Background Secondary
    marginBottom: 1, // For separation, or use border
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6, // radius-sm
    marginRight: 12, // space-sm + space-xs
    backgroundColor: '#21262D', // Placeholder if no image
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16, // Body Large
    color: '#F0F6FC', // Text Primary
    fontWeight: '600',
  },
  itemArtist: {
    fontSize: 14, // Body
    color: '#8B949E', // Text Secondary
  },
  itemMeta: {
    fontSize: 12, // Caption
    color: '#6E7681', // Text Muted
  },
  itemActions: {
    flexDirection: 'row',
  },
  playButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  actionText: {
      fontSize: 20, // A bit larger for emoji icons
  }
});

export default DownloadsScreen;
