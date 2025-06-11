import React, { useEffect, useState, useCallback } from 'react'; // Removed useRef
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchResult, MediaInfo, WebLibraryItem } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { fetchSearchResults, fetchMediaInfo, fetchDownloadLink } from '../services/apiService';
import { saveWebLibraryItem } from '../services/webLibraryStorageService';
// Icon is not directly used here anymore, only in MusicCard and DownloadOptionsPopover
import DownloadOptionsPopover, { DownloadOption } from '../components/modals/DownloadOptionsPopover';
import { useWebPlayback } from '../context/PlaybackContext'; // Import context

// PlaybackProgress interface is now in PlaybackContext (PlaybackProgressState)

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    playTrack,
    currentTrack: contextCurrentTrack,
    isLoading: contextIsLoading,
    isPlaying: contextIsPlaying
  } = useWebPlayback();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  // Download options states (remain local to this page)
  const [downloadPopoverAnchor, setDownloadPopoverAnchor] = useState<HTMLElement | null>(null);
  const [trackForDownloadOptions, setTrackForDownloadOptions] = useState<SearchResult | null>(null);
  const [mediaInfoForDownload, setMediaInfoForDownload] = useState<MediaInfo | null>(null);
  const [isLoadingDownloadOpts, setIsLoadingDownloadOpts] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // For download initiation feedback
  const [downloadError, setDownloadError] = useState<string | null>(null); // For download error feedback

  // REMOVED: selectedTrack, streamUrl, isPlaying, isLoadingMedia, playbackError, progress, audioRef states
  // REMOVED: useEffect for audio player control, playAudioInternal, onTimeUpdate, onLoadedMetadata, onAudioEnded
  // REMOVED: handlePlayPause (will use context.playTrack directly from MusicCard)

  useEffect(() => {
    if (!query) {
      setIsLoadingResults(false);
      setResults([]);
      return;
    }
    const performSearch = async () => {
      setIsLoadingResults(true);
      setPageError(null);
      setResults([]);
      // Reset download specific states as well, but playback state is global
      setDownloadPopoverAnchor(null);
      setTrackForDownloadOptions(null);
      setMediaInfoForDownload(null);
      setIsLoadingDownloadOpts(false);
      setDownloadError(null);
      setIsDownloading(false);
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

  const handleOpenDownloadOptions = async (track: SearchResult, anchorEl: HTMLElement) => {
    setTrackForDownloadOptions(track);
    setDownloadPopoverAnchor(anchorEl);
    if (mediaInfoForDownload?.videoId === track.videoId) {
      setIsLoadingDownloadOpts(false);
      return;
    }
    // Also check if the currently playing track's mediaInfo (if available in context, not directly though) matches
    // For now, just fetch if not locally cached for download popover.
    setIsLoadingDownloadOpts(true);
    try {
      const info = await fetchMediaInfo(track.videoId);
      setMediaInfoForDownload(info);
    } catch (error: any) {
      console.error('Error fetching media info for download options:', error);
      setMediaInfoForDownload(null);
      alert('Error fetching download details: ' + (error as Error).message);
    } finally {
      setIsLoadingDownloadOpts(false);
    }
  };

  const handleSelectDownloadOption = async (option: DownloadOption) => { /* ... same as previous step ... */
    setDownloadPopoverAnchor(null);
    if (!trackForDownloadOptions) return;
    const currentTrack = trackForDownloadOptions;
    setIsDownloading(true);
    setDownloadError(null);
    console.log(`Initiating download for ${currentTrack.title}: ${option.label}`);
    try {
      const { downloadUrl, fileName: suggestedFileName } = await fetchDownloadLink({
        videoId: currentTrack.videoId,
        format: option.format,
        quality: option.quality,
      });
      const link = document.createElement('a');
      link.href = downloadUrl;
      const safeTitle = currentTrack.title.replace(/[^a-zA-Z0-9\s-_.]/g, '').replace(/[\s.]+/g, '_');
      const extension = option.format === 'mp3' ? 'mp3' : 'mp4';
      link.download = suggestedFileName || `${safeTitle}_${option.quality}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`Download triggered for ${currentTrack.title} as ${link.download}`);
      const libraryItemData: WebLibraryItem = {
        id: `${currentTrack.videoId}_${option.format}_${option.quality}`,
        videoId: currentTrack.videoId,
        title: currentTrack.title,
        channel: currentTrack.channel,
        thumbnail: currentTrack.thumbnail,
        initiatedAt: new Date().toISOString(),
        format: option.format,
        quality: option.quality,
        originalDownloadUrl: downloadUrl,
        fileName: link.download,
      };
      saveWebLibraryItem(libraryItemData);
    } catch (error: any) {
      console.error('Download initiation error:', error);
      setDownloadError(error.message || 'Failed to start download.');
      alert(`Download failed for ${currentTrack.title}: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Page loading/error/empty states for search results
  if (isLoadingResults) {
    return ( <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md'> <svg className='animate-spin h-10 w-10 text-accent-primary dark:text-dark-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg> <p className='text-text-secondary dark:text-dark-text-secondary mt-sm'>Loading results for "{query}"...</p> </div> );
  }
  if (pageError) {
    return ( <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'><p className='text-error-primary dark:text-dark-error-primary text-lg mb-sm'>Error fetching results</p><p className='text-text-secondary dark:text-dark-text-secondary mb-lg'>{pageError}</p><button onClick={() => navigate('/')} className='px-lg py-sm bg-accent-primary dark:bg-dark-accent-primary text-white dark:text-dark-text-primary rounded-md hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-colors'>Back to Home</button></div> );
  }
  if (results.length === 0 && query && !isLoadingResults) {
    return ( <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'><p className='text-text-primary dark:text-dark-text-primary text-xl mb-sm'>No results found for "{query}"</p><p className='text-text-secondary dark:text-dark-text-secondary mb-lg'>Try a different search term.</p><button onClick={() => navigate('/')} className='px-lg py-sm bg-accent-primary dark:bg-dark-accent-primary text-white dark:text-dark-text-primary rounded-md hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-colors'>Back to Home</button></div> );
  }
  if (!query && !isLoadingResults) {
    return ( <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'><p className='text-text-primary dark:text-dark-text-primary text-xl mb-sm'>Please enter a search term.</p><button onClick={() => navigate('/')} className='px-lg py-sm bg-accent-primary dark:bg-dark-accent-primary text-white dark:text-dark-text-primary rounded-md hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-colors'>Back to Home</button></div> );
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
            onPlayPause={() => playTrack(item)} // Use context's playTrack
            isPlaying={contextCurrentTrack?.videoId === item.videoId && contextIsPlaying}
            isLoading={contextCurrentTrack?.videoId === item.videoId && contextIsLoading}
            onOpenDownloadOptions={handleOpenDownloadOptions}
          />
        ))}
      </div>

      {/* Removed <audio> tag and <EnhancedPlayer /> - handled by AppLayout and PlaybackContext */}

      {isDownloading && ( <div className='fixed top-4 right-4 bg-accent-secondary text-white px-md py-sm rounded-md shadow-lg z-[1001] animate-pulse'> <p>Preparing download...</p> </div> )}
      {downloadError && ( <div className='fixed top-4 right-4 bg-error-primary text-white px-md py-sm rounded-md shadow-lg z-[1001]'> <p>Error: {downloadError}</p> </div> )}
      {downloadPopoverAnchor && trackForDownloadOptions && (
        <DownloadOptionsPopover
          anchorElement={downloadPopoverAnchor}
          mediaInfo={mediaInfoForDownload}
          isLoading={isLoadingDownloadOpts}
          onClose={() => { setDownloadPopoverAnchor(null); }}
          onSelectOption={handleSelectDownloadOption}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
