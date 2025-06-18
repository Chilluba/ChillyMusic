import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './store'; // Import AppDispatch
import { loadPlaylistsFromStorage, loadSongsFromStorage, loadDownloadedMediaItemsFromStorage } from './services/playlistStorage';
import { loadPlaylists } from './store/playlistsSlice';
import { setSongs } from './store/songsSlice';
import { loadDownloadedItems } from './store/downloadsSlice'; // Import action for downloads
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// This would be your main App navigator or initial screen component
const MainAppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch type
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedPlaylists = await loadPlaylistsFromStorage();
        if (storedPlaylists && storedPlaylists.length > 0) {
          dispatch(loadPlaylists(storedPlaylists));
        }

        const storedSongs = await loadSongsFromStorage();
        if (storedSongs && storedSongs.length > 0) {
          dispatch(setSongs(storedSongs));
        }

        const storedDownloadedMedia = await loadDownloadedMediaItemsFromStorage();
        if (storedDownloadedMedia && storedDownloadedMedia.length > 0) {
          dispatch(loadDownloadedItems(storedDownloadedMedia));
        }

      } catch (e) {
        console.error("Failed to bootstrap app data", e);
        // Handle error, maybe show an error message to the user
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading Data...</Text>
      </View>
    );
  }

  // Replace this with your actual app navigation
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>ChillyMusic App</Text>
      <Text>App Content Would Go Here (e.g., Navigation)</Text>
      {/*
        Example of how components would eventually be used (for testing data flow):
        To test, you might temporarily insert PlaylistList here if navigation isn't set up.
        e.g. <PlaylistList onSelectPlaylist={() => {}} onOpenCreateModal={() => {}} />
      */}
    </View>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <MainAppContent />
    </Provider>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0D1117', // Background Primary (Dark)
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0F6FC', // Text Primary (Dark)
    marginBottom: 16,
  }
});

export default App;
