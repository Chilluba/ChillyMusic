import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchResult, MediaInfo, WebLibraryItem } from '../types';
import MusicCard from '../components/cards/MusicCard'; // Assumed to be theme-aware
import { fetchSearchResults, fetchMediaInfo, fetchDownloadLink } from '../services/apiService';
import { saveWebLibraryItem } from '../services/webLibraryStorageService';
import DownloadOptionsPopover, { DownloadOption } from '../components/modals/DownloadOptionsPopover'; // Assumed to be theme-aware
import { useWebPlayback } from '../context/PlaybackContext';
// Icon is used by MusicCard and DownloadOptionsPopover

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playTrack, currentTrack: contextCurrentTrack, isLoading: contextIsLoading, isPlaying: contextIsPlaying } = useWebPlayback();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  // Download options states - these remain as MusicCard triggers the popover locally on this page
  const [downloadPopoverAnchor, setDownloadPopoverAnchor] = useState<HTMLElement | null>(null);
  const [trackForDownloadOptions, setTrackForDownloadOptions] = useState<SearchResult | null>(null);
  const [mediaInfoForDownload, setMediaInfoForDownload] = useState<MediaInfo | null>(null);
  const [isLoadingDownloadOpts, setIsLoadingDownloadOpts] = useState(false);
  const [isInitiatingDownload, setIsInitiatingDownload] = useState(false); // For popover-initiated download
  const [downloadErrorFromPopover, setDownloadErrorFromPopover] = useState<string | null>(null); // For popover-initiated download


  useEffect(() => {
    if (!query) {
      setIsLoadingResults(false);
      setResults([]);
      return;
    }
    const performSearch = async () => {
      setIsLoadingResults(true); setPageError(null); setResults([]);
      // Reset download popover states on new search
      setDownloadPopoverAnchor(null); setTrackForDownloadOptions(null); setMediaInfoForDownload(null);
      setIsLoadingDownloadOpts(false); setDownloadErrorFromPopover(null); setIsInitiatingDownload(false);
      try {
        const response = await fetchSearchResults(query);
        setResults(response.results);
      } catch (err: any) { setPageError(err.message || 'Failed to fetch search results.'); }
      finally { setIsLoadingResults(false); }
    };
    performSearch();
  }, [query]);

  const handleOpenDownloadOptions = async (track: SearchResult, anchorEl: HTMLElement) => {
    setTrackForDownloadOptions(track);
    setDownloadPopoverAnchor(anchorEl);
    setDownloadErrorFromPopover(null); // Clear previous error
    if (mediaInfoForDownload?.videoId === track.videoId) {
      setIsLoadingDownloadOpts(false); return;
    }
    setIsLoadingDownloadOpts(true);
    try {
      const info = await fetchMediaInfo(track.videoId);
      setMediaInfoForDownload(info);
    } catch (error: any) {
      console.error('SRP: Error fetching media info for download options:', error);
      setMediaInfoForDownload(null);
      setDownloadErrorFromPopover("Could not fetch download options.");
    } finally { setIsLoadingDownloadOpts(false); }
  };

  // This function is still needed if downloads are initiated from popover on this page
  const handleSelectDownloadOption = async (option: DownloadOption) => {
    setDownloadPopoverAnchor(null);
    if (!trackForDownloadOptions) return;

    const currentTrack = trackForDownloadOptions;
    setIsInitiatingDownload(true);
    setDownloadErrorFromPopover(null);

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

      const libraryItemData: WebLibraryItem = {
        id: `${currentTrack.videoId}_${option.format}_${option.quality}`,
        videoId: currentTrack.videoId, title: currentTrack.title, channel: currentTrack.channel,
        thumbnail: currentTrack.thumbnail, initiatedAt: new Date().toISOString(),
        format: option.format, quality: option.quality, originalDownloadUrl: downloadUrl, fileName: link.download,
      };
      saveWebLibraryItem(libraryItemData);
      // Show a temporary success message for this specific download action
      alert(`Download for "${currentTrack.title}" initiated!`);

    } catch (error: any) {
      console.error('SRP: Download initiation error:', error);
      setDownloadErrorFromPopover(error.message || 'Failed to start download.');
      alert(`Download failed for "${currentTrack.title}": ${error.message || 'Unknown error'}`);
    } finally {
      setIsInitiatingDownload(false);
    }
  };


  if (isLoadingResults) {
    return <div className='p-md text-center text-text-secondary dark:text-dark-text-secondary min-h-[calc(100vh-120px)] flex justify-center items-center'><svg className='animate-spin h-10 w-10 text-accent-primary dark:text-dark-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'></circle><path d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' className='opacity-75' fill='currentColor'></path></svg></div>;
  }
  if (pageError) {
    return <div className='p-md text-center text-error-primary dark:text-dark-error-primary min-h-[calc(100vh-120px)] flex justify-center items-center'>Error: {pageError}</div>;
  }
  if (results.length === 0 && query && !isLoadingResults) {
    return <div className='p-md text-center text-text-primary dark:text-dark-text-primary min-h-[calc(100vh-120px)] flex justify-center items-center'>No results found for "{query}".</div>;
  }
  if (!query && !isLoadingResults) {
     return <div className='p-md text-center text-text-primary dark:text-dark-text-primary min-h-[calc(100vh-120px)] flex justify-center items-center'>Please enter a search term.</div>;
  }

  return (
    <div className='p-md text-text-primary dark:text-dark-text-primary'>
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
            isLoading={contextCurrentTrack?.videoId === item.videoId && contextIsLoading}
            onOpenDownloadOptions={handleOpenDownloadOptions}
          />
        ))}
      </div>

      {/* Download status feedback UI (if any, for popover initiated downloads) */}
      {isInitiatingDownload && ( <div className='fixed top-20 right-4 bg-accent-secondary text-white px-md py-sm rounded-md shadow-lg z-[1001] animate-pulse'> <p>Preparing download...</p> </div> )}
      {downloadErrorFromPopover && ( <div className='fixed top-20 right-4 bg-error-primary text-white px-md py-sm rounded-md shadow-lg z-[1001]'> <p>Error: {downloadErrorFromPopover}</p> </div> )}

      {downloadPopoverAnchor && trackForDownloadOptions && (
        <DownloadOptionsPopover
          anchorElement={downloadPopoverAnchor}
          mediaInfo={mediaInfoForDownload}
          isLoading={isLoadingDownloadOpts}
          onClose={() => { setDownloadPopoverAnchor(null); setTrackForDownloadOptions(null); setDownloadErrorFromPopover(null); }}
          onSelectOption={handleSelectDownloadOption}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
