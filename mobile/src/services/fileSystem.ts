import RNFS from 'react-native-fs';

export const deleteLocalFile = async (filePath: string): Promise<void> => {
  try {
    // Check if the file exists before attempting to delete
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      await RNFS.unlink(filePath);
      console.log(`File deleted successfully: ${filePath}`);
    } else {
      console.warn(`File not found, cannot delete: ${filePath}`);
      // Depending on desired behavior, you might want to throw an error here
      // or just log and proceed (e.g., if the record exists but file was somehow already deleted)
    }
  } catch (error: any) {
    console.error(`Error deleting file ${filePath}:`, error);
    // Rethrow the error to be caught by the thunk if specific error handling is needed there
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

// Potential future functions:
// - saveFile(...)
// - getFileSize(...)
// - getDirectoryContents(...)
// - etc.
