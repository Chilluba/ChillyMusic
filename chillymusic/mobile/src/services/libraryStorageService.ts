import AsyncStorage from '@react-native-async-storage/async-storage';
import { DownloadedMediaItem } from '../types';

const LIBRARY_STORAGE_KEY = '@ChillyMusic:DownloadedLibrary';

export const getLibraryItems = async (): Promise<DownloadedMediaItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(LIBRARY_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading library items from AsyncStorage', e);
    return [];
  }
};

export const saveLibraryItem = async (item: DownloadedMediaItem): Promise<void> => {
  try {
    const existingItems = await getLibraryItems();
    // Avoid duplicates - if item with same id exists, update it? Or disallow?
    // For now, let's replace if ID matches, otherwise add.
    const itemIndex = existingItems.findIndex(i => i.id === item.id && i.format === item.format && i.quality === item.quality); // More specific check
    if (itemIndex > -1) {
      existingItems[itemIndex] = item;
    } else {
      existingItems.push(item);
    }
    const jsonValue = JSON.stringify(existingItems);
    await AsyncStorage.setItem(LIBRARY_STORAGE_KEY, jsonValue);
    console.log('Library item saved:', item.title);
  } catch (e) {
    console.error('Error saving library item to AsyncStorage', e);
  }
};

export const removeLibraryItem = async (itemId: string): Promise<void> => {
  try {
    const existingItems = await getLibraryItems();
    // Assuming itemId is composite like "videoId_format_quality" or unique per download.
    // If ID is just videoId, this will remove all formats/qualities of that video.
    // For this example, assuming id passed to removeLibraryItem is the unique DownloadedMediaItem.id
    const updatedItems = existingItems.filter(item => item.id !== itemId);
    const jsonValue = JSON.stringify(updatedItems);
    await AsyncStorage.setItem(LIBRARY_STORAGE_KEY, jsonValue);
    console.log('Library item removed:', itemId);
  } catch (e) {
    console.error('Error removing library item from AsyncStorage', e);
  }
};

export const clearLibrary = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LIBRARY_STORAGE_KEY);
    console.log('Library cleared from AsyncStorage.');
  } catch (e) {
    console.error('Error clearing library from AsyncStorage', e);
  }
};
