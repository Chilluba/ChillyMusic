import React from 'react';
import { SearchResult, DownloadedMediaItem } from '../../types'; // Assuming PlayerScreenTrack can be represented by these
import Icon from '../ui/Icon';

export type PlayerTrack = SearchResult | DownloadedMediaItem; // Or a specific combined type

interface PlaybackProgress {
  currentTime: number;
  duration: number;
}

interface EnhancedPlayerProps {
  track: PlayerTrack | null;
  isPlaying: boolean;
  progress: PlaybackProgress;
  // isLoadingMedia: boolean; // Could be useful for showing loading on player
  // error: string | null;
  onPlayPause: () => void;
  onClose?: () => void; // If it's a modal or can be hidden
  // onSeek: (time: number) => void; // For later with interactive progress bar
}

const EnhancedPlayer: React.FC<EnhancedPlayerProps> = ({
  track,
  isPlaying,
  progress,
  onPlayPause,
  onClose,
}) => {
  if (!track) return null;

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0;
  const albumArtUrl = track.thumbnail || 'https://via.placeholder.com/300'; // Use track thumbnail

  // For web, title might be in track.title, channel in track.channel
  // For DownloadedMediaItem, it's track.title and track.channel
  const displayTitle = track.title;
  // Check if 'channel' property exists, common for SearchResult
  // For DownloadedMediaItem, it might also have 'channel', or an 'artist' field if adapted.
  const displayArtist = 'channel' in track ? track.channel : ((track as any).artist || 'Unknown Artist');


  return (
    // This could be a modal or a fixed/absolute positioned div.
    // For now, a fixed overlay at the bottom, but larger than the mini-player.
    <div className='fixed inset-x-0 bottom-0 bg-bg-secondary border-t border-border-primary shadow-2xl z-50 p-md transform transition-transform duration-300 ease-out translate-y-0'>
      {onClose && (
        <button
          onClick={onClose}
          className='absolute top-sm right-sm p-1 text-text-muted hover:text-text-primary z-10'
          aria-label='Close player'
        >
          <Icon name='Close' size={20} />
        </button>
      )}
      <div className='flex items-center'>
        <img src={albumArtUrl} alt={displayTitle} className='w-20 h-20 md:w-24 md:h-24 rounded-md mr-md shadow-md flex-shrink-0' />
        <div className='flex-1 min-w-0'>
          <p className='text-lg md:text-xl font-bold text-text-primary truncate' title={displayTitle}>{displayTitle}</p>
          <p className='text-sm md:text-base text-text-secondary truncate' title={displayArtist}>{displayArtist}</p>

          {/* Progress Bar & Time */}
          <div className='mt-sm'>
            <div className='h-1.5 bg-bg-tertiary rounded-full w-full'>
              <div
                className='h-full bg-accent-primary rounded-full'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className='flex justify-between text-xs text-text-muted mt-1'>
              <span>{formatTime(progress.currentTime)}</span>
              <span>{formatTime(progress.duration)}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center pl-md ml-auto flex-shrink-0'>
          <button onClick={() => {/* Placeholder for Skip Prev */}} className='p-2 text-text-primary hover:text-accent-primary disabled:opacity-50' disabled>
            <Icon name='SkipBack' size={28} />
          </button>
          <button
            onClick={onPlayPause}
            className='p-2 mx-sm bg-accent-primary text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shadow-lg hover:bg-opacity-80'
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={28} />
          </button>
          <button onClick={() => {/* Placeholder for Skip Next */}} className='p-2 text-text-primary hover:text-accent-primary disabled:opacity-50' disabled>
            <Icon name='SkipForward' size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlayer;
