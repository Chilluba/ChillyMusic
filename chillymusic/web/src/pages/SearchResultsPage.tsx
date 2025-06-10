import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchResult, MediaInfo } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { fetchSearchResults, fetchMediaInfo, fetchDownloadLink } from '../services/apiService'; // Added fetchDownloadLink
import Icon from '../components/ui/Icon';
import DownloadOptionsPopover, { DownloadOption } from '../components/modals/DownloadOptionsPopover';

interface PlaybackProgress { currentTime: number; duration: number; }

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [selectedTrack, setSelectedTrack] = useState<SearchResult | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [progress, setProgress] = useState<PlaybackProgress>({ currentTime: 0, duration: 0 });

  const audioRef = useRef<HTMLAudioElement>(null);
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  const [downloadPopoverAnchor, setDownloadPopoverAnchor] = useState<HTMLElement | null>(null);
  const [trackForDownloadOptions, setTrackForDownloadOptions] = useState<SearchResult | null>(null);
  const [mediaInfoForDownload, setMediaInfoForDownload] = useState<MediaInfo | null>(null);
  const [isLoadingDownloadOpts, setIsLoadingDownloadOpts] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // For global download state feedback
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => { // Effect for fetching search results
    if (!query) {
      setIsLoadingResults(false);
      setResults([]);
      return;
    }
    const performSearch = async () => {
      setIsLoadingResults(true);
      setPageError(null);
      setResults([]);
      setSelectedTrack(null); setStreamUrl(null); setIsPlaying(false); setPlaybackError(null); setProgress({ currentTime: 0, duration: 0 });
      setDownloadPopoverAnchor(null); setTrackForDownloadOptions(null); setMediaInfoForDownload(null); setIsLoadingDownloadOpts(false);
      setDownloadError(null); setIsDownloading(false);
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

  const playAudio = useCallback(() => { /* ... from previous step ... */
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setPlaybackError('Error playing audio: ' + (e.message || 'Playback failed.'));
        setIsPlaying(false);
      });
    }
  }, []);

  useEffect(() => { /* ... from previous step ... */
    const audioElement = audioRef.current;
    if (audioElement) {
      if (isPlaying && streamUrl) {
        if (audioElement.src !== streamUrl) {
          audioElement.src = streamUrl;
          audioElement.load();
        }
        playAudio();
      } else {
        audioElement.pause();
      }
    }
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [isPlaying, streamUrl, playAudio]);

  const handlePlayPause = async (track: SearchResult) => { /* ... from previous step ... */
    setPlaybackError(null);
    if (selectedTrack?.videoId === track.videoId) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedTrack(track);
      setIsPlaying(false);
      setIsLoadingMedia(true);
      setStreamUrl(null);
      setProgress({ currentTime: 0, duration: 0 });
      try {
        const info = await fetchMediaInfo(track.videoId);
        setMediaInfoForDownload(info);
        const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || (f.audioCodec && f.audioCodec !== 'none'));
        if (audioFormat?.url) {
          setStreamUrl(audioFormat.url);
          setIsPlaying(true);
        } else {
          setPlaybackError('No suitable audio stream found.');
        }
      } catch (err: any) {
        setPlaybackError(err.message || 'Failed to fetch media details.');
      } finally {
        setIsLoadingMedia(false);
      }
    }
  };

  const onTimeUpdate = () => { if (audioRef.current) setProgress({ currentTime: audioRef.current.currentTime, duration: audioRef.current.duration || 0 }); };
  const onLoadedMetadata = () => { if (audioRef.current) setProgress(prev => ({ ...prev, duration: audioRef.current?.duration || 0 })); };
  const onAudioEnded = () => { setIsPlaying(false); };

  const handleOpenDownloadOptions = async (track: SearchResult, anchorEl: HTMLElement) => { /* ... from previous step ... */
    setTrackForDownloadOptions(track);
    setDownloadPopoverAnchor(anchorEl);
    if (mediaInfoForDownload?.videoId === track.videoId) {
      setIsLoadingDownloadOpts(false);
      return;
    }
    setIsLoadingDownloadOpts(true);
    try {
      const info = await fetchMediaInfo(track.videoId);
      setMediaInfoForDownload(info);
    } catch (error: any) {
      console.error('Error fetching media info for download options:', error);
      setMediaInfoForDownload(null);
    } finally {
      setIsLoadingDownloadOpts(false);
    }
  };

  const handleSelectDownloadOption = async (option: DownloadOption) => {
    setDownloadPopoverAnchor(null);
    if (!trackForDownloadOptions) return;

    const currentTrack = trackForDownloadOptions;
    setIsDownloading(true);
    setDownloadError(null);

    console.log(`Initiating download for ${currentTrack.title}: ${option.label}`);
    // alert(`Starting download: ${currentTrack.title} - ${option.label}`); // Using console log for less intrusive UI

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
      // Using console log instead of alert for better UX
      // alert(`Download started for ${currentTrack.title}!`);

    } catch (error: any) {
      console.error('Download initiation error:', error);
      setDownloadError(error.message || 'Failed to start download.');
      alert(`Download failed for ${currentTrack.title}: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
      // setTrackForDownloadOptions(null); // Keep context for a bit
    }
  };

  const progressPercent = progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0;

  if (isLoadingResults) { /* ... same loading display as before ... */
    return ( <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md'> <svg className='animate-spin h-10 w-10 text-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg> <p className='text-text-secondary mt-sm'>Loading results for "{query}"...</p> </div> );
  }
  if (pageError) { /* ... same error display as before ... */
    return ( <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'><p className='text-error-primary text-lg mb-sm'>Error fetching results</p><p className='text-text-secondary mb-lg'>{pageError}</p><button onClick={() => navigate('/')} className='px-lg py-sm bg-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'>Back to Home</button></div> );
  }
  if (results.length === 0 && query && !isLoadingResults) { /* ... same no results display as before ... */
    return ( <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'><p className='text-text-primary text-xl mb-sm'>No results found for "{query}"</p><p className='text-text-secondary mb-lg'>Try a different search term.</p><button onClick={() => navigate('/')} className='px-lg py-sm bg-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'>Back to Home</button></div> );
  }
  if (!query && !isLoadingResults) { /* ... same no query display as before ... */
    return ( <div className='flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-md text-center'><p className='text-text-primary text-xl mb-sm'>Please enter a search term.</p><button onClick={() => navigate('/')} className='px-lg py-sm bg-accent-primary text-white rounded-md hover:bg-opacity-80 transition-colors'>Back to Home</button></div> );
  }

  return (
    <div className='p-md'>
      <h2 className='text-h1 font-bold text-text-primary mb-md'>
        Search Results for: <span className='text-accent-primary'>{query}</span>
      </h2>
      <div className='grid grid-cols-1 gap-md mb-24'>
        {results.map(item => (
          <MusicCard
            key={item.id + item.videoId}
            item={item}
            onPlayPause={handlePlayPause}
            isPlaying={selectedTrack?.videoId === item.videoId && isPlaying}
            isLoading={selectedTrack?.videoId === item.videoId && isLoadingMedia}
            onOpenDownloadOptions={handleOpenDownloadOptions}
          />
        ))}
      </div>

      <audio ref={audioRef} className='hidden' onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={onAudioEnded} onError={(e) => { console.error('HTML Audio Element Error:', e); setPlaybackError('Audio playback error.'); setIsPlaying(false); }} onCanPlay={() => { if (isPlaying && audioRef.current?.paused) { playAudio(); }}} />

      {selectedTrack && ( /* Mini Player ... same as before ... */
        <div className='fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border-primary p-sm shadow-lg z-50'><div className='flex items-center justify-between mb-xs'><div className='flex items-center min-w-0 flex-1 mr-sm'><img src={selectedTrack.thumbnail || 'https://via.placeholder.com/40'} alt={selectedTrack.title} className='w-10 h-10 rounded-sm mr-sm flex-shrink-0' /><div className='flex-1 min-w-0'><p className='text-text-primary text-sm font-medium truncate' title={selectedTrack.title}>{selectedTrack.title}</p><p className='text-text-secondary text-xs truncate' title={selectedTrack.channel}>{selectedTrack.channel}</p></div></div><button onClick={() => handlePlayPause(selectedTrack)} className='p-2 text-text-primary hover:text-accent-primary flex-shrink-0' disabled={isLoadingMedia && selectedTrack?.videoId === selectedTrack.videoId} aria-label={isPlaying ? 'Pause' : 'Play'}>{(isLoadingMedia && selectedTrack?.videoId === selectedTrack.videoId) ? (<svg className='animate-spin h-7 w-7 text-text-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg>) : (<Icon name={isPlaying ? 'Pause' : 'Play'} size={28} />)}</button></div><div className='h-1 bg-bg-tertiary rounded-full w-full'><div className='h-full bg-accent-primary rounded-full' style={{ width: `${progressPercent}%` }} /></div>{playbackError && !isLoadingMedia && (<p className='text-error-primary text-xs mt-xs text-center'>{playbackError}</p>)}</div>
      )}

      {/* Global download status feedback (very basic) */}
      {isDownloading && (
        <div className='fixed top-4 right-4 bg-accent-secondary text-white px-md py-sm rounded-md shadow-lg z-[1001] animate-pulse'>
          <p>Preparing download...</p>
        </div>
      )}
      {downloadError && (
         <div className='fixed top-4 right-4 bg-error-primary text-white px-md py-sm rounded-md shadow-lg z-[1001]'>
            <p>Error: {downloadError}</p>
         </div>
      )}

      {downloadPopoverAnchor && trackForDownloadOptions && (
        <DownloadOptionsPopover
          anchorElement={downloadPopoverAnchor}
          mediaInfo={mediaInfoForDownload}
          isLoading={isLoadingDownloadOpts}
          onClose={() => {
            setDownloadPopoverAnchor(null);
            // setTrackForDownloadOptions(null); // Keep context if needed for error display or retry
          }}
          onSelectOption={handleSelectDownloadOption}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
