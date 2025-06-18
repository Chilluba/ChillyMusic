import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  DownloadedMediaItem,
  selectSortedDownloads,
  selectTotalDownloadsSize,
  removeDownloadedItem,
  setDownloadsSortPreference,
  SortKeyDownloads,
  SortOrderDownloads,
} from '../store/downloadsSlice';
// Assuming a generic Dropdown component might exist or can be created for web sort selection
// For now, using simple buttons for sort key and a toggle for order.

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface DownloadedItemCardProps {
  item: DownloadedMediaItem;
  onPlay: (item: DownloadedMediaItem) => void;
  onDelete: (id: string, title: string) => void;
}

const DownloadedItemCard: React.FC<DownloadedItemCardProps> = ({ item, onPlay, onDelete }) => (
  <div className="bg-background-secondary p-4 rounded-lg shadow border border-border flex items-center space-x-4">
    {item.thumbnail ? (
      <img src={item.thumbnail} alt={item.title} className="w-20 h-20 rounded object-cover flex-shrink-0" />
    ) : (
      <div className="w-20 h-20 rounded bg-background-tertiary flex-shrink-0"></div>
    )}
    <div className="flex-grow overflow-hidden">
      <h3 className="text-lg font-semibold text-text-primary truncate" title={item.title}>{item.title}</h3>
      <p className="text-sm text-text-secondary truncate" title={item.artist}>{item.artist}</p>
      <p className="text-xs text-text-muted truncate">
        {formatBytes(item.format.filesize)} • Downloaded: {new Date(item.downloadedAt).toLocaleDateString()}
        {item.duration ? ` • ${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : ''}
      </p>
    </div>
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 flex-shrink-0">
      <button
        onClick={() => onPlay(item)}
        className="px-3 py-1.5 text-sm bg-accent-primary text-white rounded hover:bg-opacity-90 transition-colors min-w-[70px]"
        title="Play"
      >
        ▶️ Play
      </button>
      <button
        onClick={() => onDelete(item.id, item.title)}
        className="px-3 py-1.5 text-sm bg-error text-white rounded hover:bg-opacity-80 transition-colors min-w-[70px]"
        title="Delete"
      >
        🗑️ Delete
      </button>
    </div>
  </div>
);

const sortKeyOptions: Array<{ label: string; value: SortKeyDownloads }> = [
    { label: 'Date', value: 'downloadedAt' },
    { label: 'Title', value: 'title' },
    { label: 'Artist', value: 'artist' },
    { label: 'Size', value: 'filesize' },
];

const DownloadsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sortedDownloads = useSelector(selectSortedDownloads);
  const totalSize = useSelector(selectTotalDownloadsSize);
  const currentSortBy = useSelector((state: RootState) => state.downloads.sortBy);
  const currentSortOrder = useSelector((state: RootState) => state.downloads.sortOrder);

  // For web, a select dropdown might be better for sort key.
  // Using buttons for simplicity here to match mobile's FilterOptionModal usage.
  const [showSortOptions, setShowSortOptions] = useState(false);


  const handlePlayItem = (item: DownloadedMediaItem) => {
    console.log('Playing downloaded item:', item.title, item.filePath);
    // Web playback: could use a Blob URL if file is in IndexedDB, or directly if path is accessible.
    // For now, simple log.
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will remove the file.`)) {
      dispatch(removeDownloadedItem({ id }));
    }
  };

  const handleSortKeyChange = (key: SortKeyDownloads) => {
    dispatch(setDownloadsSortPreference({ sortBy: key, sortOrder: currentSortOrder }));
    setShowSortOptions(false);
  };

  const toggleSortOrder = () => {
    dispatch(setDownloadsSortPreference({ sortBy: currentSortBy, sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc' }));
  };

  const currentSortOptionLabel = sortKeyOptions.find(opt => opt.value === currentSortBy)?.label || 'Date';

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-screen text-text-primary">
      <h1 className="text-3xl font-bold mb-6">My Downloads</h1>

      <div className="mb-6 p-4 bg-background-secondary rounded-lg shadow border border-border">
        <p className="text-lg text-text-secondary">
          Total space used by downloads: <span className="font-semibold text-text-primary">{formatBytes(totalSize)}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="px-4 py-2 text-sm bg-background-tertiary text-text-primary rounded-md hover:bg-opacity-80 border border-border min-w-[150px] text-left"
            >
              Sort By: {currentSortOptionLabel} ▼
            </button>
            {showSortOptions && (
                 <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-background-tertiary ring-1 ring-border focus:outline-none z-10">
                    <div className="py-1">
                        {sortKeyOptions.map(opt => (
                            <a
                                key={opt.value}
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleSortKeyChange(opt.value); }}
                                className={`block px-4 py-2 text-sm ${opt.value === currentSortBy ? 'font-bold text-accent-primary' : 'text-text-primary hover:bg-background-primary'}`}
                            >
                                {opt.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
          </div>
          <button
            onClick={toggleSortOrder}
            className="px-4 py-2 text-sm bg-background-tertiary text-text-primary rounded-md hover:bg-opacity-80 border border-border"
          >
            Order: {currentSortOrder === 'asc' ? '🔼 Ascending' : '🔽 Descending'}
          </button>
        </div>
      </div>

      {sortedDownloads.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-text-secondary">You haven't downloaded any media yet.</p>
          <p className="mt-2 text-text-muted">Start downloading to see your media here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDownloads.map((item) => (
            <DownloadedItemCard key={item.id} item={item} onPlay={handlePlayItem} onDelete={handleDeleteItem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;
