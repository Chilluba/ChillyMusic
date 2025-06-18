import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

export interface MediaFormatInfo {
  formatType: string; // e.g., 'mp3', 'mp4'
  quality: string; // e.g., '128kbps', '720p'
  filesize: number; // bytes
}

export interface DownloadedMediaItem {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnail?: string;
  filePath: string; // For web, this might be a blob URL or IndexedDB key if not directly file system
  format: MediaFormatInfo;
  duration?: number; // seconds
  downloadedAt: string; // ISO Date string
}

export type SortKeyDownloads = 'downloadedAt' | 'title' | 'artist' | 'filesize';
export type SortOrderDownloads = 'asc' | 'desc';

export interface DownloadsState {
  completedItems: DownloadedMediaItem[];
  sortBy: SortKeyDownloads;
  sortOrder: SortOrderDownloads;
}

const initialState: DownloadsState = {
  completedItems: [],
  sortBy: 'downloadedAt',
  sortOrder: 'desc',
};

const downloadsSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    addCompletedDownload: (state, action: PayloadAction<DownloadedMediaItem>) => {
      if (!state.completedItems.find(item => item.id === action.payload.id)) {
        state.completedItems.push(action.payload);
      }
    },
    removeDownloadedItem: (state, action: PayloadAction<{ id: string }>) => {
      state.completedItems = state.completedItems.filter(item => item.id !== action.payload.id);
      // TODO: Trigger actual file/storage deletion for web (e.g., from IndexedDB)
    },
    setDownloadsSortPreference: (state, action: PayloadAction<{ sortBy: SortKeyDownloads; sortOrder: SortOrderDownloads }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    loadDownloadedItems: (state, action: PayloadAction<DownloadedMediaItem[]>) => {
      state.completedItems = action.payload;
    },
    clearAllDownloads: (state) => {
      state.completedItems = [];
      // TODO: Trigger deletion of all items from web storage
    }
  },
});

export const {
  addCompletedDownload,
  removeDownloadedItem,
  setDownloadsSortPreference,
  loadDownloadedItems,
  clearAllDownloads,
} = downloadsSlice.actions;

// Selectors
export const selectAllCompletedDownloads = (state: RootState): DownloadedMediaItem[] => state.downloads.completedItems;
export const selectDownloadsSortBy = (state: RootState): SortKeyDownloads => state.downloads.sortBy;
export const selectDownloadsSortOrder = (state: RootState): SortOrderDownloads => state.downloads.sortOrder;

export const selectSortedDownloads = (state: RootState): DownloadedMediaItem[] => {
  const { completedItems, sortBy, sortOrder } = state.downloads;
  const sorted = [...completedItems].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'artist':
        comparison = a.artist.localeCompare(b.artist);
        break;
      case 'filesize':
        comparison = a.format.filesize - b.format.filesize;
        break;
      case 'downloadedAt':
      default:
        comparison = new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  return sorted;
};

export const selectTotalDownloadsSize = (state: RootState): number => {
  return state.downloads.completedItems.reduce((total, item) => total + item.format.filesize, 0);
};

export default downloadsSlice.reducer;
