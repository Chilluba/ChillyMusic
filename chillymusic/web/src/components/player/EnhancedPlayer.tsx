import React, { useState, useEffect, MouseEvent } from 'react';
import Icon from '../ui/Icon';
import { useWebPlayback } from '../../context/PlaybackContext';
import DownloadOptionsPopover, { DownloadOption } from '../modals/DownloadOptionsPopover';
import { fetchMediaInfo, fetchDownloadLink } from '../../services/apiService';
import { MediaInfo, PlayerTrack, WebLibraryItem } from '../../types';
import { saveWebLibraryItem } from '../../services/webLibraryStorageService';

interface EnhancedPlayerProps {
  onCloseProp?: () => void;
}

const EnhancedPlayer: React.FC<EnhancedPlayerProps> = ({ onCloseProp }) => {
  const {
    currentTrack,
    isPlaying,
    progress,
    isLoading: isLoadingPlayback,
    error: playbackError,
    togglePlayPause,
    clearPlayer,
    // seekTo
  } = useWebPlayback();

  const [downloadPopoverAnchor, setDownloadPopoverAnchor] = useState<HTMLElement | null>(null);
  const [mediaInfoForDownloadOpts, setMediaInfoForDownloadOpts] = useState<MediaInfo | null>(null);
  const [isLoadingDownloadOpts, setIsLoadingDownloadOpts] = useState(false);
  const [isInitiatingDownload, setIsInitiatingDownload] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const progressPercent = progress.seekableDuration > 0 ? (progress.currentTime / progress.seekableDuration) * 100 : 0;

  const handleOpenDownloadOptions = async (event: MouseEvent<HTMLButtonElement>) => {
    if (!currentTrack) return;
    setDownloadPopoverAnchor(event.currentTarget);
    setIsLoadingDownloadOpts(true);
    setDownloadError(null);
    try {
      // Use cached mediaInfo if available and for the same track, otherwise fetch
      if (mediaInfoForDownloadOpts?.videoId === currentTrack.videoId) {
          setIsLoadingDownloadOpts(false);
          return;
      }
      const info = await fetchMediaInfo(currentTrack.videoId);
      setMediaInfoForDownloadOpts(info);
    } catch (error: any) {
      console.error('EnhancedPlayer: Error fetching media info for download options:', error);
      setMediaInfoForDownloadOpts(null);
      setDownloadError('Could not fetch download options.'); // Set specific error for download UI
    } finally {
      setIsLoadingDownloadOpts(false);
    }
  };

  const handleSelectDownloadOption = async (option: DownloadOption) => {
    setDownloadPopoverAnchor(null);
    if (!currentTrack) return;

    setIsInitiatingDownload(true);
    setDownloadError(null);
    console.log(`EnhancedPlayer: Download selected for ${currentTrack.title}: ${option.label}`);

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
        videoId: currentTrack.videoId, title: currentTrack.title, channel: 'channel' in currentTrack ? currentTrack.channel : undefined,
        thumbnail: currentTrack.thumbnail, initiatedAt: new Date().toISOString(),
        format: option.format, quality: option.quality, originalDownloadUrl: downloadUrl, fileName: link.download,
      };
      saveWebLibraryItem(libraryItemData);

    } catch (error: any) {
      console.error('EnhancedPlayer: Download initiation error:', error);
      setDownloadError(error.message || 'Failed to start download.');
    } finally {
      setIsInitiatingDownload(false);
    }
  };

  const handleClosePlayer = () => {
    clearPlayer();
    if (onCloseProp) onCloseProp();
  };

  if (!currentTrack) return null;

  const albumArtUrl = currentTrack.thumbnail || 'https://via.placeholder.com/300';
  const displayTitle = currentTrack.title;
  const displayArtist = 'channel' in currentTrack ? currentTrack.channel : ((currentTrack as any).artist || 'Unknown Artist');

  return (
    <>
      <div className='fixed inset-x-0 bottom-0 bg-bg-secondary dark:bg-dark-bg-secondary border-t border-border-primary dark:border-dark-border-primary shadow-2xl z-50 p-md transform transition-transform duration-300 ease-out translate-y-0'>
        <button onClick={handleClosePlayer} className='absolute top-sm right-sm p-1 text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary z-10' aria-label='Close player'><Icon name='Close' size={20} /></button>
        <div className='flex items-start md:items-center'>
          <img src={albumArtUrl} alt={displayTitle} className='w-16 h-16 md:w-24 md:h-24 rounded-md mr-sm md:mr-md shadow-md flex-shrink-0' />
          <div className='flex-1 min-w-0 pt-1 md:pt-0'>
            <p className='text-md md:text-xl font-bold text-text-primary dark:text-dark-text-primary truncate' title={displayTitle}>{displayTitle}</p>
            <p className='text-xs md:text-base text-text-secondary dark:text-dark-text-secondary truncate' title={displayArtist}>{displayArtist}</p>

            {(isLoadingPlayback && !playbackError) && <p className='text-xs text-accent-primary dark:text-dark-accent-primary mt-1'>Loading audio...</p>}
            {playbackError && <p className='text-xs text-error-primary dark:text-dark-error-primary mt-1 truncate' title={playbackError}>Playback Error: {playbackError}</p>}
            {downloadError && <p className='text-xs text-error-primary dark:text-dark-error-primary mt-1 truncate' title={downloadError}>Download Error: {downloadError}</p>}

            <div className='mt-xs md:mt-sm'>
              <div className='h-1.5 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-full w-full'><div className='h-full bg-accent-primary dark:bg-dark-accent-primary rounded-full transition-all duration-200 ease-linear' style={{ width: `${progressPercent}%` }} /></div>
              <div className='flex justify-between text-xs text-text-muted dark:text-dark-text-muted mt-1'><span>{formatTime(progress.currentTime)}</span><span>{formatTime(progress.seekableDuration)}</span></div>
            </div>
          </div>
          <div className='flex items-center pl-sm md:pl-md ml-auto flex-shrink-0 self-center'>
            <button className='p-1 md:p-2 text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50' disabled><Icon name='SkipBack' size={24} /></button>
            <button onClick={togglePlayPause} className='p-1 md:p-2 mx-xs md:mx-sm bg-accent-primary dark:bg-dark-accent-primary text-white dark:text-dark-text-primary rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg hover:bg-opacity-80 dark:hover:bg-opacity-80 disabled:opacity-50' aria-label={isPlaying ? 'Pause' : 'Play'} disabled={isLoadingPlayback || !currentTrack || !!playbackError}>
              {isLoadingPlayback ? ( <svg className='animate-spin h-6 w-6 text-white dark:text-dark-text-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'></circle><path d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' className='opacity-75' fill='currentColor'></path></svg> ) : ( <Icon name={isPlaying ? 'Pause' : 'Play'} size={24} className='text-white dark:text-dark-text-primary' /> )}
            </button>
            <button className='p-1 md:p-2 text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50' disabled><Icon name='SkipForward' size={24} /></button>
          </div>
        </div>
        <div className='mt-sm pt-sm border-t border-border-primary dark:border-dark-border-primary flex justify-around items-center'>
            <button onClick={() => alert('Repeat TBD')} className='p-1 text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50' disabled={!currentTrack}> <Icon name='Repeat' size={20} /> </button>
            <button onClick={handleOpenDownloadOptions} className='p-1 text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50' disabled={!currentTrack || isInitiatingDownload || isLoadingDownloadOpts} aria-label='Download options'>
                {isInitiatingDownload || isLoadingDownloadOpts ? <svg className='animate-spin h-5 w-5 text-accent-primary dark:text-dark-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'></circle><path d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' className='opacity-75' fill='currentColor'></path></svg>
                                                         : <Icon name='Download' size={20} />}
            </button>
            <button onClick={() => alert('Favorite TBD')} className='p-1 text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50' disabled={!currentTrack}> <Icon name='Heart' size={20} /> </button>
            <button onClick={() => alert('Playlist TBD')} className='p-1 text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50' disabled={!currentTrack}> <Icon name='PlaylistAdd' size={20} /> </button>
        </div>
      </div>
      {downloadPopoverAnchor && currentTrack && (
        <DownloadOptionsPopover
          anchorElement={downloadPopoverAnchor}
          mediaInfo={mediaInfoForDownloadOpts}
          isLoading={isLoadingDownloadOpts}
          onClose={() => { setDownloadPopoverAnchor(null); /* setMediaInfoForDownloadOpts(null); */ setDownloadError(null); }}
          onSelectOption={handleSelectDownloadOption}
        />
      )}
    </>
  );
};

export default EnhancedPlayer;
