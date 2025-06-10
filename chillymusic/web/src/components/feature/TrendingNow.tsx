import React from 'react';
import Icon from '../ui/Icon';

const TRENDING_DATA = [
  { id: '1', title: 'Song Title 1', artist: 'Artist Name 1', duration: '3:45', thumbnail: 'https://via.placeholder.com/80x104' },
  { id: '2', title: 'Song Title 2', artist: 'Artist Name 2', duration: '4:12', thumbnail: 'https://via.placeholder.com/80x104' },
  { id: '3', title: 'Song Title 3', artist: 'Artist Name 3', duration: '2:50', thumbnail: 'https://via.placeholder.com/80x104' },
];

const TrendingNow: React.FC = () => {
  return (
    <section className='py-sm'>
      <div className='flex justify-between items-center mb-md px-md'>
        <h2 className='text-h2 font-bold text-text-primary'>Trending Now</h2>
        <button aria-label='View all trending' className='text-accent-primary hover:text-opacity-80'>
          <Icon name='Fire' size={18} />
        </button>
      </div>
      <div className='flex gap-md overflow-x-auto px-md pb-md'>
        {TRENDING_DATA.map(item => (
          <div key={item.id} className='flex-shrink-0 w-[280px] h-[120px] bg-bg-secondary rounded-md border border-border-primary p-sm flex gap-sm hover:bg-bg-tertiary transition-colors cursor-pointer'>
            <img src={item.thumbnail} alt={item.title} className='w-[80px] h-full rounded-sm object-cover' />
            <div className='flex flex-col justify-between flex-1'>
              <div>
                <h3 className='text-body-lg font-medium text-text-primary truncate' title={item.title}>{item.title}</h3>
                <p className='text-body text-text-secondary truncate' title={item.artist}>{item.artist} • {item.duration}</p>
              </div>
              <div className='flex gap-sm mt-auto'>
                <button className='p-1.5 rounded-sm bg-accent-primary text-white hover:bg-opacity-80' aria-label={`Play ${item.title}`}>
                  <Icon name='Play' size={16} />
                </button>
                <button className='px-2 py-1 text-xs rounded-sm bg-accent-secondary text-white hover:bg-opacity-80' aria-label={`Download ${item.title} as MP3`}>MP3</button>
                <button className='px-2 py-1 text-xs rounded-sm bg-accent-secondary text-white hover:bg-opacity-80' aria-label={`Download ${item.title} as MP4`}>MP4</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default TrendingNow;
