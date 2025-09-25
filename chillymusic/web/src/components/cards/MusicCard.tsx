import React from 'react';
import { SearchResult } from '../../types';
import Icon from '../ui/Icon';

interface MusicCardProps {
  item: SearchResult;
  onPlayPause: (item: SearchResult) => void;
  onOpenDownloadOptions?: (item: SearchResult, anchorEl: HTMLElement) => void;
  isPlaying?: boolean;
  isLoading?: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ item, onPlayPause, onOpenDownloadOptions, isPlaying = false, isLoading = false }) => {
  const formatDuration = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const displayDuration = item.duration > 0 ? formatDuration(item.duration) : (item.duration === 0 ? '' : 'N/A');

  return (
    <div className='flex items-center
                   bg-bg-secondary text-text-primary hover:bg-bg-tertiary
                   dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary
                   transition-colors p-sm rounded-md border border-border-primary dark:border-dark-border-primary h-[100px]'>
      <img src={item.thumbnail || 'https://via.placeholder.com/80'} alt={item.title} className='w-[80px] h-[80px] rounded-sm object-cover mr-sm' />
      <div className='flex-1 flex flex-col justify-center min-w-0'>
        <p className='text-body-lg font-medium text-text-primary dark:text-dark-text-primary truncate' title={item.title}>{item.title}</p>
        <p className='text-body text-text-secondary dark:text-dark-text-secondary truncate' title={item.channel}>{item.channel} {displayDuration ? `• ${displayDuration}` : ''}</p>
      </div>
      <div className='flex flex-col sm:flex-row items-center gap-xs sm:gap-sm pl-sm'>
        <button onClick={() => onPlayPause(item)} aria-label={isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
                className='p-1.5 sm:p-2 rounded-sm text-accent-primary dark:text-dark-accent-primary hover:bg-accent-primary/10 dark:hover:bg-dark-accent-primary/10 disabled:opacity-50'
                disabled={isLoading}>
          {isLoading ? ( <svg className='animate-spin h-5 w-5 text-accent-primary dark:text-dark-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'></circle><path d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' className='opacity-75' fill='currentColor'></path></svg> ) :
                       ( <Icon name={isPlaying ? 'Pause' : 'Play'} size={22} /> )}
        </button>
        {onOpenDownloadOptions && (
          <button onClick={(e) => onOpenDownloadOptions(item, e.currentTarget)} aria-label={`Download options for ${item.title}`}
                  className='p-1.5 sm:p-2 rounded-sm text-accent-secondary dark:text-dark-accent-secondary hover:bg-accent-secondary/10 dark:hover:bg-dark-accent-secondary/10 disabled:opacity-50'
                  disabled={isLoading}>
            <Icon name='Download' size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
export default MusicCard;
