import { PlaylistItem, PlaylistTrack } from '../types';
// Simple ID generation for web (not UUID like mobile, but could be)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);


const WEB_PLAYLISTS_KEY = 'ChillyMusic:WebPlaylists';

export const createWebPlaylist = (name: string): PlaylistItem => {
  const playlists = getWebPlaylists();
  const newPlaylist: PlaylistItem = {
    id: generateId(),
    name,
    trackIds: [],
    tracks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  playlists.push(newPlaylist);
  localStorage.setItem(WEB_PLAYLISTS_KEY, JSON.stringify(playlists));
  return newPlaylist;
};

export const getWebPlaylists = (): PlaylistItem[] => {
  try {
    const jsonValue = localStorage.getItem(WEB_PLAYLISTS_KEY);
    const playlists = jsonValue != null ? JSON.parse(jsonValue) as PlaylistItem[] : [];
    return playlists.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Error reading web playlists:', e);
    return [];
  }
};

export const getWebPlaylistById = (playlistId: string): PlaylistItem | null => {
  const playlists = getWebPlaylists();
  return playlists.find(p => p.id === playlistId) || null;
};

export const addTrackToWebPlaylist = (playlistId: string, track: Omit<PlaylistTrack, 'addedAt'>): PlaylistItem | null => {
  const playlists = getWebPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex === -1) return null;

  const playlist = playlists[playlistIndex];
  if (playlist.trackIds.includes(track.videoId)) return playlist;

  const newPlaylistTrack: PlaylistTrack = { ...track, addedAt: new Date().toISOString() };
  playlist.trackIds.push(track.videoId);
  playlist.tracks = [...(playlist.tracks || []), newPlaylistTrack];
  playlist.updatedAt = new Date().toISOString();

  playlists[playlistIndex] = playlist;
  localStorage.setItem(WEB_PLAYLISTS_KEY, JSON.stringify(playlists));
  return playlist;
};

export const removeTrackFromWebPlaylist = (playlistId: string, videoId: string): PlaylistItem | null => {
  const playlists = getWebPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex === -1) return null;

  const playlist = playlists[playlistIndex];
  playlist.trackIds = playlist.trackIds.filter(id => id !== videoId);
  playlist.tracks = (playlist.tracks || []).filter(t => t.videoId !== videoId);
  playlist.updatedAt = new Date().toISOString();

  playlists[playlistIndex] = playlist;
  localStorage.setItem(WEB_PLAYLISTS_KEY, JSON.stringify(playlists));
  return playlist;
};

export const deleteWebPlaylist = (playlistId: string): void => {
  let playlists = getWebPlaylists();
  playlists = playlists.filter(p => p.id !== playlistId);
  localStorage.setItem(WEB_PLAYLISTS_KEY, JSON.stringify(playlists));
};

export const renameWebPlaylist = (playlistId: string, newName: string): PlaylistItem | null => {
  const playlists = getWebPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex === -1) return null;

  playlists[playlistIndex].name = newName;
  playlists[playlistIndex].updatedAt = new Date().toISOString();
  localStorage.setItem(WEB_PLAYLISTS_KEY, JSON.stringify(playlists));
  return playlists[playlistIndex];
};
