import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchResult, MediaInfo, WebLibraryItem } from '../types';
import MusicCard from '../components/cards/MusicCard';
import { fetchSearchResults, fetchMediaInfo, fetchDownloadLink } from '../services/apiService';
import { saveWebLibraryItem } from '../services/webLibraryStorageService';
import Icon from '../components/ui/Icon';
import DownloadOptionsPopover, { DownloadOption } from '../components/modals/DownloadOptionsPopover';
import EnhancedPlayer, { PlayerTrack } from '../components/player/EnhancedPlayer'; // Import EnhancedPlayer

interface PlaybackProgress { currentTime: number; duration: number; }

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [selectedTrack, setSelectedTrack] = useState<PlayerTrack | null>(null); // Now PlayerTrack
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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

  const playAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setPlaybackError('Error playing audio: ' + (e.message || 'Playback failed.'));
        setIsPlaying(false);
      });
    }
  }, []);

  useEffect(() => {
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

  // Ensure track type is PlayerTrack for handlePlayPause
  const handlePlayPause = async (track: PlayerTrack) => {
    setPlaybackError(null);
    if (selectedTrack?.videoId === track.videoId && selectedTrack.id === track.id) {
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

  const handleOpenDownloadOptions = async (track: SearchResult, anchorEl: HTMLElement) => {
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

  const handleSelectDownloadOption = async (option: DownloadOption) => { /* ... same as before ... */
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

  // const progressPercent = progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0; // Used by EnhancedPlayer

  if (isLoadingResults) { /* ... */ }
  if (pageError) { /* ... */ }
  if (results.length === 0 && query && !isLoadingResults) { /* ... */ }
  if (!query && !isLoadingResults) { /* ... */ }

  return (
    <div className='p-md pb-32'> {/* Ensure padding-bottom for EnhancedPlayer */}
      <h2 className='text-h1 font-bold text-text-primary mb-md'>
        Search Results for: <span className='text-accent-primary'>{query}</span>
      </h2>
      <div className='grid grid-cols-1 gap-md'> {/* Removed mb-24, EnhancedPlayer is fixed */}
        {results.map(item => (
          <MusicCard
            key={item.id + item.videoId}
            item={item}
            onPlayPause={() => handlePlayPause(item)} // item is SearchResult, compatible with PlayerTrack
            isPlaying={selectedTrack?.videoId === item.videoId && isPlaying}
            isLoading={selectedTrack?.videoId === item.videoId && isLoadingMedia}
            onOpenDownloadOptions={handleOpenDownloadOptions}
          />
        ))}
      </div>

      <audio ref={audioRef} className='hidden' onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={onAudioEnded} onError={(e) => { console.error('HTML Audio Element Error:', e); setPlaybackError('Audio playback error.'); setIsPlaying(false); }} onCanPlay={() => { if (isPlaying && audioRef.current?.paused) { playAudio(); }}} />

      {/* Replace Mini Player with EnhancedPlayer */}
      <EnhancedPlayer
        track={selectedTrack} // selectedTrack is PlayerTrack | null
        isPlaying={isPlaying}
        progress={progress}
        onPlayPause={() => selectedTrack && handlePlayPause(selectedTrack)}
        onClose={() => { setSelectedTrack(null); setIsPlaying(false); setStreamUrl(null); }}
      />

      {isDownloading && ( /* ... Download status feedback ... */ )}
      {downloadError && ( /* ... Download error feedback ... */ )}
      {downloadPopoverAnchor && trackForDownloadOptions && ( /* ... Download options popover ... */ )}
    </div>
  );
};
// Full styles and loading/error/empty states need to be included here by the subtask worker
// For brevity, only showing the conceptual structure.
// The existing full return structure for loading/error/empty states should be preserved.

export default SearchResultsPage;
