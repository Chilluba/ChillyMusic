import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlaylistItem, PlaylistTrack } from '../types';
import 'react-native-get-random-values'; // For uuid
import { v4 as uuidv4 } from 'uuid';

const PLAYLISTS_STORAGE_KEY = '@ChillyMusic:Playlists';
// Store individual tracks separately to avoid duplicating track data in many playlists
// This is a more normalized approach. PlaylistItem.trackIds will reference keys here.
const PLAYLIST_TRACKS_STORAGE_KEY_PREFIX = '@ChillyMusic:PlaylistTrack_';

// Helper to get all stored tracks (potentially large, use with caution or paginate later)
// For now, this service assumes all track details are stored with the playlist when added.
// A more robust system might have a separate global track cache.

export const createPlaylist = async (name: string): Promise<PlaylistItem> => {
  const playlists = await getPlaylists();
  const newPlaylist: PlaylistItem = {
    id: uuidv4(),
    name,
    trackIds: [],
    tracks: [], // Initialize with empty tracks array
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  playlists.push(newPlaylist);
  await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  return newPlaylist;
};

export const getPlaylists = async (): Promise<PlaylistItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlists = jsonValue != null ? JSON.parse(jsonValue) as PlaylistItem[] : [];
    // Return playlists sorted by name or date - for now, as is or by createdAt
    return playlists.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error reading playlists:', e);
    return [];
  }
};

// For this version, 'tracks' are stored directly within the PlaylistItem in AsyncStorage.
// getPlaylistWithTracks will just be getPlaylistById.
export const getPlaylistById = async (playlistId: string): Promise<PlaylistItem | null> => {
  const playlists = await getPlaylists();
  return playlists.find(p => p.id === playlistId) || null;
};

export const addTrackToPlaylist = async (playlistId: string, track: Omit<PlaylistTrack, 'addedAt'>): Promise<PlaylistItem | null> => {
  const playlists = await getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex === -1) {
    console.error('Playlist not found');
    return null;
  }

  const playlist = playlists[playlistIndex];
  if (playlist.trackIds.includes(track.videoId)) {
    console.log('Track already in playlist');
    return playlist; // Or throw error / return specific status
  }

  const newPlaylistTrack: PlaylistTrack = {
    ...track,
    addedAt: new Date().toISOString(),
  };

  playlist.trackIds.push(track.videoId);
  playlist.tracks = [...(playlist.tracks || []), newPlaylistTrack]; // Add full track detail
  playlist.updatedAt = new Date().toISOString();

  playlists[playlistIndex] = playlist;
  await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  return playlist;
};

export const removeTrackFromPlaylist = async (playlistId: string, videoId: string): Promise<PlaylistItem | null> => {
  const playlists = await getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex === -1) return null;

  const playlist = playlists[playlistIndex];
  playlist.trackIds = playlist.trackIds.filter(id => id !== videoId);
  playlist.tracks = (playlist.tracks || []).filter(t => t.videoId !== videoId);
  playlist.updatedAt = new Date().toISOString();

  playlists[playlistIndex] = playlist;
  await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  return playlist;
};

export const deletePlaylist = async (playlistId: string): Promise<void> => {
  let playlists = await getPlaylists();
  playlists = playlists.filter(p => p.id !== playlistId);
  await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
};

export const renamePlaylist = async (playlistId: string, newName: string): Promise<PlaylistItem | null> => {
  const playlists = await getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex === -1) return null;

  playlists[playlistIndex].name = newName;
  playlists[playlistIndex].updatedAt = new Date().toISOString();
  await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  return playlists[playlistIndex];
};

// Function to get tracks for a playlist (if not embedding full tracks)
// export const getTracksForPlaylist = async (trackIds: string[]): Promise<PlaylistTrack[]> => { ... }
// This would be needed if tracks were stored separately. Current model embeds them.
