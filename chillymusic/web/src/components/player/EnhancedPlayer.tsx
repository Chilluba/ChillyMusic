import React from 'react';
// PlayerTrack type is now part of useWebPlayback's currentTrack or can be imported from types
import Icon from '../ui/Icon';
import { useWebPlayback } from '../../context/PlaybackContext'; // Import context
import { PlayerTrack, PlaybackProgressState } from '../../context/PlaybackContext'; // Import types from context if defined there, or from types.ts

// Props are now largely from context, but onCloseProp can be passed for custom close actions
interface EnhancedPlayerProps {
  onCloseProp?: () => void;
}

const EnhancedPlayer: React.FC<EnhancedPlayerProps> = ({ onCloseProp }) => {
  const {
    currentTrack,
    isPlaying,
    progress,
    isLoading,
    error,
    togglePlayPause,
    clearPlayer,
    // seekTo // Add seekTo when slider is implemented
  } = useWebPlayback();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = progress.seekableDuration > 0 ? (progress.currentTime / progress.seekableDuration) * 100 : 0;
  const albumArtUrl = currentTrack.thumbnail || 'https://via.placeholder.com/300';
  const displayTitle = currentTrack.title;
  const displayArtist = 'channel' in currentTrack ? currentTrack.channel : ((currentTrack as any).artist || 'Unknown Artist');

  const handleClose = () => {
    clearPlayer();
    if (onCloseProp) onCloseProp();
  };

  return (
    <div className='fixed inset-x-0 bottom-0 bg-bg-secondary dark:bg-dark-bg-secondary border-t border-border-primary dark:border-dark-border-primary shadow-2xl z-50 p-md transform transition-transform duration-300 ease-out translate-y-0'>
      <button
        onClick={handleClose}
        className='absolute top-sm right-sm p-1 text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary z-10'
        aria-label='Close player'
      >
        <Icon name='Close' size={20} />
      </button>
      <div className='flex items-center'>
        <img src={albumArtUrl} alt={displayTitle} className='w-20 h-20 md:w-24 md:h-24 rounded-md mr-md shadow-md flex-shrink-0' />
        <div className='flex-1 min-w-0'>
          <p className='text-lg md:text-xl font-bold text-text-primary dark:text-dark-text-primary truncate' title={displayTitle}>{displayTitle}</p>
          <p className='text-sm md:text-base text-text-secondary dark:text-dark-text-secondary truncate' title={displayArtist}>{displayArtist}</p>

          {isLoading && <p className='text-xs text-accent-primary dark:text-dark-accent-primary mt-1'>Loading...</p>}
          {error && !isLoading && <p className='text-xs text-error-primary dark:text-dark-error-primary mt-1 truncate' title={error}>Error: {error}</p>}

          <div className='mt-sm'>
            <div className='h-1.5 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-full w-full'>
              <div
                className='h-full bg-accent-primary dark:bg-dark-accent-primary rounded-full transition-all duration-200 ease-linear'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className='flex justify-between text-xs text-text-muted dark:text-dark-text-muted mt-1'>
              <span>{formatTime(progress.currentTime)}</span>
              <span>{formatTime(progress.seekableDuration)}</span>
            </div>
          </div>
        </div>

        <div className='flex items-center pl-md ml-auto flex-shrink-0'>
          <button className='p-2 text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50' disabled>
            <Icon name='SkipBack' size={28} />
          </button>
          <button
            onClick={togglePlayPause}
            className='p-2 mx-sm bg-accent-primary dark:bg-dark-accent-primary text-white dark:text-dark-text-primary rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shadow-lg hover:bg-opacity-80 dark:hover:bg-opacity-80 disabled:opacity-50'
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={isLoading || !currentTrack || !!error} // Disable if loading, no track, or error
          >
            {isLoading ? (
              <svg className='animate-spin h-7 w-7 text-white dark:text-dark-text-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
            ) : (
              <Icon name={isPlaying ? 'Pause' : 'Play'} size={28} className='text-white dark:text-dark-text-primary' />
            )}
          </button>
          <button className='p-2 text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50' disabled>
            <Icon name='SkipForward' size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlayer;
