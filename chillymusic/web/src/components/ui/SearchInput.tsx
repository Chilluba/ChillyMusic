import React, { useState, FormEvent } from 'react';
import Icon from './Icon';
// Removed fetchSearchResults and SearchResult type, as this component only submits query now

interface SearchInputProps {
  onSearchSubmit: (query: string) => void; // Changed to mandatory
  // isLoading prop can be added if parent wants to control it, but for now, internal loading for visual feedback
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearchSubmit }) => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Internal state for visual feedback

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate a short delay for visual feedback, then call prop
    // In a real scenario, parent might handle loading state entirely.
    await new Promise(resolve => setTimeout(resolve, 300)); // Small visual delay
    onSearchSubmit(query);
    setIsSubmitting(false);
    // setQuery(''); // Optionally clear query after submit
  };

  return (
    <div className='px-md py-lg'>
      <form onSubmit={handleSubmit} className='relative flex items-center'>
        <div className='absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none'>
          <Icon name='MagnifyingGlass' size={20} className='text-text-muted' />
        </div>
        <input
          type='search'
          placeholder='Search for music, artists, or albums'
          className='form-input w-full h-[52px] pl-10 pr-10 bg-bg-tertiary text-text-primary placeholder-text-muted border-none rounded-md focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-body-lg'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSubmitting}
        />
        {isSubmitting ? (
          <div className='absolute inset-y-0 right-0 pr-sm flex items-center'>
            <svg className='animate-spin h-5 w-5 text-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
          </div>
        ) : (
          query.length > 0 && (
            <button
              type='button'
              onClick={() => setQuery('')}
              className='absolute inset-y-0 right-0 pr-sm flex items-center text-text-muted hover:text-text-primary'
              aria-label='Clear search'
              disabled={isSubmitting}
            >
              <span className='text-xl'>&times;</span>
            </button>
          )
        )}
        <button type='submit' className='hidden' aria-hidden='true' disabled={isSubmitting}>Search</button>
      </form>
      {/* Error display removed, as parent (SearchResultsPage) handles errors */}
    </div>
  );
};
export default SearchInput;
