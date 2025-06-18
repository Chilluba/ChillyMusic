import { AppDispatch } from '../store'; // Assuming AppDispatch is exported from your store
import { removeDownloadedItem } from '../store/downloadsSlice'; // Synchronous action
import { deleteLocalFile } from './fileSystem'; // File system utility

/**
 * Handles the deletion of a downloaded media item, including file system removal
 * and updating the Redux state.
 *
 * @param itemId - The ID of the item to delete.
 * @param filePath - The local file path of the media to delete.
 * @param dispatch - The Redux dispatch function.
 * @returns Promise<boolean> - True if deletion (file and state) was successful, false otherwise.
 */
export const handleDeleteItemService = async (
  itemId: string,
  filePath: string,
  dispatch: AppDispatch // Use AppDispatch type for safety
): Promise<boolean> => {
  try {
    await deleteLocalFile(filePath); // Attempt to delete the file from storage
    dispatch(removeDownloadedItem({ id: itemId })); // Dispatch action to remove from Redux state
    console.log(`Successfully deleted item ${itemId} (file and record).`);
    return true;
  } catch (error: any) {
    console.error(`Service error deleting item ${itemId}:`, error.message);
    // Optionally, dispatch an error action here if global error handling is needed in Redux
    // For now, just returning false and letting the component handle UI feedback.
    return false;
  }
};

// Other download management related services could go here in the future,
// e.g., initiating downloads, managing queue (if not fully in Redux thunks), etc.
