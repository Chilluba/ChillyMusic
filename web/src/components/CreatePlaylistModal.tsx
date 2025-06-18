import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createPlaylist, renamePlaylist } from '../store/playlistsSlice';
import { AppDispatch } from '../store';

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  isRename?: boolean;
  currentPlaylistId?: string;
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

  if (!visible) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = playlistName.trim();
    if (trimmedName) {
      if (isRename && currentPlaylistId) {
        dispatch(renamePlaylist({ id: currentPlaylistId, newName: trimmedName }));
      } else if (!isRename) {
        dispatch(createPlaylist({ name: trimmedName }));
      }
      setPlaylistName(''); // Reset for next time, though component might unmount/reset via visible prop
      onClose();
    } else {
      console.log('Playlist name cannot be empty');
      // Optionally, show an inline error message here
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"> {/* Centered overlay */}
      <div className="bg-background-secondary p-6 rounded-lg shadow-xl w-full max-w-md"> {/* Modal view from UI Doc */}
        <h2 className="text-xl font-semibold text-text-primary mb-6 text-center"> {/* Heading 2 / text-xl */}
          {isRename ? 'Rename Playlist' : 'Create New Playlist'}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            autoFocus
            className="w-full p-3 bg-background-tertiary text-text-primary rounded-md border border-border focus:border-accent-primary focus:ring-2 focus:ring-accent-primary focus:outline-none min-h-[52px] text-lg mb-6" // Input field style
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-border text-text-primary rounded-md hover:bg-background-tertiary transition-colors min-h-[44px]" // Secondary button style
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-accent-primary text-white rounded-md hover:bg-opacity-90 transition-colors min-h-[44px]" // Primary button style
            >
              {isRename ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
