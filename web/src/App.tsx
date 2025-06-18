import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './store'; // Import AppDispatch
import {
  loadPlaylistsFromStorage,
  loadSongsFromStorage,
  loadDownloadedMediaItemsFromStorage
} from './services/playlistStorage';
import { loadPlaylists } from './store/playlistsSlice';
import { setSongs } from './store/songsSlice';
import { loadDownloadedItems } from './store/downloadsSlice'; // Import action for downloads
// import PlaylistList from './components/PlaylistList'; // Example for testing
// import CreatePlaylistModal from './components/CreatePlaylistModal'; // Example for testing

// Placeholder for where the main router and app layout would be
const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch
  const [loading, setLoading] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false); // Example for testing CreatePlaylistModal

  useEffect(() => {
    const bootstrapAsync = () => {
      try {
        const storedPlaylists = loadPlaylistsFromStorage();
        if (storedPlaylists && storedPlaylists.length > 0) {
          dispatch(loadPlaylists(storedPlaylists));
        }

        const storedSongs = loadSongsFromStorage();
        if (storedSongs && storedSongs.length > 0) {
          dispatch(setSongs(storedSongs));
        }

        const storedDownloadedMedia = loadDownloadedMediaItemsFromStorage();
        if (storedDownloadedMedia && storedDownloadedMedia.length > 0) {
          dispatch(loadDownloadedItems(storedDownloadedMedia));
        }

      } catch (e) {
        console.error("Failed to bootstrap app data from localStorage", e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-primary text-text-primary">
        <p className="text-xl">Loading Data...</p> {/* Basic loading indicator */}
      </div>
    );
  }

  // This is where your Router would typically go
  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4">
      <h1 className="text-3xl font-bold text-center mb-6">ChillyMusic Web App</h1>
      <p className="text-center text-text-secondary mb-6">App content and router would be here.</p>

      {/* Example of how components would eventually be used (for testing data flow):
      <div className="max-w-2xl mx-auto">
        <PlaylistList
          onSelectPlaylist={(id) => console.log('Selected playlist:', id)}
          onOpenCreateModal={() => setIsModalOpen(true)}
        />
        <CreatePlaylistModal
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(name) => console.log('Create playlist:', name)}
        />
      </div>
      */}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
