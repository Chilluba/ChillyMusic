import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import SearchInputUI from './components/ui/SearchInput';
import RecentSearches from './components/feature/RecentSearches';
import TrendingNow from './components/feature/TrendingNow';
import SearchResultsPage from './pages/SearchResultsPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage'; // Import SettingsPage
import './styles/globals.css';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider

const HomePageContent: React.FC = () => {
  const navigate = useNavigate();

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

function App() {
  return (
    <ThemeProvider> {/* Wrap with ThemeProvider */}
      <Router>
        {/* The root div for theme application (dark/light class) is handled by ThemeProvider on <html> */}
        {/* Ensure globals.css applies base styling to body/html that respects theme variables or classes */}
        <div className='min-h-screen bg-bg-primary text-text-primary font-sans transition-colors duration-300'>
          <Header />
          <Routes>
            <Route path='/' element={<HomePageContent />} />
            <Route path='/search' element={<SearchResultsPage />} />
            <Route path='/library' element={<LibraryPage />} />
            <Route path='/settings' element={<SettingsPage />} /> {/* New Route for Settings */}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}
export default App;
