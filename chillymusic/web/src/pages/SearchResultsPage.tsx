import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchResult } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { fetchSearchResults } from '../services/apiService'; // Assuming direct call or passed results
import Icon from '../components/ui/Icon';


const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      // Optionally navigate back or show 'no query' message
      // navigate('/');
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchSearchResults(query);
        setResults(response.results);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch search results.');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, location.search]); // Rerun on query change

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md'>
        <svg className='animate-spin h-10 w-10 text-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
        <p className='text-text-secondary mt-sm'>Loading results for "{query}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'>
        <p className='text-error-primary text-lg mb-sm'>Error fetching results</p>
        <p className='text-text-secondary mb-lg'>{error}</p>
        <button
          onClick={() => navigate('/')}
          className='px-lg py-sm bg-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'>
        <p className='text-text-primary text-xl mb-sm'>No results found for "{query}"</p>
        <p className='text-text-secondary mb-lg'>Try a different search term or check your spelling.</p>
        <button
          onClick={() => navigate('/')}
          className='px-lg py-sm bg-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!query) {
     return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'>
        <p className='text-text-primary text-xl mb-sm'>Please enter a search term.</p>
         <button
          onClick={() => navigate('/')}
          className='px-lg py-sm bg-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'
        >
          Back to Home
        </button>
      </div>
     );
  }

  return (
    <div className='p-md'>
      <h2 className='text-h1 font-bold text-text-primary mb-md'>
        Search Results for: <span className='text-accent-primary'>{query}</span>
      </h2>
      <div className='grid grid-cols-1 gap-md'>
        {results.map(item => (
          <MusicCard
            key={item.id + item.videoId}
            item={item}
            onPlay={(track) => console.log('Play (Web Results):', track.title)}
            onDownloadMp3={(track) => console.log('Download MP3 (Web Results):', track.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
