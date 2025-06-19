import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
// import { useParams, useNavigate } from 'react-router-dom'; // Actual router hooks
import { RootState, AppDispatch } from '../store';
import { selectPlaylistById, removeSongFromPlaylist, deletePlaylist as deletePlaylistAction } from '../store/playlistsSlice';
import { selectSongById, Song } from '../store/songsSlice';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import PlaceholderImage from '../components/ui/PlaceholderImage'; // Import PlaceholderImage

interface SongItemDisplayProps {
  // Props for react-window: index, style, data (which contains onPlay, onRemove, and songs list)
  index: number;
  style: React.CSSProperties;
  data: {
    songs: Song[];
    onPlay: (songId: string) => void;
    onRemove: (songId: string) => void;
  };
}

const SongItemDisplay: React.FC<SongItemDisplayProps> = ({ index, style, data }) => {
  const song = data.songs[index];
  const { onPlay, onRemove } = data;

  return (
    <div style={style} className="mb-3">
      <div className="flex items-center p-3 bg-background-secondary rounded-lg border border-border hover:bg-background-tertiary transition-colors h-full">
        <PlaceholderImage
          src={song.thumbnail}
          alt={song.title}
          className="w-14 h-14 rounded-md mr-4 object-cover flex-shrink-0"
        />
        <div className="flex-1 overflow-hidden">
          <h3 className="text-md font-semibold text-text-primary truncate">{song.title}</h3>
          <p className="text-sm text-text-secondary truncate">{song.artist} • {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</p>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => onPlay(song.id)}
            className="p-2 rounded-full hover:bg-accent-primary hover:text-white text-accent-primary transition-colors"
            title="Play"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(song.id)}
            className="p-2 rounded-full hover:bg-error hover:text-white text-error transition-colors"
            title="Remove from playlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const SONG_ITEM_HEIGHT = 92; // p-3 (12*2=24) + h-14 (56) + mb-3 (12) = 92. Or Item container height if fixed. Let's use 80 (card height) + 12 (mb-3) = 92.

interface PlaylistViewPageProps {
  // For testing, pass playlistId as a prop. In a real app, this would come from router.
  playlistId: string;
}

const PlaylistViewPage: React.FC<PlaylistViewPageProps> = ({ playlistId }) => {
  // const { playlistId } = useParams<{ playlistId: string }>(); // Actual usage with React Router
  // const navigate = useNavigate(); // Actual usage
  const dispatch = useDispatch<AppDispatch>();

  const playlist = useSelector((state: RootState) => playlistId ? selectPlaylistById(state, playlistId) : undefined);
  const songsForPlaylist = useSelector((state: RootState) => {
    if (!playlist) return [];
    return playlist.songIds.map(songId => selectSongById(state, songId)).filter(song => song !== undefined) as Song[];
  });

  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);

  const handlePlaySong = (songId: string) => {
    console.log(`Playing song ${songId} from playlist ${playlist?.name}`);
    // Actual play logic here
  };

  const handleRemoveSong = (songId: string) => {
    if (!playlist) return;
    const song = songsForPlaylist.find(s => s.id === songId);
    if (window.confirm(`Are you sure you want to remove "${song?.title || 'this song'}" from "${playlist.name}"?`)) {
      dispatch(removeSongFromPlaylist({ playlistId: playlist.id, songId }));
    }
  };

  const openRenameModal = () => setIsRenameModalVisible(true);

  const handleDeleteCurrentPlaylist = () => {
    if (!playlist) return;
    if (window.confirm(`Are you sure you want to delete the playlist "${playlist.name}"? This cannot be undone.`)) {
      dispatch(deletePlaylistAction({ id: playlist.id }));
      console.log("Playlist deleted. Navigating away..."); // Replace with navigate hook
      // navigate('/library/playlists');
    }
  };

  const handleAddSongs = () => {
    if (!playlist) return;
    console.log(`Navigate to Add Songs screen for playlist: ${playlist.name}`);
    // navigate(`/add-songs-to-playlist/${playlist.id}`);
  };

  // Update document title
  useEffect(() => {
    if (playlist) {
      document.title = `ChillyMusic - ${playlist.name}`;
    } else {
      document.title = "ChillyMusic - Playlist Not Found";
    }
  }, [playlist]);

  if (!playlistId || !playlist) {
    return (
      <div className="p-4 md:p-6 bg-background-primary text-text-primary min-h-screen text-center">
        <h1 className="text-2xl font-bold text-text-error mt-10">Playlist Not Found</h1>
        <p className="text-text-secondary mt-4">The playlist you are looking for does not exist or has been deleted.</p>
        {/* Link to go back or to playlists list */}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-background-primary text-text-primary min-h-screen flex flex-col"> {/* Added flex flex-col */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold truncate" title={playlist.name}>{playlist.name}</h1>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={openRenameModal}
            className="bg-accent-secondary text-white py-2 px-4 rounded-md hover:bg-opacity-90 text-sm font-medium min-h-[38px]"
          >
            Rename
          </button>
           <button
            onClick={handleAddSongs}
            className="bg-accent-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 text-sm font-medium min-h-[38px]"
          >
            Add Songs
          </button>
        </div>
      </div>

      {songsForPlaylist.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-text-secondary text-lg mb-4">This playlist is empty.</p>
          <button
            onClick={handleAddSongs}
            className="bg-accent-primary text-white py-3 px-6 rounded-md hover:bg-opacity-90 text-lg font-medium"
          >
            Add Songs
          </button>
        </div>
      ) : (
        // Use a div to constrain the List's height, or use flex-grow on the list container.
        // The List component itself needs a numeric height.
        <div className="flex-grow" style={{ minHeight: 300 /* Example minimum height */ }}>
          {/* This outer div should be part of a flex layout that gives it space */}
          {/* Or set an explicit height for the list's container e.g. style={{ height: '500px' }} */}
          <List
            height={500} // Placeholder: This should be dynamically calculated or set based on parent container
            itemCount={songsForPlaylist.length}
            itemSize={SONG_ITEM_HEIGHT}
            width="100%"
            itemData={{ songs: songsForPlaylist, onPlay: handlePlaySong, onRemove: handleRemoveSong }}
          >
            {SongItemDisplay}
          </List>
        </div>
      )}
      <div className="mt-8 pt-4 border-t border-border">
        <button
            onClick={handleDeleteCurrentPlaylist}
            className="bg-error text-white py-2 px-4 rounded-md hover:bg-opacity-90 text-sm font-medium min-h-[38px]"
          >
            Delete Playlist
        </button>
      </div>
      {isRenameModalVisible && playlist && (
        <CreatePlaylistModal
          visible={isRenameModalVisible}
          onClose={() => setIsRenameModalVisible(false)}
          isRename={true}
          currentPlaylistId={playlist.id}
          currentName={playlist.name}
        />
      )}
    </div>
  );
};

export default PlaylistViewPage;
