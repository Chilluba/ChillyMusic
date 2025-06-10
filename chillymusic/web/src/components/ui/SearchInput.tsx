import React, { useState } from 'react';
import Icon from './Icon'; // Corrected path

const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  return (
    <div className='px-md py-lg'>
      <div className='relative flex items-center'>
        <div className='absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none'>
          <Icon name='MagnifyingGlass' size={20} className='text-text-muted' />
        </div>
        <input
          type='search'
          placeholder='Search for music, artists, or albums'
          className='form-input w-full h-[52px] pl-10 pr-md bg-bg-tertiary text-text-primary placeholder-text-muted border-none rounded-md focus:ring-accent-primary focus:border-accent-primary text-body-lg'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.length > 0 && (
          <button
            onClick={() => setQuery('')}
            className='absolute inset-y-0 right-0 pr-sm flex items-center text-text-muted hover:text-text-primary'
            aria-label='Clear search'
          >
            <span className='text-xl'>&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};
export default SearchInput;
