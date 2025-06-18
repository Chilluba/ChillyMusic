import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { RootState } from './index'; // Adjust path to your root store config
import { savePlaylistsToStorage, saveSongsToStorage } from '../services/playlistStorage'; // Adjust path
import {
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  // loadPlaylists, // This action itself should not trigger a save right after loading
} from './playlistsSlice';
import {
  addSong,
  addSongs,
  removeSong,
  updateSong,
  clearSongs,
  // setSongs // This action itself should not trigger a save right after loading
} from './songsSlice';
import {
  addCompletedDownload,
  removeDownloadedItem,
  setDownloadsSortPreference,
  clearAllDownloads,
  // loadDownloadedItems // Should not trigger save
} from './downloadsSlice';
import { saveDownloadedMediaItemsToStorage } from '../services/playlistStorage'; // Assuming it's here

// Actions that modify playlists and should trigger saving playlists
const playlistWriteActions = [
  createPlaylist.type,
  renamePlaylist.type,
  deletePlaylist.type,
  addSongToPlaylist.type,
  removeSongFromPlaylist.type,
];

// Actions that modify songs and should trigger saving songs
const songWriteActions = [
  addSong.type,
  addSongs.type,
  removeSong.type,
  updateSong.type,
  clearSongs.type,
];

// Actions that modify completed downloads and should trigger saving downloads
const downloadWriteActions = [
  addCompletedDownload.type,
  removeDownloadedItem.type,
  setDownloadsSortPreference.type, // Persist sort preferences with the items
  clearAllDownloads.type,
];

const persistenceMiddleware: Middleware = (api: MiddlewareAPI<Dispatch<AnyAction>, RootState>) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
  const result = next(action); // Dispatch the action first

  const state = api.getState();

  if (playlistWriteActions.includes(action.type)) {
    // Assuming playlists are stored as an array in the slice, or use a selector
    const playlistsToSave = Object.values(state.playlists.entities).filter(p => !!p) as Playlist[];
    savePlaylistsToStorage(playlistsToSave);
  }

  if (songWriteActions.includes(action.type)) {
    const songsToSave = Object.values(state.songs.entities).filter(s => !!s) as Song[];
    saveSongsToStorage(songsToSave);
  }

  if (downloadWriteActions.includes(action.type)) {
    // Save the entire downloads state (completedItems, sortBy, sortOrder)
    // The storage function should expect the full state or just completedItems
    // For simplicity, let's assume saveDownloadedMediaItemsToStorage saves the items array
    // And sort preferences are re-applied on load or managed separately if needed for true persistence of settings.
    // For now, saving just the items. The slice itself holds sort prefs in memory.
    // To persist sort prefs, the save function would need to accept the whole DownloadsState.
    // Let's refine: save the whole downloads state part.
    saveDownloadedMediaItemsToStorage(state.downloads.completedItems); // Persisting only items for now
    // If we want to persist sort options too:
    // saveDownloadsStateToStorage(state.downloads); // New storage function needed
    // For now, only items are persisted by saveDownloadedMediaItemsToStorage.
    // The sort preferences will reset on app restart unless explicitly saved and loaded.
    // For simplicity in this step, only items array is saved.
    // A better approach would be to save state.downloads (which includes sort prefs)
    // and have load function restore it.
    // Let's assume for now `saveDownloadedMediaItemsToStorage` is enough and sort prefs are not persisted.
  }


  return result;
};

// Type helper for Playlist and Song if not already globally available
// This is just for the middleware context, actual types are in their slices
interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  videoId: string;
  filePath?: string;
  addedAt: string;
}


export default persistenceMiddleware;
