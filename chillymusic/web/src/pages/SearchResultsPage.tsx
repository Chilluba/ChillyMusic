import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchResult, MediaInfo, MediaFormatDetails } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { fetchSearchResults, fetchMediaInfo } from '../services/apiService';
import Icon from '../components/ui/Icon';

interface PlaybackProgress {
  currentTime: number;
  duration: number;
}

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true); // For page search results
  const [pageError, setPageError] = useState<string | null>(null); // For page search errors

  const [selectedTrack, setSelectedTrack] = useState<SearchResult | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false); // For individual track media info loading
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [progress, setProgress] = useState<PlaybackProgress>({ currentTime: 0, duration: 0 });

  const audioRef = useRef<HTMLAudioElement>(null);
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  useEffect(() => { // Effect for fetching search results
    if (!query) {
      setIsLoadingResults(false);
      setResults([]); // Clear results if no query
      return;
    }
    const performSearch = async () => {
      setIsLoadingResults(true);
      setPageError(null);
      setResults([]); // Clear previous results
      // Reset playback state for new search
      setSelectedTrack(null);
      setStreamUrl(null);
      setIsPlaying(false);
      setPlaybackError(null);
      setProgress({ currentTime: 0, duration: 0 });
      try {
        const response = await fetchSearchResults(query);
        setResults(response.results);
      } catch (err: any) {
        setPageError(err.message || 'Failed to fetch search results.');
      } finally {
        setIsLoadingResults(false);
      }
    };
    performSearch();
  }, [query]);

  const playAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setPlaybackError('Error playing audio: ' + (e.message || 'Playback failed.'));
        setIsPlaying(false);
      });
    }
  }, []);

  useEffect(() => { // Effect for HTML5 audio player control
    const audioElement = audioRef.current;
    if (audioElement) {
      if (isPlaying && streamUrl) {
        if (audioElement.src !== streamUrl) {
          audioElement.src = streamUrl;
          audioElement.load(); // Load the new source
        }
        playAudio(); // Attempt to play
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying, streamUrl, playAudio]);

  const handlePlayPause = async (track: SearchResult) => {
    setPlaybackError(null); // Clear previous playback errors
    if (selectedTrack?.videoId === track.videoId) {
      setIsPlaying(!isPlaying); // Toggle play/pause for the same track
    } else {
      setSelectedTrack(track);
      setIsPlaying(false); // Will be set to true by useEffect once streamUrl is ready
      setIsLoadingMedia(true);
      setStreamUrl(null); // Clear previous stream URL
      setProgress({ currentTime: 0, duration: 0 }); // Reset progress
      try {
        const info = await fetchMediaInfo(track.videoId);
        const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || (f.audioCodec && f.audioCodec !== 'none'));
        if (audioFormat?.url) {
          setStreamUrl(audioFormat.url); // This will trigger the useEffect for playback
          setIsPlaying(true); // Set isPlaying to true to initiate playback via useEffect
        } else {
          setPlaybackError('No suitable audio stream found.');
          console.warn('No suitable audio stream found for track:', track, 'Formats:', info.formats);
        }
      } catch (err: any) {
        setPlaybackError(err.message || 'Failed to fetch media details.');
        console.error('Error fetching media details:', err);
      } finally {
        setIsLoadingMedia(false);
      }
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress({
        currentTime: audioRef.current.currentTime,
        duration: audioRef.current.duration || 0,
      });
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setProgress(prev => ({ ...prev, duration: audioRef.current?.duration || 0 }));
    }
  };

  const onAudioEnded = () => {
    setIsPlaying(false);
    // Consider what happens on end: clear track, play next, loop? For now, just stop.
    // setProgress({ currentTime: progress.duration, duration: progress.duration }); // Mark as ended
  };

  const progressPercent = progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0;

  // Page loading/error/empty states for search results
  if (isLoadingResults) {
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
  if (pageError) {
     return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'>
        <p className='text-error-primary text-lg mb-sm'>Error fetching results</p>
        <p className='text-text-secondary mb-lg'>{pageError}</p>
        <button
          onClick={() => navigate('/')}
          className='px-lg py-sm bg-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (results.length === 0 && query && !isLoadingResults) {
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

  if (!query && !isLoadingResults) {
     return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'>
        <p className='text-text-primary text-xl mb-sm'>Please enter a search term to begin.</p>
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
      <div className='grid grid-cols-1 gap-md mb-24'> {/* Increased mb for more mini player space */}
        {results.map(item => (
          <MusicCard
            key={item.id + item.videoId} // Ensure unique key
            item={item}
            onPlayPause={handlePlayPause}
            isPlaying={selectedTrack?.videoId === item.videoId && isPlaying}
            isLoading={selectedTrack?.videoId === item.videoId && isLoadingMedia}
          />
        ))}
      </div>

      <audio
        ref={audioRef}
        className='hidden' // Make it invisible
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onAudioEnded}
        onError={(e) => { // More specific error handling for audio element itself
          console.error('HTML Audio Element Error:', e);
          setPlaybackError('Audio playback error.');
          setIsPlaying(false);
        }}
        onCanPlay={() => { // Useful for debugging if play() is called too early
          if (isPlaying && audioRef.current?.paused) { // If supposed to be playing but is paused, try playing
             playAudio();
          }
        }}
      />

      {selectedTrack && (
        <div className='fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border-primary p-sm shadow-lg z-50'>
          <div className='flex items-center justify-between mb-xs'>
            <div className='flex items-center min-w-0 flex-1 mr-sm'>
              <img src={selectedTrack.thumbnail || 'https://via.placeholder.com/40'} alt={selectedTrack.title} className='w-10 h-10 rounded-sm mr-sm flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='text-text-primary text-sm font-medium truncate' title={selectedTrack.title}>{selectedTrack.title}</p>
                <p className='text-text-secondary text-xs truncate' title={selectedTrack.channel}>{selectedTrack.channel}</p>
              </div>
            </div>
            <button
              onClick={() => handlePlayPause(selectedTrack)}
              className='p-2 text-text-primary hover:text-accent-primary flex-shrink-0'
              disabled={isLoadingMedia && selectedTrack?.videoId === selectedTrack.videoId} // Disable while loading this specific track
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {(isLoadingMedia && selectedTrack?.videoId === selectedTrack.videoId) ? (
                <svg className='animate-spin h-7 w-7 text-text-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
              ) : (
                <Icon name={isPlaying ? 'Pause' : 'Play'} size={28} />
              )}
            </button>
          </div>
          {/* Progress Bar */}
          <div className='h-1 bg-bg-tertiary rounded-full w-full'>
            <div
              className='h-full bg-accent-primary rounded-full'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {playbackError && !isLoadingMedia && ( // Show playback error only if not currently loading this track
            <p className='text-error-primary text-xs mt-xs text-center'>{playbackError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
