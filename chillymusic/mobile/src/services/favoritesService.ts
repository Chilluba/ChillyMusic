import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteItem } from '../types';

const FAVORITES_STORAGE_KEY = '@ChillyMusic:Favorites';

export const getFavorites = async (): Promise<FavoriteItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading favorites from AsyncStorage', e);
    return [];
  }
};

export const addFavorite = async (track: Pick<FavoriteItem, 'videoId' | 'title' | 'channel' | 'thumbnail'>): Promise<void> => {
  try {
    const existingFavorites = await getFavorites();
    if (existingFavorites.find(fav => fav.videoId === track.videoId)) {
      console.log('Track already in favorites:', track.title);
      return; // Already a favorite
    }
    const newFavorite: FavoriteItem = {
      ...track,
      id: track.videoId, // Use videoId as the unique ID
      addedAt: new Date().toISOString(),
    };
    const updatedFavorites = [...existingFavorites, newFavorite];
    // Sort by addedAt descending (newest first)
    updatedFavorites.sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
    console.log('Added to favorites:', track.title);
  } catch (e) {
    console.error('Error adding favorite to AsyncStorage', e);
  }
};

export const removeFavorite = async (videoId: string): Promise<void> => {
  try {
    let existingFavorites = await getFavorites();
    existingFavorites = existingFavorites.filter(fav => fav.videoId !== videoId);
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(existingFavorites));
    console.log('Removed from favorites:', videoId);
  } catch (e) {
    console.error('Error removing favorite from AsyncStorage', e);
  }
};

export const isFavorite = async (videoId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some(fav => fav.videoId === videoId);
  } catch (e) {
    console.error('Error checking if favorite from AsyncStorage', e);
    return false;
  }
};
