import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import PlaylistItem from './PlaylistItem';
import { selectAllPlaylists, Playlist } from '../store/playlistsSlice'; // Assuming Playlist type is exported
import { RootState } from '../store'; // Assuming RootState is exported from store index

interface PlaylistListProps {
  onSelectPlaylist: (playlistId: string) => void;
  onOpenCreateModal: () => void; // Parent handles modal visibility
  onRenamePlaylistRequested: (playlistId: string, currentName: string) => void; // For rename action
}

const PlaylistList: React.FC<PlaylistListProps> = ({ onSelectPlaylist, onOpenCreateModal, onRenamePlaylistRequested }) => {
  const playlists = useSelector((state: RootState) => selectAllPlaylists(state));

  const renderPlaylist = ({ item }: { item: Playlist }) => (
    <PlaylistItem
      id={item.id}
      name={item.name}
      songCount={item.songIds.length} // Calculate song count from songIds array
      onPress={onSelectPlaylist} // Pass playlistId directly
      onRenamePress={onRenamePlaylistRequested} // Pass this down
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Playlists</Text>
      {playlists.length === 0 ? (
        <Text style={styles.emptyText}>No playlists yet. Create one!</Text>
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderPlaylist}
          keyExtractor={(item) => item.id}
        />
      )}
      <TouchableOpacity
        style={styles.createButton}
        onPress={onOpenCreateModal} // Call prop to handle modal opening
      >
        <Text style={styles.createButtonText}>+ Create Playlist</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16, // space-md
    backgroundColor: '#0D1117', // Background Primary (Dark)
  },
  title: {
    fontSize: 24, // Heading 1
    fontWeight: 'bold',
    color: '#F0F6FC', // Text Primary (Dark)
    marginBottom: 16, // space-md
  },
  emptyText: {
    fontSize: 16, // Body Large
    color: '#8B949E', // Text Secondary (Dark)
    textAlign: 'center',
    marginTop: 32, // space-xl
  },
  createButton: {
    backgroundColor: '#2DA44E', // Accent Primary
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6, // radius-sm
    alignItems: 'center',
    marginTop: 16, // space-md
    minHeight: 44,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16, // Body Large
    fontWeight: '500',
  },
});

export default PlaylistList;
