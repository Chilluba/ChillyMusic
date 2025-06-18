import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { deletePlaylist } from '../store/playlistsSlice';
import { AppDispatch } from '../store';

interface PlaylistItemProps {
  id: string;
  name: string;
  songCount: number;
  onPress: (playlistId: string) => void;
  onRenamePress: (playlistId: string, currentName: string) => void; // To open rename modal
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ id, name, songCount, onPress, onRenamePress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMoreOptions = () => {
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleRename = () => {
    closeMenu();
    onRenamePress(id, name);
  };

  const handleDelete = () => {
    closeMenu();
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete the playlist "${name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => dispatch(deletePlaylist({ id })) }
      ]
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={() => onPress(id)}>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.songCount}>{songCount} songs</Text>
        </View>
        <TouchableOpacity onPress={handleMoreOptions} style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋮</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={closeMenu}
        animationType="fade"
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeMenu}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleRename}>
              <Text style={styles.menuItemText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Text style={[styles.menuItemText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.cancelItem]} onPress={closeMenu}>
              <Text style={styles.menuItemText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16, // space-md
    paddingHorizontal: 8, // space-sm
    backgroundColor: '#161B22', // Background Secondary (Dark)
    borderRadius: 12, // radius-md
    marginBottom: 8, // space-sm
    borderWidth: 1,
    borderColor: '#30363D', // Border (Dark)
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18, // Slightly smaller than Heading 2
    color: '#F0F6FC', // Text Primary (Dark)
    fontWeight: '600',
  },
  songCount: {
    fontSize: 14, // Body
    color: '#8B949E', // Text Secondary (Dark)
  },
  moreButton: {
    padding: 8, // space-sm
    borderRadius: 20, // For a circular touch area
  },
  moreButtonText: {
    fontSize: 24,
    color: '#8B949E', // Text Secondary (Dark)
    fontWeight: 'bold',
  },
});

export default PlaylistItem;
