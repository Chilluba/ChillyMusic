import { FavoriteItem } from '../types';

const WEB_FAVORITES_KEY = 'ChillyMusic:WebFavorites';

export const getWebFavorites = (): FavoriteItem[] => {
  try {
    const jsonValue = localStorage.getItem(WEB_FAVORITES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading web favorites from localStorage', e);
    return [];
  }
};

export const addWebFavorite = (track: Pick<FavoriteItem, 'videoId' | 'title' | 'channel' | 'thumbnail'>): void => {
  try {
    const existingFavorites = getWebFavorites();
    if (existingFavorites.find(fav => fav.videoId === track.videoId)) {
      return; // Already favorite
    }
    const newFavorite: FavoriteItem = { ...track, id: track.videoId, addedAt: new Date().toISOString() };
    const updatedFavorites = [...existingFavorites, newFavorite];
    updatedFavorites.sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    localStorage.setItem(WEB_FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (e) {
    console.error('Error adding web favorite to localStorage', e);
  }
};

export const removeWebFavorite = (videoId: string): void => {
  try {
    let existingFavorites = getWebFavorites();
    existingFavorites = existingFavorites.filter(fav => fav.videoId !== videoId);
    localStorage.setItem(WEB_FAVORITES_KEY, JSON.stringify(existingFavorites));
  } catch (e) {
    console.error('Error removing web favorite from localStorage', e);
  }
};

export const isWebFavorite = (videoId: string): boolean => {
  try {
    const favorites = getWebFavorites();
    return favorites.some(fav => fav.videoId === videoId);
  } catch (e) {
    console.error('Error checking web favorite from localStorage', e);
    return false;
  }
};
