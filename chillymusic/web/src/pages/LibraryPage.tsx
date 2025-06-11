import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WebLibraryItem } from '../types';
import { getWebLibraryItems, removeWebLibraryItem } from '../services/webLibraryStorageService';
import { fetchDownloadLink } from '../services/apiService';
import Icon from '../components/ui/Icon';

const LibraryPage: React.FC = () => {
  const [libraryItems, setLibraryItems] = useState<WebLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetryingId, setIsRetryingId] = useState<string | null>(null); // Changed for clarity
  const [retryErrors, setRetryErrors] = useState<{[itemId: string]: string | null}>({}); // Plural for clarity

  const loadLibraryItems = () => { /* ... existing ... */ };
  useEffect(() => { loadLibraryItems(); }, []);
  const handleRemoveItem = (itemId: string) => { /* ... existing ... */ };

  const handleDownloadAgain = async (item: WebLibraryItem) => {
    setIsRetryingId(item.id);
    setRetryErrors(prev => ({ ...prev, [item.id]: null })); // Clear previous error for this item
    try {
      const { downloadUrl, fileName: suggestedFileName } = await fetchDownloadLink({
        videoId: item.videoId,
        format: item.format,
        quality: item.quality,
      });
      // ... (<a> tag download logic as before) ...
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.fileName || suggestedFileName || `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.${item.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Download Again error:', error);
      setRetryErrors(prev => ({ ...prev, [item.id]: error.message || 'Failed to get new download link.' }));
    } finally {
      setIsRetryingId(null);
    }
  };

  const dismissRetryError = (itemId: string) => {
    setRetryErrors(prev => ({ ...prev, [itemId]: null }));
  };

  // ... (isLoading and empty library display as before) ...
  if (isLoading) { return <div className='p-md text-center'><p className='text-text-secondary dark:text-dark-text-secondary'>Loading library...</p></div>; }
  if (libraryItems.length === 0 && !isLoading) { return <div className='p-md text-center'><p className='text-text-primary dark:text-dark-text-primary text-xl'>Your Web Download History is Empty</p>{/* ... */ }</div>; }


  return (
    <div className='p-md bg-bg-primary text-text-primary dark:bg-dark-bg-primary dark:text-dark-text-primary min-h-[calc(100vh-60px)]'>
      <h1 className='text-h1 font-bold text-text-primary dark:text-dark-text-primary mb-lg'>Web Download History</h1>
      <p className='text-text-secondary dark:text-dark-text-secondary mb-md'>
        This list tracks downloads initiated in this browser. Files are in your computer's downloads folder. Links can expire.
      </p>
      <div className='space-y-md'>
        {libraryItems.map(item => (
          <div key={item.id} className='bg-bg-secondary dark:bg-dark-bg-secondary p-md rounded-lg shadow-md border border-border-primary dark:border-dark-border-primary flex flex-col md:flex-row md:items-center gap-md'>
            {/* ... (thumbnail, item info as before) ... */}
            <div className='flex-grow min-w-0'>
                <h3 className='text-lg font-semibold text-text-primary dark:text-dark-text-primary truncate' title={item.title}>{item.title}</h3>
                {/* ... other details ... */}
            </div>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-sm mt-sm md:mt-0 flex-shrink-0'>
              <button
                onClick={() => handleDownloadAgain(item)}
                disabled={isRetryingId === item.id}
                className='px-sm py-xs text-xs bg-accent-secondary dark:bg-dark-accent-secondary text-white rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-wait whitespace-nowrap flex items-center justify-center'
              >
                {isRetryingId === item.id ? (
                  <>
                    <svg className='animate-spin h-4 w-4 mr-2 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'></circle><path d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' className='opacity-75' fill='currentColor'></path></svg>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Icon name='Download' size={14} className='mr-1.5' />
                    <span>Download Again</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className='px-sm py-xs text-xs bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-secondary dark:text-dark-text-secondary rounded-md hover:bg-error-primary dark:hover:bg-dark-error-primary hover:text-white dark:hover:text-white transition-colors whitespace-nowrap'
              >
                Remove {/* No icon needed for simple remove from history */}
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Display retry errors more prominently or allow dismissal */}
      {libraryItems.map(item => retryErrors[item.id] && (
          <div key={`error_${item.id}`} className='fixed bottom-4 right-4 bg-error-primary text-white p-md rounded-md shadow-lg z-50 flex items-center justify-between max-w-sm'>
              <p className='text-sm mr-2'>Failed to re-download "{item.title.substring(0,30)}...": {retryErrors[item.id]?.substring(0,100)}</p>
              <button onClick={() => dismissRetryError(item.id)} className='text-xs underline hover:text-gray-200 p-1'>Dismiss</button>
          </div>
        )
      )}
    </div>
  );
};

export default LibraryPage;
