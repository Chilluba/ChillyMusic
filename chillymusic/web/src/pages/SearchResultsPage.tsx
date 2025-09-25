import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchResult, MediaInfo } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { fetchSearchResults, fetchMediaInfo, ApiError } from '../services/apiService'; // Import ApiError
import DownloadOptionsPopover, { DownloadOption } from '../components/modals/DownloadOptionsPopover';
import { useWebPlayback } from '../context/PlaybackContext';
import Icon from '../components/ui/Icon'; // For error icon

// ... (PlaybackProgress interface if still defined here, or imported)

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playTrack, currentTrack: contextCurrentTrack, isLoading: contextIsLoadingPlayback, isPlaying: contextIsPlaying } = useWebPlayback();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null); // For search results fetching error

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  // ... (Download options states remain)
  const [downloadPopoverAnchor, setDownloadPopoverAnchor] = useState<HTMLElement | null>(null);
  const [trackForDownloadOptions, setTrackForDownloadOptions] = useState<SearchResult | null>(null);
  const [mediaInfoForDownload, setMediaInfoForDownload] = useState<MediaInfo | null>(null);
  const [isLoadingDownloadOpts, setIsLoadingDownloadOpts] = useState(false);


  useEffect(() => {
    if (!query) {
      setIsLoadingResults(false);
      setResults([]); // Clear results if no query
      setPageError(null); // Clear error if no query
      return;
    }
    const performSearch = async () => {
      setIsLoadingResults(true);
      setPageError(null); // Clear previous errors
      setResults([]); // Clear previous results
      try {
        const response = await fetchSearchResults(query);
        setResults(response.results);
      } catch (err: any) {
        const typedError = err as ApiError; // Cast to ApiError
        console.error('Error fetching search results (Web):', typedError.message, typedError.status, typedError.details);
        setPageError(typedError.message || 'An unknown error occurred while fetching results.');
      } finally {
        setIsLoadingResults(false);
      }
    };
    performSearch();
  }, [query]); // Rerun effect when query changes

  const handleOpenDownloadOptions = async (track: SearchResult, anchorEl: HTMLElement) => { /* ... existing ... */ };
  const handleSelectDownloadOption = async (option: DownloadOption) => { /* ... existing ... */ };

  // --- Render Logic ---
  if (isLoadingResults) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-text-secondary dark:text-dark-text-secondary'>
        <svg className='animate-spin h-10 w-10 text-accent-primary dark:text-dark-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
        <p className='mt-sm'>Loading results for "{query}"...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'>
        <Icon name='Error' size={48} className='text-error-primary dark:text-dark-error-primary mb-sm' /> {/* Assuming Error icon exists */}
        <p className='text-text-primary dark:text-dark-text-primary text-xl font-semibold mb-xs'>Failed to Load Results</p>
        <p className='text-text-secondary dark:text-dark-text-secondary mb-lg'>{pageError}</p>
        <button
          onClick={() => navigate('/')} // Or try search again: window.location.reload(); or specific retry function
          className='px-lg py-sm bg-accent-primary dark:bg-dark-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (results.length === 0 && query) { // Query exists but no results (and no error)
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'>
        <Icon name='MagnifyingGlass' size={48} className='text-text-muted dark:text-dark-text-muted mb-sm' />
        <p className='text-text-primary dark:text-dark-text-primary text-xl mb-sm'>No results found for "{query}"</p>
        <p className='text-text-secondary dark:text-dark-text-secondary mb-lg'>Try a different search term or check your spelling.</p>
        <button
          onClick={() => navigate('/')}
          className='px-lg py-sm bg-accent-primary dark:bg-dark-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!query) { // No query was entered (e.g., direct navigation to /search)
     return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'>
        <p className='text-text-primary dark:text-dark-text-primary text-xl mb-sm'>Please enter a search term on the Home page.</p>
         <button
          onClick={() => navigate('/')}
          className='px-lg py-sm bg-accent-primary dark:bg-dark-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'
        >
          Back to Home
        </button>
      </div>
     );
  }

  return (
    <div className='p-md'>
      <h2 className='text-h1 font-bold text-text-primary dark:text-dark-text-primary mb-md'>
        Search Results for: <span className='text-accent-primary dark:text-dark-accent-primary'>{query}</span>
      </h2>
      <div className='grid grid-cols-1 gap-md'>
        {results.map(item => (
          <MusicCard
            key={item.id + item.videoId}
            item={item}
            onPlayPause={() => playTrack(item)}
            isPlaying={contextCurrentTrack?.videoId === item.videoId && contextIsPlaying}
            isLoading={contextCurrentTrack?.videoId === item.videoId && contextIsLoadingPlayback}
            onOpenDownloadOptions={handleOpenDownloadOptions}
          />
        ))}
      </div>
      {downloadPopoverAnchor && trackForDownloadOptions && ( <DownloadOptionsPopover /* ...props... */ /> )}
      {/* Download status feedback UI from previous step ... */}
    </div>
  );
};

export default SearchResultsPage;
