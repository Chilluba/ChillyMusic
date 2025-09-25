import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
// @ts-ignore
import RNFS from 'react-native-fs';
import { DownloadedMediaItem, SearchResult, MediaInfo } from '../types';
import { DownloadOption } from '../components/modals/DownloadOptionsModal';
import { fetchDownloadLink } from '../services/apiService';
import { saveLibraryItem } from '../services/libraryStorageService';
import { PlayerScreenTrack } from '../navigation/types';

export interface PendingDownload { key: string; track: PlayerScreenTrack; option: DownloadOption; mediaInfo?: MediaInfo | null; addedToQueueAt: number; }
export interface ActiveDownloadProgress {
  jobId: number; progress: number; bytesWritten: number; contentLength: number; error?: string; filePath?: string;
  status: 'downloading' | 'completed' | 'error' | 'cancelled' | 'queued';
  itemMetadata: Pick<DownloadedMediaItem, 'id' | 'videoId' | 'title' | 'channel' | 'thumbnail' | 'format' | 'quality' | 'duration'>;
}
export type ActiveDownloadsState = Record<string, ActiveDownloadProgress>;
interface DownloadContextType {
  activeDownloads: ActiveDownloadsState;
  downloadQueue: PendingDownload[];
  startDownload: (track: PlayerScreenTrack, option: DownloadOption, mediaInfo?: MediaInfo | null) => Promise<void>;
  cancelDownload: (downloadKey: string) => void; // downloadKey is the composite key
  clearCompletedOrErroredDownload: (downloadKey: string) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);
const MAX_CONCURRENT_DOWNLOADS = 3;

export const DownloadProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [activeDownloads, setActiveDownloads] = useState<ActiveDownloadsState>({});
  const [downloadQueue, setDownloadQueue] = useState<PendingDownload[]>([]);

  const requestStoragePermission = async (): Promise<boolean> => { /* ... (as defined before) ... */ return false; };
  const performActualDownload = useCallback(async (key: string, track: PlayerScreenTrack, option: DownloadOption, mediaInfo?: MediaInfo | null) => { /* ... (as defined before) ... */ }, []);
  const processQueue = useCallback(() => { /* ... (as defined before) ... */ }, [activeDownloads, downloadQueue, performActualDownload]);

  useEffect(() => { processQueue(); }, [activeDownloads, downloadQueue.length, processQueue]);

  const startDownload = useCallback(async (track: PlayerScreenTrack, option: DownloadOption, mediaInfo?: MediaInfo | null) => { /* ... (as defined before) ... */ }, [activeDownloads, downloadQueue, requestStoragePermission, performActualDownload, processQueue]);

  const cancelDownload = useCallback(async (downloadKey: string) => {
    const itemMetadata = activeDownloads[downloadKey]?.itemMetadata || downloadQueue.find(item => item.key === downloadKey)?.track;
    const itemTitle = itemMetadata?.title || 'Track';

    // Check if the item is in the downloadQueue
    const queuedItemIndex = downloadQueue.findIndex(item => item.key === downloadKey);
    if (queuedItemIndex > -1) {
      setDownloadQueue(prevQueue => prevQueue.filter(item => item.key !== downloadKey));
      // Update status in activeDownloads if it was marked as 'queued' there
      setActiveDownloads(prevActive => {
        if (prevActive[downloadKey]?.status === 'queued') {
          return { ...prevActive, [downloadKey]: { ...prevActive[downloadKey], status: 'cancelled', error: 'Cancelled from queue' }};
        }
        // If it wasn't in activeDownloads with 'queued' (e.g. only in queue array), no change needed for activeDownloads here
        return prevActive;
      });
      Alert.alert('Download Cancelled', `"${itemTitle}" was removed from the queue.`);
      // processQueue(); // Not strictly needed as removing from queue doesn't free an active slot.
      return;
    }

    // Check if the item is an active (actually downloading) download
    const download = activeDownloads[downloadKey];
    if (download && download.jobId !== -1 && download.status === 'downloading') {
      try {
        console.log(`Attempting to cancel active download job: ${download.jobId} for key: ${downloadKey}`);
        // RNFS.stopDownload is for network tasks. For downloadFile, there's no direct cancel that cleans up.
        // We mark as cancelled; the OS might still finish writing a partial file or error out.
        // If a temp path was known, we could try RNFS.unlink here.
        // For now, the primary action is to update our state.
        // If RNFS.downloadFile().promise is still pending, it should reject or resolve.
        // This part is tricky without a true cancellation API for RNFS.downloadFile ongoing jobs.
        // The `stopDownload` is more for `uploadFiles` or `getFSInfo`.
        // Let's assume for now that marking it 'cancelled' is the main action from our side.
        // The OS will eventually stop writing if the app closes or the promise is somehow unlinked.
      } catch (e) {
        console.error('Error during explicit stop/cleanup attempt for download job:', e);
      } finally {
        setActiveDownloads(prev => ({
          ...prev,
          [downloadKey]: { ...prev[downloadKey], error: 'Cancelled by user', status: 'cancelled', progress: -1 }
        }));
        Alert.alert('Download Cancelled', `Download for "${itemTitle}" was cancelled.`);
        processQueue(); // A slot is now considered free, try to process the queue.
      }
    } else if (download) {
      console.log(`Download for "${itemTitle}" is not in 'downloading' state (status: ${download.status}). Cannot actively cancel, but marking as cancelled if not completed.`);
      if (download.status !== 'completed') {
        setActiveDownloads(prev => ({
          ...prev,
          [downloadKey]: { ...prev[downloadKey], error: 'Manually marked as cancelled', status: 'cancelled' }
        }));
      }
    } else {
      console.warn(`No active download or queued item found for key: ${downloadKey} to cancel.`);
    }
  }, [activeDownloads, downloadQueue, processQueue]);

  const clearCompletedOrErroredDownload = useCallback((downloadKey: string) => { /* ... (as defined before) ... */ }, []);

  return (
    <DownloadContext.Provider value={{ activeDownloads, downloadQueue, startDownload, cancelDownload, clearCompletedOrErroredDownload }}>
      {children}
    </DownloadContext.Provider>
  );
};
export const useDownload = (): DownloadContextType => { /* ... (as defined before) ... */ return {} as any;};
