import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { selectAllPlaylists, Playlist, addSongToPlaylist } from '../store/playlistsSlice';
import { addSong as addSongToGlobalList, Song } from '../store/songsSlice'; // Renamed to avoid conflict

interface PlaylistSelectItemProps {
  name: string;
  songCount: number;
  onPress: () => void;
}

const PlaylistSelectItem: React.FC<PlaylistSelectItemProps> = ({ name, songCount, onPress }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <Text style={styles.itemName}>{name}</Text>
    <Text style={styles.itemSongCount}>{songCount} songs</Text>
  </TouchableOpacity>
);

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateNew: () => void; // To open CreatePlaylistModal, parent handles this
  songToAdd?: Song | null; // Full song object to add
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  visible,
  onClose,
  onCreateNew,
  songToAdd,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const playlists = useSelector((state: RootState) => selectAllPlaylists(state));

  const handleSelectPlaylist = (playlistId: string) => {
    if (songToAdd) {
      // First, ensure the song is in the global song list
      dispatch(addSongToGlobalList(songToAdd));
      // Then, add its ID to the selected playlist
      dispatch(addSongToPlaylist({ playlistId, songId: songToAdd.id }));
      console.log(`Song "${songToAdd.title}" added to playlist ID ${playlistId}`);
      onClose(); // Close modal after selection
    } else {
      console.warn('No song selected to add to playlist.');
    }
  };

  const handleCreateNewPlaylist = () => {
    // Parent component should handle closing this modal and opening CreatePlaylistModal
    // It might pass the songToAdd to the creation flow if the UX requires adding the song after creation
    onCreateNew();
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add to Playlist</Text>
          {playlists.length === 0 ? ( // Use playlists from useSelector
             <Text style={styles.emptyText}>No playlists available. Create one first!</Text>
          ) : (
            <FlatList
              data={playlists} // Use playlists from useSelector
              renderItem={({ item }: { item: PlaylistType }) => ( // Use PlaylistType from import
                <PlaylistSelectItem
                  name={item.name}
                  songCount={item.songIds.length} // Calculate song count
                  onPress={() => handleSelectPlaylist(item.id)} // Correct handler
                />
              )}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          )}
          <TouchableOpacity
            style={[styles.button, styles.createNewButton]}
            onPress={handleCreateNewPlaylist} // Correct handler
          >
            <Text style={styles.buttonText}>+ Create New Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Backdrop
  },
  modalView: {
    margin: 20,
    backgroundColor: '#161B22', // Background Secondary (Dark)
    borderRadius: 16, // radius-lg
    padding: 24, // space-lg
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16, // space-md
    textAlign: 'center',
    fontSize: 20, // Heading 2
    color: '#F0F6FC', // Text Primary (Dark)
    fontWeight: '600',
  },
  list: {
    marginBottom: 16, // space-md
  },
  itemContainer: {
    paddingVertical: 12, // space-sm + space-xs
    paddingHorizontal: 8, // space-sm
    borderBottomWidth: 1,
    borderBottomColor: '#30363D', // Border (Dark)
  },
  itemName: {
    fontSize: 16, // Body Large
    color: '#F0F6FC', // Text Primary (Dark)
  },
  itemSongCount: {
    fontSize: 12, // Caption
    color: '#8B949E', // Text Secondary (Dark)
  },
  emptyText: {
    fontSize: 16, // Body Large
    color: '#8B949E', // Text Secondary (Dark)
    textAlign: 'center',
    marginVertical: 24, // space-lg
  },
  button: {
    borderRadius: 6, // radius-sm
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8, // space-sm
  },
  createNewButton: {
    backgroundColor: '#2DA44E', // Accent Primary
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16, // Body Large
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#30363D', // Border (Dark)
  },
  cancelButtonText: {
     color: '#F0F6FC', // Text Primary (Dark)
     fontWeight: '500',
     fontSize: 16, // Body Large
  }
});

export default AddToPlaylistModal;
