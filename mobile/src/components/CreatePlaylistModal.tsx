import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useDispatch } from 'react-redux';
import { createPlaylist, renamePlaylist } from '../store/playlistsSlice';
import { AppDispatch } from '../store'; // Assuming AppDispatch is exported

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  isRename?: boolean;
  currentPlaylistId?: string; // Changed from playlistId to currentPlaylistId for clarity
  currentName?: string;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  visible,
  onClose,
  isRename = false,
  currentPlaylistId,
  currentName = '',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [playlistName, setPlaylistName] = useState('');

  useEffect(() => {
    if (visible) {
      setPlaylistName(isRename ? currentName : '');
    }
  }, [visible, isRename, currentName]);


  const handleSubmit = () => {
    const trimmedName = playlistName.trim();
    if (trimmedName) {
      if (isRename && currentPlaylistId) {
        dispatch(renamePlaylist({ id: currentPlaylistId, newName: trimmedName }));
      } else if (!isRename) {
        dispatch(createPlaylist({ name: trimmedName }));
      }
      setPlaylistName('');
      onClose();
    } else {
      console.log('Playlist name cannot be empty');
      // Optionally, show an inline error message to the user
    }
  };

  if (!visible) return null; // Don't render anything if not visible

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {isRename ? 'Rename Playlist' : 'Create New Playlist'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter playlist name"
            placeholderTextColor="#6E7681" // Text Muted (Dark)
            value={playlistName}
            onChangeText={setPlaylistName}
            autoFocus
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>{isRename ? 'Save' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
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
  },
  modalTitle: {
    marginBottom: 24, // space-lg
    textAlign: 'center',
    fontSize: 20, // Heading 2
    color: '#F0F6FC', // Text Primary (Dark)
    fontWeight: '600',
  },
  input: {
    minHeight: 52,
    backgroundColor: '#21262D', // Background Tertiary (Dark)
    borderRadius: 12, // radius-md
    paddingHorizontal: 20, // From Search Input spec
    paddingVertical: 16,
    fontSize: 16, // Body Large
    color: '#F0F6FC', // Text Primary (Dark)
    marginBottom: 24, // space-lg
    borderWidth: 1,
    borderColor: '#30363D', // Border (Dark)
  },
  // inputFocus: { // Implement focus state from UI_UX Design Document
  //   borderColor: '#2DA44E', // Accent Primary
  //   boxShadow: '0 0 0 3px rgba(45, 164, 78, 0.1)' // This needs platform specific handling
  // },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 6, // radius-sm
    paddingVertical: 12,
    paddingHorizontal: 20, // Adjusted for better fit
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#30363D', // Border (Dark)
    marginRight: 8, // space-sm
  },
  buttonText: {
    color: '#F0F6FC', // Text Primary (Dark)
    fontWeight: '500',
    fontSize: 16, // Body Large
  },
  submitButton: {
    backgroundColor: '#2DA44E', // Accent Primary
    marginLeft: 8, // space-sm
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16, // Body Large
  },
});

export default CreatePlaylistModal;
