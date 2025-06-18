import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { RootState } from './index'; // Adjust path to your root store config
import { savePlaylistsToStorage, saveSongsToStorage } from '../services/playlistStorage'; // Adjust path
import {
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from './playlistsSlice'; // Assuming these are action creators
import {
  addSong,
  addSongs,
  removeSong,
  updateSong,
  clearSongs,
} from './songsSlice';
import {
  addCompletedDownload,
  removeDownloadedItem,
  setDownloadsSortPreference,
  clearAllDownloads,
} from './downloadsSlice';
import { saveDownloadedMediaItemsToStorage } from '../services/playlistStorage';


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
  setDownloadsSortPreference.type,
  clearAllDownloads.type,
];

const persistenceMiddleware: Middleware = (api: MiddlewareAPI<Dispatch<AnyAction>, RootState>) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
  const result = next(action); // Dispatch the action first

  const state = api.getState();

  if (playlistWriteActions.includes(action.type)) {
    const playlistsToSave = Object.values(state.playlists.entities).filter(p => !!p) as Playlist[];
    savePlaylistsToStorage(playlistsToSave);
  }

  if (songWriteActions.includes(action.type)) {
    const songsToSave = Object.values(state.songs.entities).filter(s => !!s) as Song[];
    saveSongsToStorage(songsToSave);
  }

  if (downloadWriteActions.includes(action.type)) {
    // Persisting only items array for downloads, sort preferences are not persisted via this.
    saveDownloadedMediaItemsToStorage(state.downloads.completedItems);
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
