import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { store, AppDispatch } from './store';
import {
  loadPlaylistsFromStorage,
  loadSongsFromStorage,
  loadDownloadedMediaItemsFromStorage
} from './services/playlistStorage';
import { loadPlaylists } from './store/playlistsSlice';
import { setSongs } from './store/songsSlice';
import { loadDownloadedItems } from './store/downloadsSlice';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const PlaylistViewPage = lazy(() => import('./pages/PlaylistViewPage'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const LoadingIndicator: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-background-primary text-text-primary">
    <p className="text-xl">Loading Page...</p>
    {/* You can use a spinner component here */}
  </div>
);

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const bootstrapAsync = () => {
      try {
        // console.log("Bootstrapping data...");
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
        // console.log("Bootstrap complete.");
      } catch (e) {
        console.error("Failed to bootstrap app data from localStorage", e);
      } finally {
        setInitialDataLoaded(true);
      }
    };
    bootstrapAsync();
  }, [dispatch]);

  if (!initialDataLoaded) {
    return <LoadingIndicator />; // Show loading indicator until initial data (like persisted Redux state) is loaded
  }

  return (
    <Router>
      {/* Basic Navigation Links - replace with a proper Nav component later */}
      <nav className="p-4 bg-background-secondary text-text-primary shadow-md">
        <ul className="flex space-x-4 container mx-auto">
          <li><Link to="/" className="hover:text-accent-primary">Home</Link></li>
          <li><Link to="/search" className="hover:text-accent-primary">Search</Link></li>
          <li><Link to="/downloads" className="hover:text-accent-primary">Downloads</Link></li>
          <li><Link to="/settings" className="hover:text-accent-primary">Settings</Link></li>
        </ul>
      </nav>

      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* For SearchResultsPage, it might expect a query param or state, handle accordingly */}
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/search/:query" element={<SearchResultsPage />} /> {/* Example if query in path */}
          <Route path="/playlist/:playlistId" element={<PlaylistViewPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Add a 404 Not Found route if desired */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Suspense>
    </Router>
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
