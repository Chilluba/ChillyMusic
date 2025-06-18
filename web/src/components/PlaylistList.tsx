import React from 'react';
import { useSelector } from 'react-redux';
import PlaylistItem from './PlaylistItem';
import { selectAllPlaylists, Playlist } from '../store/playlistsSlice';
import { RootState } from '../store';

interface PlaylistListProps {
  onSelectPlaylist: (playlistId: string) => void;
  onOpenCreateModal: () => void;
  onRenamePlaylistRequested: (playlistId: string, currentName: string) => void;
}

const PlaylistList: React.FC<PlaylistListProps> = ({ onSelectPlaylist, onOpenCreateModal, onRenamePlaylistRequested }) => {
  const playlists = useSelector((state: RootState) => selectAllPlaylists(state));

  return (
    <div className="p-4 bg-background-primary text-text-primary"> {/* Using Tailwind classes based on UI Doc */}
      <h1 className="text-2xl font-bold mb-4">My Playlists</h1> {/* text-2xl from Display/Heading 1 */}
      {playlists.length === 0 ? (
        <p className="text-text-secondary text-center mt-8">No playlists yet. Create one!</p>
      ) : (
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <PlaylistItem
              key={playlist.id}
              id={playlist.id}
              name={playlist.name}
              songCount={playlist.songIds.length}
              onPress={onSelectPlaylist}
              onRenamePress={onRenamePlaylistRequested}
            />
          ))}
        </div>
      )}
      <button
        className="mt-4 w-full bg-accent-primary text-white py-3 px-6 rounded-md hover:bg-opacity-90 text-lg font-medium min-h-[44px]" // Primary Button style
        onClick={onOpenCreateModal}
      >
        + Create Playlist
      </button>
    </div>
  );
};

export default PlaylistList;
