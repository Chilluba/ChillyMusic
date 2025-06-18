import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { selectPlaylistById, removeSongFromPlaylist, deletePlaylist as deletePlaylistAction } from '../store/playlistsSlice';
import { selectSongById, Song } from '../store/songsSlice';
import CreatePlaylistModal from '../components/CreatePlaylistModal'; // Assuming this is the modal component

interface SongItemDisplayProps { // Renamed to avoid conflict with Song type from slice
  song: Song; // Use the Song type from songsSlice
  onPlay: (songId: string) => void;
  onRemove: (songId: string) => void;
}

const SongItemDisplay: React.FC<SongItemDisplayProps> = ({ song, onPlay, onRemove }) => (
  <View style={styles.songCard}>
    {song.thumbnail ? <Image source={{ uri: song.thumbnail }} style={styles.albumArt} /> : <View style={styles.albumArt} /> }
    <View style={styles.songInfo}>
      <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
      <Text style={styles.songArtist} numberOfLines={1}>{song.artist} • {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</Text>
    </View>
    <View style={styles.songActions}>
      <TouchableOpacity onPress={() => onPlay(song.id)} style={styles.playButton}>
        <Text style={styles.playButtonText}>▶️</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onRemove(song.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  </View>
);

interface PlaylistViewScreenProps {
  route: { params: { playlistId: string } }; // playlistName is derived from store
  navigation: any;
}

const PlaylistViewScreen: React.FC<PlaylistViewScreenProps> = ({ route, navigation }) => {
  const { playlistId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const playlist = useSelector((state: RootState) => selectPlaylistById(state, playlistId));
  // Efficiently select song objects for the current playlist
  const songsForPlaylist = useSelector((state: RootState) => {
    if (!playlist) return [];
    return playlist.songIds.map(songId => selectSongById(state, songId)).filter(song => song !== undefined) as Song[];
  });

  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);

  const handlePlaySong = (songId: string) => {
    console.log(`Playing song ${songId} from playlist ${playlist?.name}`);
    // Implement actual playback logic or navigation to player
  };

  const handleRemoveSong = (songId: string) => {
    if (!playlist) return;
    const song = songsForPlaylist.find(s => s.id === songId);
    Alert.alert(
      "Remove Song",
      `Are you sure you want to remove "${song?.title || 'this song'}" from "${playlist.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => dispatch(removeSongFromPlaylist({ playlistId, songId })) }
      ]
    );
  };

  const openRenameModal = () => {
    setIsRenameModalVisible(true);
  };

  const handleDeleteCurrentPlaylist = () => {
    if (!playlist) return;
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete the playlist "${playlist.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
            dispatch(deletePlaylistAction({ id: playlistId }));
            navigation.goBack(); // Navigate back after deletion
          }
        }
      ]
    );
  };

  useLayoutEffect(() => {
    if (playlist) {
      navigation.setOptions({
        title: playlist.name,
        headerRight: () => (
          <TouchableOpacity onPress={openRenameModal} style={{ marginRight: 16 }}>
            <Text style={{ color: '#2DA44E', fontSize: 16 }}>Rename</Text>
          </TouchableOpacity>
        ),
      });
    } else {
         // Handle case where playlist is not found (e.g., after deletion from another device/view)
        navigation.setOptions({ title: "Playlist not found" });
        // Consider navigating back if playlist is definitively gone
        // useEffect(() => { if (!playlist) navigation.goBack(); }, [playlist, navigation]);
    }
  }, [navigation, playlist]);

  if (!playlist) {
    // Render loading state or a "Playlist not found" message
    // This can happen if the playlist was deleted and state updated before navigating away
    return (
      <View style={styles.container}>
        <Text style={styles.emptyPlaylistText}>Playlist not found or has been deleted.</Text>
      </View>
    );
  }

  // Optional: Add Songs Button
  const handleAddSongs = () => {
    console.log("Navigate to Add Songs screen for playlist: " + playlist.name);
    // navigation.navigate('AddSongsScreen', { playlistId: playlist.id });
  };


  return (
    <View style={styles.container}>
      {songsForPlaylist.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyPlaylistText}>This playlist is empty. Add some songs!</Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddSongs}>
                <Text style={styles.actionButtonText}>+ Add Songs</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={songsForPlaylist}
          renderItem={({ item }) => (
            <SongItemDisplay
              song={item}
              onPlay={() => handlePlaySong(item.id)}
              onRemove={() => handleRemoveSong(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
      <View style={styles.footerButtons}>
        <TouchableOpacity
            style={[styles.actionButton, styles.addSongsButton]}
            onPress={handleAddSongs}
            >
            <Text style={styles.actionButtonText}>+ Add More Songs</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteCurrentPlaylist}
        >
            <Text style={styles.actionButtonText}>Delete Playlist</Text>
        </TouchableOpacity>
      </View>

      {playlist && (
        <CreatePlaylistModal
          visible={isRenameModalVisible}
          onClose={() => setIsRenameModalVisible(false)}
          isRename={true}
          currentPlaylistId={playlist.id}
          currentName={playlist.name}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117', // Background Primary (Dark)
  },
  playlistTitle: { // This is now set in header
    fontSize: 24, // Heading 1
    fontWeight: 'bold',
    color: '#F0F6FC', // Text Primary (Dark)
    paddingHorizontal: 16, // space-md
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContentContainer: {
    paddingHorizontal: 16, // space-md
    paddingBottom: 16, // space-md
  },
  emptyPlaylistText: {
    fontSize: 16, // Body Large
    color: '#8B949E', // Text Secondary (Dark)
    textAlign: 'center',
    marginTop: 48, // space-2xl
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22', // Background Secondary (Dark)
    borderRadius: 12, // radius-md
    padding: 12, // space-sm + space-xs
    marginBottom: 12, // space-sm + space-xs
    borderWidth: 1,
    borderColor: '#30363D', // Border (Dark)
  },
  albumArt: {
    width: 60, // Smaller than search results
    height: 60,
    borderRadius: 8, // radius-sm
    marginRight: 12, // space-sm + space-xs
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16, // Body Large
    color: '#F0F6FC', // Text Primary (Dark)
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 14, // Body
    color: '#8B949E', // Text Secondary (Dark)
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    padding: 8,
    marginRight: 8,
  },
  playButtonText: {
    fontSize: 24,
    color: '#2DA44E', // Accent Primary
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#F85149', // Error color for remove
  },
  deleteButton: {
    backgroundColor: '#F85149', // Error color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6, // radius-sm
    alignItems: 'center',
    margin: 16, // space-md
    minHeight: 44,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16, // Body Large
    fontWeight: '500',
  },
});

export default PlaylistViewScreen;
