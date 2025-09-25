import React from 'react';
import Icon from '../ui/Icon';

const RECENT_SEARCHES_DATA = [
  { id: '1', term: 'Afrobeats 2024' }, { id: '2', term: 'Chill Vibes' }, { id: '3', term: 'Workout Mix' },
];

const RecentSearches: React.FC = () => {
  return (
    <section className='px-md py-sm'>
      <div className='flex justify-between items-center mb-sm'>
        <h2 className='text-h2 font-bold text-text-primary'>Recent Searches</h2>
        <button aria-label='Clear recent searches' className='text-text-secondary hover:text-text-primary'>
          <Icon name='Clock' size={18} />
        </button>
      </div>
      <div className='flex gap-sm overflow-x-auto pb-xs'>
        {RECENT_SEARCHES_DATA.map(item => (
          <button
            key={item.id}
            className='flex items-center gap-xs bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary px-md py-sm rounded-full h-[40px] whitespace-nowrap text-sm'
            onClick={() => console.log('Search for:', item.term)}
          >
            <Icon name='Clock' size={16} className='text-text-muted' />
            <span>{item.term}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
export default RecentSearches;
