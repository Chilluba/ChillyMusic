import React from 'react';
import Header from './components/layout/Header';
import SearchInput from './components/ui/SearchInput';
import RecentSearches from './components/feature/RecentSearches';
import TrendingNow from './components/feature/TrendingNow';
import './styles/globals.css';

// It's good practice to define pages, even if App.tsx is simple for now.
const HomePage: React.FC = () => {
  return (
    <main className='py-md'> {/* Added vertical padding to main content area */}
      <SearchInput />
      <RecentSearches />
      <TrendingNow />
    </main>
  );
};

function App() {
  return (
    // Ensure the body tag (via globals.css) or this root div has 'dark' class if needed by Tailwind config for dark mode.
    // The tailwind.config.js is set to darkMode: 'class', and public/index.html body has class="dark"
    <div className='min-h-screen bg-bg-primary text-text-primary font-sans'>
      <Header />
      <HomePage />
    </div>
  );
}
export default App;
