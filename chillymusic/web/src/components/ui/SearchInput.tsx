import React, { useState, FormEvent } from 'react';
import Icon from './Icon';
// ... (Interface SearchInputProps) ...
const SearchInput: React.FC<SearchInputProps> = ({ onSearchSubmit }) => {
  // ... (state: query, isSubmitting) ...
  // ... (handleSubmit) ...
  return (
    <div className='px-md py-lg'>
      <form onSubmit={handleSubmit} className='relative flex items-center'>
        {/* ... MagnifyingGlass Icon ... */}
        <input
          type='search'
          placeholder='Search for music, artists, or albums'
          className='form-input w-full h-[52px] pl-10 pr-10
                     bg-bg-tertiary text-text-primary placeholder-text-muted
                     dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:placeholder-dark-text-muted
                     border-none rounded-md
                     focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg-tertiary dark:focus:ring-offset-dark-bg-tertiary focus:ring-accent-primary dark:focus:ring-dark-accent-primary
                     focus:border-accent-primary dark:focus:border-dark-accent-primary text-body-lg'
          // ... (value, onChange, disabled) ...
        />
        {/* ... (spinner or clear button) ... */}
        {query.length > 0 && !isSubmitting && (
            <button type='button' onClick={() => setQuery('')}
                    className='absolute inset-y-0 right-0 pr-sm flex items-center text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary dark:focus-visible:ring-dark-accent-primary'
                    aria-label='Clear search'>
              <span className='text-xl'>&times;</span>
            </button>
        )}
      </form>
    </div>
  );
};
export default SearchInput;
