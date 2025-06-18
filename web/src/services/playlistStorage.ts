import { Playlist } from '../store/playlistsSlice'; // Adjust path as necessary
import { Song } from '../store/songsSlice'; // Adjust path

const PLAYLISTS_STORAGE_KEY = 'ChillyMusic:playlists';
const SONGS_STORAGE_KEY = 'ChillyMusic:songs';

// Playlist specific storage functions
export const savePlaylistsToStorage = (playlists: Playlist[]): void => {
  try {
    const jsonValue = JSON.stringify(playlists);
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, jsonValue);
    console.log('Playlists saved to localStorage');
  } catch (e) {
    console.error('Failed to save playlists to localStorage.', e);
  }
};

export const loadPlaylistsFromStorage = (): Playlist[] => {
  try {
    const jsonValue = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (jsonValue != null) {
      console.log('Playlists loaded from localStorage');
      return JSON.parse(jsonValue) as Playlist[];
    }
    console.log('No playlists found in localStorage');
    return [];
  } catch (e) {
    console.error('Failed to load playlists from localStorage.', e);
    return [];
  }
};

// DownloadedMediaItem specific storage functions
import { DownloadedMediaItem } from '../store/downloadsSlice'; // Adjust path

const DOWNLOADED_MEDIA_STORAGE_KEY = 'ChillyMusic:downloadedMedia';

export const saveDownloadedMediaItemsToStorage = (items: DownloadedMediaItem[]): void => {
  try {
    const jsonValue = JSON.stringify(items);
    localStorage.setItem(DOWNLOADED_MEDIA_STORAGE_KEY, jsonValue);
    console.log('Downloaded media items saved to localStorage');
  } catch (e) {
    console.error('Failed to save downloaded media items to localStorage.', e);
  }
};

export const loadDownloadedMediaItemsFromStorage = (): DownloadedMediaItem[] => {
  try {
    const jsonValue = localStorage.getItem(DOWNLOADED_MEDIA_STORAGE_KEY);
    if (jsonValue != null) {
      console.log('Downloaded media items loaded from localStorage');
      return JSON.parse(jsonValue) as DownloadedMediaItem[];
    }
    console.log('No downloaded media items found in localStorage');
    return [];
  } catch (e) {
    console.error('Failed to load downloaded media items from localStorage.', e);
    return [];
  }
};

// Song specific storage functions
export const saveSongsToStorage = (songs: Song[]): void => {
  try {
    const jsonValue = JSON.stringify(songs);
    localStorage.setItem(SONGS_STORAGE_KEY, jsonValue);
    console.log('Songs saved to localStorage');
  } catch (e) {
    console.error('Failed to save songs to localStorage.', e);
  }
};

export const loadSongsFromStorage = (): Song[] => {
  try {
    const jsonValue = localStorage.getItem(SONGS_STORAGE_KEY);
    if (jsonValue != null) {
      console.log('Songs loaded from localStorage');
      return JSON.parse(jsonValue) as Song[];
    }
    console.log('No songs found in localStorage');
    return [];
  } catch (e) {
    console.error('Failed to load songs from localStorage.', e);
    return [];
  }
};
