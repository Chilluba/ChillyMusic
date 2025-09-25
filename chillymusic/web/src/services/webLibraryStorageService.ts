import { WebLibraryItem } from '../types';

const WEB_LIBRARY_STORAGE_KEY = 'ChillyMusic:WebLibrary';

export const getWebLibraryItems = (): WebLibraryItem[] => {
  try {
    const jsonValue = localStorage.getItem(WEB_LIBRARY_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading web library items from localStorage', e);
    return [];
  }
};

export const saveWebLibraryItem = (item: WebLibraryItem): void => {
  try {
    const existingItems = getWebLibraryItems();
    // Avoid duplicates by checking 'id'
    const itemIndex = existingItems.findIndex(i => i.id === item.id);
    if (itemIndex > -1) {
      existingItems[itemIndex] = item; // Update if exists (e.g., re-initiated download)
    } else {
      existingItems.push(item);
    }
    // Sort by newest first before saving
    existingItems.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime());
    const jsonValue = JSON.stringify(existingItems);
    localStorage.setItem(WEB_LIBRARY_STORAGE_KEY, jsonValue);
    console.log('Web library item saved:', item.title);
  } catch (e) {
    console.error('Error saving web library item to localStorage', e);
  }
};

export const removeWebLibraryItem = (itemId: string): void => {
  try {
    const existingItems = getWebLibraryItems();
    const updatedItems = existingItems.filter(item => item.id !== itemId);
    const jsonValue = JSON.stringify(updatedItems);
    localStorage.setItem(WEB_LIBRARY_STORAGE_KEY, jsonValue);
    console.log('Web library item removed:', itemId);
  } catch (e) {
    console.error('Error removing web library item from localStorage', e);
  }
};

export const clearWebLibrary = (): void => {
  try {
    localStorage.removeItem(WEB_LIBRARY_STORAGE_KEY);
    console.log('Web library cleared from localStorage.');
  } catch (e) {
    console.error('Error clearing web library from localStorage', e);
  }
};
