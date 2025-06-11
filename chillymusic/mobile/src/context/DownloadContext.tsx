import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
// @ts-ignore
import RNFS from 'react-native-fs';
import { DownloadedMediaItem, SearchResult, MediaInfo } from '../types';
import { DownloadOption } from '../components/modals/DownloadOptionsModal';
import { fetchDownloadLink } from '../services/apiService';
import { saveLibraryItem } from '../services/libraryStorageService';

// Structure for an active download
export interface ActiveDownloadProgress {
  jobId: number; // RNFS download job ID
  progress: number; // 0-100
  bytesWritten: number;
  contentLength: number;
  error?: string;
  filePath?: string; // Final path on completion
  // Store some metadata for UI updates while download is active
  itemMetadata: Pick<DownloadedMediaItem, 'id' | 'videoId' | 'title' | 'channel' | 'thumbnail' | 'format' | 'quality' | 'duration'>;
}

// Key for activeDownloads can be a composite ID (videoId_format_quality)
export type ActiveDownloadsState = Record<string, ActiveDownloadProgress>;

interface DownloadContextType {
  activeDownloads: ActiveDownloadsState;
  startDownload: (track: SearchResult | DownloadedMediaItem, option: DownloadOption, mediaInfo?: MediaInfo | null) => Promise<void>;
  cancelDownload: (downloadKey: string) => void;
  clearCompletedOrErroredDownload: (downloadKey: string) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [activeDownloads, setActiveDownloads] = useState<ActiveDownloadsState>({});

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'ChillyMusic Storage Permission',
            message: 'ChillyMusic needs access to your storage to download music.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) { console.warn(err); return false; }
    }
    return true;
  };

  const startDownload = useCallback(async (
    track: SearchResult | DownloadedMediaItem,
    option: DownloadOption,
    mediaInfo?: MediaInfo | null
  ) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to download files.');
      return;
    }

    const downloadKey = `${track.videoId}_${option.format}_${option.quality}`;

    if (activeDownloads[downloadKey] && activeDownloads[downloadKey].progress < 100 && !activeDownloads[downloadKey].error) {
      Alert.alert('In Progress', `"${track.title}" is already downloading.`);
      return;
    }

    const initialItemMetadata: ActiveDownloadProgress['itemMetadata'] = {
        id: downloadKey,
        videoId: track.videoId,
        title: track.title,
        channel: 'channel' in track ? track.channel : undefined,
        thumbnail: track.thumbnail,
        format: option.format,
        quality: option.quality,
        duration: mediaInfo?.duration || ('duration' in track ? track.duration : undefined)
    };

    // Set initial state for the download
    setActiveDownloads(prev => ({
      ...prev,
      [downloadKey]: { jobId: -1, progress: 0, bytesWritten: 0, contentLength: 0, itemMetadata: initialItemMetadata, error: undefined }
    }));

    try {
      const downloadPayload = { videoId: track.videoId, format: option.format, quality: option.quality };
      const { downloadUrl, fileName: suggestedFileName } = await fetchDownloadLink(downloadPayload);

      const safeTitle = track.title.replace(/[^a-zA-Z0-9\s-_.]/g, '').replace(/[\s.]+/g, '_');
      const extension = option.format === 'mp3' ? 'mp3' : 'mp4';
      const fileName = suggestedFileName || `${safeTitle}_${option.quality}.${extension}`;
      const destPath = `${Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath}/${fileName}`;

      console.log(`[DownloadContext] Starting download for ${track.title} to ${destPath} from ${downloadUrl}`);

      const download = RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: destPath,
        background: true,
        progressDivider: 5,
        begin: (res) => {
          console.log(`[DownloadContext] Begin Job ID: ${res.jobId}, Length: ${res.contentLength}`);
          setActiveDownloads(prev => ({
            ...prev,
            [downloadKey]: { ...prev[downloadKey], jobId: res.jobId, progress: 0, contentLength: res.contentLength, itemMetadata: initialItemMetadata }
          }));
        },
        progress: (res) => {
          const progressPercent = res.contentLength > 0 ? (res.bytesWritten / res.contentLength) * 100 : 0;
          // console.log(`[DownloadContext] Progress (${track.title}): ${progressPercent.toFixed(0)}%`);
          setActiveDownloads(prev => ({
            ...prev,
            [downloadKey]: { ...prev[downloadKey], progress: progressPercent, bytesWritten: res.bytesWritten, contentLength: res.contentLength, itemMetadata: initialItemMetadata }
          }));
        },
      });

      setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], jobId: download.jobId, itemMetadata: initialItemMetadata } }));

      const result = await download.promise;

      if (result.statusCode === 200) {
        console.log(`[DownloadContext] Complete: ${track.title}`);
        const completedLibraryItem: DownloadedMediaItem = {
          id: downloadKey,
          videoId: track.videoId, title: track.title, channel: 'channel' in track ? track.channel : undefined,
          filePath: destPath, thumbnail: track.thumbnail, downloadedAt: new Date().toISOString(),
          format: option.format, quality: option.quality,
          duration: mediaInfo?.duration || ('duration' in track ? track.duration : undefined) || option.formatDetails?.duration,
        };
        await saveLibraryItem(completedLibraryItem);
        setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], progress: 100, filePath: destPath, itemMetadata: initialItemMetadata } }));
        Alert.alert('Download Complete', `"${track.title}" downloaded!`);
      } else {
        throw new Error(`Download failed: status ${result.statusCode}`);
      }
    } catch (error: any) {
      console.error(`[DownloadContext] Download error for ${downloadKey}:`, error);
      setActiveDownloads(prev => ({ ...prev, [downloadKey]: { ...prev[downloadKey], error: error.message || 'Unknown download error', progress: -1, itemMetadata: initialItemMetadata } }));
      Alert.alert('Download Error', `Could not download "${track.title}": ${error.message}`);
    }
  }, [activeDownloads]); // Dependency: activeDownloads to check for existing downloads

  const cancelDownload = useCallback(async (downloadKey: string) => {
    const download = activeDownloads[downloadKey];
    if (download && download.jobId !== -1 && download.progress < 100 && !download.error) {
      try {
        console.log(`[DownloadContext] Cancelling download for job ID: ${download.jobId}`);
        await RNFS.stopDownload(download.jobId); // This is for network tasks, for downloadFile, it's primarily about cleanup

        // Try to delete the partial file if one was started
        // const tempPath = `${Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath}/${download.itemMetadata?.title}_${download.itemMetadata?.quality}.${download.itemMetadata?.format}.tmp`; // Example, actual temp path might not be known
        // if (await RNFS.exists(tempPath)) { await RNFS.unlink(tempPath); }
        // Or, if toFile path was already determined:
        // if (download.filePath && await RNFS.exists(download.filePath)) { await RNFS.unlink(download.filePath); }


        Alert.alert('Download Cancelled', `Download for "${download.itemMetadata?.title || 'track'}" was cancelled.`);
        setActiveDownloads(prev => {
          const newState = { ...prev };
          newState[downloadKey] = { ...newState[downloadKey], error: 'Cancelled', progress: -1 };
          return newState;
        });
      } catch (e) {
        console.error('[DownloadContext] Error cancelling download:', e);
      }
    }
  }, [activeDownloads]);

  const clearCompletedOrErroredDownload = useCallback((downloadKey: string) => {
    setActiveDownloads(prev => {
      const current = prev[downloadKey];
      if (current && (current.progress === 100 || current.error)) {
        const { [downloadKey]: _, ...rest } = prev; // Remove the item
        return rest;
      }
      return prev; // No change if not completed or errored
    });
  }, []);


  return (
    <DownloadContext.Provider value={{ activeDownloads, startDownload, cancelDownload, clearCompletedOrErroredDownload }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownload = (): DownloadContextType => {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};
