import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { selectAllPlaylists, Playlist as PlaylistType, addSongToPlaylist } from '../store/playlistsSlice';
import { addSong as addSongToGlobalList, Song } from '../store/songsSlice';


interface PlaylistSelectItemProps {
  name: string;
  songCount: number;
  onPress: () => void;
}

const PlaylistSelectItem: React.FC<PlaylistSelectItemProps> = ({ name, songCount, onPress }) => (
  <div
    onClick={onPress}
    className="p-3 hover:bg-background-tertiary rounded-md cursor-pointer border-b border-border last:border-b-0"
  >
    <h3 className="text-md text-text-primary">{name}</h3>
    <p className="text-xs text-text-secondary">{songCount} songs</p>
  </div>
);

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  songToAdd?: Song | null;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  visible,
  onClose,
  onCreateNew,
  songToAdd,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const playlists = useSelector((state: RootState) => selectAllPlaylists(state));

  if (!visible) {
    return null;
  }

  const handleSelectPlaylist = (playlistId: string) => {
    if (songToAdd) {
      dispatch(addSongToGlobalList(songToAdd)); // Ensure song is in global state
      dispatch(addSongToPlaylist({ playlistId, songId: songToAdd.id }));
      console.log(`Song "${songToAdd.title}" dispatched to be added to playlist ID ${playlistId}`);
      onClose(); // Close modal after selection
    } else {
      console.warn('No song to add was provided to AddToPlaylistModal.');
    }
  };

  const handleCreateNewPlaylist = () => {
    onCreateNew(); // Parent component handles modal switching logic
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-background-secondary p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-semibold text-text-primary mb-4 text-center">Add to Playlist</h2>

        {playlists.length === 0 ? (
           <p className="text-text-secondary text-center my-6">No playlists available. Create one first!</p>
        ) : (
          <div className="overflow-y-auto mb-4 flex-grow">
            {playlists.map((playlist) => (
              <PlaylistSelectItem
                key={playlist.id}
                name={playlist.name}
                songCount={playlist.songIds.length}
                onPress={() => handleSelectPlaylist(playlist.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-border space-y-3">
          <button
            onClick={handleCreateNewPlaylist}
            className="w-full px-6 py-2.5 bg-accent-primary text-white rounded-md hover:bg-opacity-90 transition-colors min-h-[44px]"
          >
            + Create New Playlist
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-6 py-2.5 border border-border text-text-primary rounded-md hover:bg-background-tertiary transition-colors min-h-[44px]" // Secondary button style
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
