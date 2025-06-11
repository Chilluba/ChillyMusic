import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used
import { WebLibraryItem } from '../types';
import { getWebLibraryItems, removeWebLibraryItem } from '../services/webLibraryStorageService';
// import MusicCard from '../components/cards/MusicCard'; // Can adapt MusicCard or use simpler display

const LibraryPage: React.FC = () => {
  const [libraryItems, setLibraryItems] = useState<WebLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const items = getWebLibraryItems(); // localStorage is synchronous
    setLibraryItems(items);
    setIsLoading(false);
  }, []); // Load once on mount. Refresh could be triggered by custom event or polling if needed.

  const handleRemoveItem = (itemId: string) => {
    removeWebLibraryItem(itemId);
    // Refresh list
    setLibraryItems(getWebLibraryItems());
  };

  if (isLoading) {
    return (
      <div className='p-md text-center'>
        <p className='text-text-secondary'>Loading library...</p>
        {/* Basic inline spinner for loading */}
        <svg className='animate-spin h-8 w-8 text-accent-primary mx-auto mt-md' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
      </div>
    );
  }

  if (libraryItems.length === 0) {
    return (
      <div className='p-md text-center'>
        <p className='text-text-primary text-xl'>Your Web Download History is Empty</p>
        <p className='text-text-secondary mt-sm'>
          This section shows a history of downloads you've initiated from this browser.
        </p>
        <Link to='/' className='mt-lg inline-block px-lg py-sm bg-accent-primary text-white rounded-md hover:bg-opacity-80'>
          Find Music to Download
        </Link>
      </div>
    );
  }

  return (
    <div className='p-md'>
      <h1 className='text-h1 font-bold text-text-primary mb-lg'>Web Download History</h1>
      <p className='text-text-secondary mb-md'>
        This list tracks downloads you've started in this browser. The actual files are saved to your computer's downloads folder.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md'>
        {libraryItems.map(item => (
          <div key={item.id} className='bg-bg-secondary p-sm rounded-md shadow border border-border-primary flex flex-col justify-between'>
            <div>
                {item.thumbnail && (
                <img src={item.thumbnail} alt={item.title} className='w-full h-32 object-cover rounded-sm mb-sm' />
                )}
                <h3 className='text-body-lg font-semibold text-text-primary truncate' title={item.title}>{item.title}</h3>
                <p className='text-sm text-text-secondary truncate' title={item.channel}>{item.channel || 'Unknown Artist'}</p>
                <p className='text-xs text-text-muted mt-xs'>
                Format: {item.format.toUpperCase()} ({item.quality})
                </p>
                <p className='text-xs text-text-muted truncate' title={item.fileName}>File: {item.fileName || 'N/A'}</p>
                <p className='text-xs text-text-muted'>Initiated: {new Date(item.initiatedAt).toLocaleDateString()}</p>
            </div>
            <div className='mt-sm pt-sm border-t border-border-primary text-right'>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className='text-xs text-error-primary hover:underline'
              >
                Remove from history
              </button>
              {/* Re-download might be complex if URLs expire quickly; for now, just history. */}
              {/* {item.originalDownloadUrl &&
                <a href={item.originalDownloadUrl} download={item.fileName} className='text-xs text-accent-secondary hover:underline ml-sm'>Re-Initiate</a>
              } */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;
