import React from 'react';
import { SearchResult } from '../../types';
import Icon from '../ui/Icon';

interface MusicCardProps {
  item: SearchResult;
  onPlayPause: (item: SearchResult) => void;
  onOpenDownloadOptions?: (item: SearchResult, anchorEl: HTMLElement) => void; // Changed prop name and signature
  // onDownloadMp4?: (item: SearchResult) => void;
  isPlaying?: boolean;
  isLoading?: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({
  item,
  onPlayPause,
  onOpenDownloadOptions, // Use new prop
  isPlaying = false,
  isLoading = false,
}) => {
  const formatDuration = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const displayDuration = item.duration > 0 ? formatDuration(item.duration) : (item.duration === 0 ? '' : 'N/A');

  return (
    <div className='flex items-center bg-bg-secondary hover:bg-bg-tertiary transition-colors p-sm rounded-md border border-border-primary h-[100px]'>
      <img
        src={item.thumbnail || 'https://via.placeholder.com/80'}
        alt={item.title}
        className='w-[80px] h-[80px] rounded-sm object-cover mr-sm'
      />
      <div className='flex-1 flex flex-col justify-center min-w-0'>
        <p className='text-body-lg font-medium text-text-primary truncate' title={item.title}>
          {item.title}
        </p>
        <p className='text-body text-text-secondary truncate' title={item.channel}>
          {item.channel} {displayDuration ? `• ${displayDuration}` : ''}
        </p>
      </div>
      <div className='flex flex-col sm:flex-row items-center gap-xs sm:gap-sm pl-sm'>
        <button
          onClick={() => onPlayPause(item)}
          aria-label={isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
          className='p-1.5 sm:p-2 rounded-sm text-accent-primary hover:bg-accent-primary/10 disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className='animate-spin h-5 w-5 text-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
          ) : (
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={22} />
          )}
        </button>
        <button
          onClick={(event) => onOpenDownloadOptions && onOpenDownloadOptions(item, event.currentTarget)} // Pass event.currentTarget
          aria-label={`Download options for ${item.title}`} // Updated aria-label
          className='p-1.5 sm:p-2 rounded-sm text-accent-secondary hover:bg-accent-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isLoading}
        >
          <Icon name='Download' size={18} />
        </button>
      </div>
    </div>
  );
};

export default MusicCard;
