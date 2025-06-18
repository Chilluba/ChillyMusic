import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './index';
import { deleteLocalFile } from '../services/fileSystem'; // Import the file deletion utility

export interface MediaFormatInfo {
  formatType: string; // e.g., 'mp3', 'mp4'
  quality: string; // e.g., '128kbps', '720p'
  filesize: number; // bytes
}

export interface DownloadedMediaItem {
  id: string; // videoId can serve as id if downloads are unique per videoId, or use a separate UUID.
  videoId: string;
  title: string;
  artist: string;
  thumbnail?: string;
  filePath: string;
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
  // Removed isDeletingItem and deleteItemError for simpler synchronous slice
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
    // Synchronous reducer to remove item from state
    removeDownloadedItem: (state, action: PayloadAction<{ id: string }>) => {
      state.completedItems = state.completedItems.filter(item => item.id !== action.payload.id);
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
      // TODO: File system deletion for all items would need a separate thunk or service call here
    }
    // Removed clearDeleteItemError as deleteItemError field is removed
  },
  // Removed extraReducers as thunk is removed
});

// Removed removeDownloadedItemThunk definition

export const {
  addCompletedDownload,
  removeDownloadedItem, // Exporting the synchronous action
  setDownloadsSortPreference,
  loadDownloadedItems,
  clearAllDownloads,
} = downloadsSlice.actions;


// Selectors
export const selectAllCompletedDownloads = (state: RootState): DownloadedMediaItem[] => state.downloads.completedItems;
export const selectDownloadsSortBy = (state: RootState): SortKeyDownloads => state.downloads.sortBy;
export const selectDownloadsSortOrder = (state: RootState): SortOrderDownloads => state.downloads.sortOrder;
// Removed selectIsDeletingItem and selectDeleteItemError

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
        comparison = new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime(); // Default newest first
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
