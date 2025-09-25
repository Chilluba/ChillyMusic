import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from 'react-router-dom'; // Added Outlet, useNavigate
import Header from './components/layout/Header';
// Import pages
import SearchResultsPage from './pages/SearchResultsPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
// Import contexts and new components
import { ThemeProvider, useAppTheme as useWebThemeContext } from './context/ThemeContext';
import { WebPlaybackProvider, useWebPlayback } from './context/PlaybackContext';
import EnhancedPlayer from './components/player/EnhancedPlayer';
import SearchInputUI from './components/ui/SearchInput';
import RecentSearches from './components/feature/RecentSearches';
import TrendingNow from './components/feature/TrendingNow';

import './styles/globals.css';

const HomePageContent: React.FC = () => {
  const navigate = useNavigate();
  // const playback = useWebPlayback(); // Not needed here if SearchInputUI directly calls navigate

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  return (
    <main className='py-md'>
      <SearchInputUI onSearchSubmit={handleSearchSubmit} />
      <RecentSearches />
      <TrendingNow />
    </main>
  );
};

const AppLayout: React.FC = () => {
  const { currentTrack } = useWebPlayback(); // Get currentTrack from context
  const { clearPlayer } = useWebPlayback(); // For EnhancedPlayer's onClose

  return (
    // The root div's theme classes are now handled by ThemeProvider on <html> or body
    // Ensure globals.css applies base styling to body/html that respects theme variables or classes
    // Added `pb-28` to main content area if a track is playing to prevent overlap with EnhancedPlayer
    <div className={`min-h-screen bg-bg-primary text-text-primary dark:bg-dark-bg-primary dark:text-dark-text-primary font-sans transition-colors duration-300 ${currentTrack ? 'pb-28 md:pb-32' : ''}`}>
      <Header />
      <Outlet /> {/* Outlet for nested routes like HomePageContent, SearchResultsPage etc. */}
      {/* Site-wide player, shown if there's a track. onCloseProp clears player via context. */}
      {currentTrack && <EnhancedPlayer onCloseProp={clearPlayer} />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <WebPlaybackProvider>
        <Router>
          <Routes>
            <Route path='/' element={<AppLayout />}>
              <Route index element={<HomePageContent />} />
              <Route path='search' element={<SearchResultsPage />} />
              <Route path='library' element={<LibraryPage />} />
              <Route path='settings' element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </WebPlaybackProvider>
    </ThemeProvider>
  );
}
export default App;
