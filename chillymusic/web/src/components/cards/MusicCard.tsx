import React from 'react';
import { SearchResult } from '../../types'; // Path to types
import Icon from '../ui/Icon'; // Path to Icon component

interface MusicCardProps {
  item: SearchResult;
  onPlay?: (item: SearchResult) => void;
  onDownloadMp3?: (item: SearchResult) => void;
  onDownloadMp4?: (item: SearchResult) => void;
}

const MusicCard: React.FC<MusicCardProps> = ({ item, onPlay, onDownloadMp3, onDownloadMp4 }) => {
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
      <div className='flex-1 flex flex-col justify-center min-w-0'> {/* min-w-0 for ellipsis */}
        <p className='text-body-lg font-medium text-text-primary truncate' title={item.title}>
          {item.title}
        </p>
        <p className='text-body text-text-secondary truncate' title={item.channel}>
          {item.channel} {displayDuration ? `• ${displayDuration}` : ''}
        </p>
      </div>
      <div className='flex flex-col sm:flex-row items-center gap-xs sm:gap-sm pl-sm'>
        <button
          onClick={() => onPlay && onPlay(item)}
          aria-label={`Play ${item.title}`}
          className='p-1.5 sm:p-2 rounded-sm text-accent-primary hover:bg-accent-primary/10'
        >
          <Icon name='Play' size={22} />
        </button>
        <button
          onClick={() => onDownloadMp3 && onDownloadMp3(item)}
          aria-label={`Download ${item.title} as MP3`}
          className='p-1.5 sm:p-2 rounded-sm text-accent-secondary hover:bg-accent-secondary/10'
        >
          <Icon name='Download' size={18} />
          {/* <span className='text-xs ml-1 hidden sm:inline'>MP3</span> */}
        </button>
        {/* <button
          onClick={() => onDownloadMp4 && onDownloadMp4(item)}
          aria-label={`Download ${item.title} as MP4`}
          className='p-1.5 sm:p-2 rounded-sm text-accent-secondary hover:bg-accent-secondary/10'
        >
          <Icon name='Download' size={18} />
          <span className='text-xs ml-1 hidden sm:inline'>MP4</span>
        </button> */}
      </div>
    </div>
  );
};

export default MusicCard;
