import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist } from '../store/playlistsSlice'; // Adjust path as necessary

const PLAYLISTS_STORAGE_KEY = '@ChillyMusic:playlists';
const SONGS_STORAGE_KEY = '@ChillyMusic:songs'; // Also need to persist songs

// Playlist specific storage functions
export const savePlaylistsToStorage = async (playlists: Playlist[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(playlists);
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, jsonValue);
    console.log('Playlists saved to AsyncStorage');
  } catch (e) {
    console.error('Failed to save playlists to AsyncStorage.', e);
    // Depending on the app, might want to throw e or handle it differently
  }
};

export const loadPlaylistsFromStorage = async (): Promise<Playlist[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (jsonValue != null) {
      console.log('Playlists loaded from AsyncStorage');
      return JSON.parse(jsonValue) as Playlist[];
    }
    console.log('No playlists found in AsyncStorage');
    return [];
  } catch (e) {
    console.error('Failed to load playlists from AsyncStorage.', e);
    return []; // Return empty array or re-throw
  }
};

// Song specific storage functions (as songs are also part of the state to persist)
// Assuming Song type is also needed here.
import { Song } from '../store/songsSlice'; // Adjust path

export const saveSongsToStorage = async (songs: Song[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(songs);
    await AsyncStorage.setItem(SONGS_STORAGE_KEY, jsonValue);
    console.log('Songs saved to AsyncStorage');
  } catch (e) {
    console.error('Failed to save songs to AsyncStorage.', e);
  }
};

export const loadSongsFromStorage = async (): Promise<Song[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SONGS_STORAGE_KEY);
    if (jsonValue != null) {
      console.log('Songs loaded from AsyncStorage');
      return JSON.parse(jsonValue) as Song[];
    }
    console.log('No songs found in AsyncStorage');
    return [];
  } catch (e) {
    console.error('Failed to load songs from AsyncStorage.', e);
    return [];
  }
};

// DownloadedMediaItem specific storage functions
import { DownloadedMediaItem } from '../store/downloadsSlice'; // Adjust path

const DOWNLOADED_MEDIA_STORAGE_KEY = '@ChillyMusic:downloadedMedia';

export const saveDownloadedMediaItemsToStorage = async (items: DownloadedMediaItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(DOWNLOADED_MEDIA_STORAGE_KEY, jsonValue);
    console.log('Downloaded media items saved to AsyncStorage');
  } catch (e) {
    console.error('Failed to save downloaded media items to AsyncStorage.', e);
  }
};

export const loadDownloadedMediaItemsFromStorage = async (): Promise<DownloadedMediaItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(DOWNLOADED_MEDIA_STORAGE_KEY);
    if (jsonValue != null) {
      console.log('Downloaded media items loaded from AsyncStorage');
      return JSON.parse(jsonValue) as DownloadedMediaItem[];
    }
    console.log('No downloaded media items found in AsyncStorage');
    return [];
  } catch (e) {
    console.error('Failed to load downloaded media items from AsyncStorage.', e);
    return [];
  }
};
