import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import SearchInputUI from './components/ui/SearchInput'; // Renamed to avoid confusion
import RecentSearches from './components/feature/RecentSearches';
import TrendingNow from './components/feature/TrendingNow';
import SearchResultsPage from './pages/SearchResultsPage';
import './styles/globals.css';
import { SearchResult } from './types';
// Removed apiService import from App.tsx as SearchResultsPage handles its own fetching

const HomePageContent: React.FC = () => {
  const navigate = useNavigate();

  // This function will be called by SearchInputUI when a search is submitted
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
    <Router>
      <div className='min-h-screen bg-bg-primary text-text-primary font-sans'>
        <Header />
        <Routes>
          <Route path='/' element={<HomePageContent />} />
          <Route path='/search' element={<SearchResultsPage />} />
          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
}
export default App;
