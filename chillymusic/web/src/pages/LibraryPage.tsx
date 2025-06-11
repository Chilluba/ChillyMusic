import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WebLibraryItem } from '../types';
import { getWebLibraryItems, removeWebLibraryItem } from '../services/webLibraryStorageService';
import { fetchDownloadLink } from '../services/apiService';
import Icon from '../components/ui/Icon';

const LibraryPage: React.FC = () => {
  const [libraryItems, setLibraryItems] = useState<WebLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<{[itemId: string]: string | null}>({});

  const loadLibraryItems = () => {
    setIsLoading(true);
    const items = getWebLibraryItems();
    setLibraryItems(items); // Already sorted by service on save
    setIsLoading(false);
  };

  useEffect(() => {
    loadLibraryItems();
  }, []);

  const handleRemoveItem = (itemId: string) => {
    removeWebLibraryItem(itemId);
    loadLibraryItems();
  };

  const handleRetryDownload = async (item: WebLibraryItem) => {
    setIsRetrying(item.id);
    setRetryError(prev => ({ ...prev, [item.id]: null }));
    try {
      const { downloadUrl, fileName: suggestedFileName } = await fetchDownloadLink({
        videoId: item.videoId,
        format: item.format,
        quality: item.quality,
      });

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.fileName || suggestedFileName || `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.${item.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Re-try download error:', error);
      setRetryError(prev => ({ ...prev, [item.id]: error.message || 'Failed to get new download link.' }));
    } finally {
      setIsRetrying(null);
    }
  };

  if (isLoading) {
    return (
      <div className='p-md text-center min-h-[calc(100vh-120px)] flex flex-col justify-center items-center bg-bg-primary dark:bg-dark-bg-primary'>
        <svg className='animate-spin h-10 w-10 text-accent-primary dark:text-dark-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
        <p className='text-text-secondary dark:text-dark-text-secondary mt-sm'>Loading library...</p>
      </div>
    );
  }
  if (libraryItems.length === 0 && !isLoading) {
    return (
      <div className='p-md text-center min-h-[calc(100vh-120px)] flex flex-col justify-center items-center bg-bg-primary dark:bg-dark-bg-primary'>
        <p className='text-text-primary dark:text-dark-text-primary text-xl'>Your Web Download History is Empty</p>
        <p className='text-text-secondary dark:text-dark-text-secondary mt-sm'>
          This section shows a history of downloads initiated from this browser.
        </p>
        <Link to='/' className='mt-lg inline-block px-lg py-sm bg-accent-primary dark:bg-dark-accent-primary text-white dark:text-dark-text-primary rounded-md hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-colors'>
          Find Music to Download
        </Link>
      </div>
    );
  }

  return (
    <div className='p-md bg-bg-primary text-text-primary dark:bg-dark-bg-primary dark:text-dark-text-primary min-h-[calc(100vh-60px)]'>
      <h1 className='text-h1 font-bold text-text-primary dark:text-dark-text-primary mb-lg'>Web Download History</h1>
      <p className='text-text-secondary dark:text-dark-text-secondary mb-md'>
        This list tracks downloads started here. Files are in your computer's downloads. Links can expire.
      </p>
      <div className='space-y-md'>
        {libraryItems.map(item => (
          <div key={item.id} className='bg-bg-secondary dark:bg-dark-bg-secondary p-md rounded-lg shadow-md border border-border-primary dark:border-dark-border-primary flex flex-col md:flex-row md:items-center gap-md'>
            {item.thumbnail && (
              <img src={item.thumbnail} alt={item.title} className='w-full md:w-24 h-auto md:h-24 object-cover rounded-md mb-sm md:mb-0 flex-shrink-0' />
            )}
            <div className='flex-grow min-w-0'>
              <h3 className='text-lg font-semibold text-text-primary dark:text-dark-text-primary truncate' title={item.title}>{item.title}</h3>
              <p className='text-sm text-text-secondary dark:text-dark-text-secondary truncate' title={item.channel}>{item.channel || 'Unknown Artist'}</p>
              <div className='text-xs text-text-muted dark:text-dark-text-muted mt-xs space-y-0.5'>
                <p>Format: {item.format.toUpperCase()} ({item.quality})</p>
                <p className='truncate' title={item.fileName}>File: {item.fileName || 'N/A'}</p>
                <p>Initiated: {new Date(item.initiatedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className='flex flex-col md:flex-row items-stretch md:items-center gap-sm mt-sm md:mt-0 flex-shrink-0'>
              <button
                onClick={() => handleRetryDownload(item)}
                disabled={isRetrying === item.id}
                className='px-sm py-xs text-xs bg-accent-secondary dark:bg-dark-accent-secondary text-white dark:text-dark-text-primary rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 whitespace-nowrap flex items-center justify-center'
              >
                {isRetrying === item.id ? (
                  <svg className='animate-spin h-4 w-4 mr-1 text-white dark:text-dark-text-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'></circle><path d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' className='opacity-75' fill='currentColor'></path></svg>
                ) : <Icon name='Download' size={14} className='mr-1 text-white dark:text-dark-text-primary'/>}
                Re-try Download
              </button>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className='px-sm py-xs text-xs bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-secondary dark:text-dark-text-secondary rounded-md hover:bg-error-primary dark:hover:bg-dark-error-primary hover:text-white dark:hover:text-dark-text-primary transition-colors whitespace-nowrap'
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {Object.entries(retryError).map(([itemId, errorMsg]) => {
        if (!errorMsg) return null;
        const errorItemTitle = libraryItems.find(libItem => libItem.id === itemId)?.title || 'Unknown track';
        return (
          <div key={itemId} className='fixed bottom-4 right-4 bg-error-primary text-white p-md rounded-md shadow-lg z-50 max-w-sm'>
              <div className='flex justify-between items-center mb-xs'>
                <p className='text-sm font-semibold'>Download Error</p>
                <button onClick={() => setRetryError(prev => ({...prev, [itemId]: null}))} className='text-xs p-1 hover:bg-white/20 rounded-full'>
                    <Icon name="Close" size={14} className="text-white"/>
                </button>
              </div>
              <p className='text-sm'>Failed to re-try download for "{errorItemTitle}": {errorMsg}</p>
          </div>
        );
      })}
    </div>
  );
};

export default LibraryPage;
