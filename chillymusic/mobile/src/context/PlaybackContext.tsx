import React, { createContext, useState, useRef, useContext, ReactNode, useEffect, useCallback } from 'react';
// @ts-ignore
import Video, { OnLoadData, OnProgressData, OnErrorData } from 'react-native-video';
import { Alert } from 'react-native';
import { PlayerScreenTrack, PlaybackProgressState } from '../navigation/types';
import { fetchMediaInfo } from '../services/apiService';
import { MediaInfo, SearchResult, DownloadedMediaItem } from '../types';

export type RepeatMode = 'off' | 'one' | 'all'; // Added 'all'

interface PlaybackContextType {
  currentTrack: PlayerScreenTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: PlaybackProgressState;
  error: string | null;
  repeatMode: RepeatMode;
  playbackQueue: PlayerScreenTrack[];
  currentQueueIndex: number;
  playTrack: (track: PlayerScreenTrack, newQueue?: PlayerScreenTrack[], playAtIndex?: number) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setRepeatMode: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  clearPlayer: () => void;
}

const initialProgress: PlaybackProgressState = { currentTime: 0, seekableDuration: 0 };
const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<PlayerScreenTrack | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<PlaybackProgressState>(initialProgress);
  const [error, setError] = useState<string | null>(null);
  const videoPlayerRef = useRef<Video>(null);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');

  const [playbackQueue, setPlaybackQueue] = useState<PlayerScreenTrack[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(-1);

  useEffect(() => {
    if (!currentTrack) {
      setStreamUrl(null); setIsPlaying(false); setProgress(initialProgress); setError(null);
      // setPlaybackQueue([]); setCurrentQueueIndex(-1); // Keep queue for potential resume or inspection
    }
  }, [currentTrack]);

  const _loadAndPlayTrack = useCallback(async (trackToPlay: PlayerScreenTrack) => {
    setError(null); setIsLoading(true); setProgress(initialProgress); setStreamUrl(null);
    // Do not set isPlaying to false here, allow it to continue if already true from previous track until new one loads/fails

    if ('filePath' in trackToPlay && trackToPlay.filePath) {
      console.log('[PlaybackContext] Playing local file:', trackToPlay.filePath);
      setStreamUrl(`file://${trackToPlay.filePath}`);
      setIsPlaying(true); setIsLoading(false);
    } else {
      try {
        const info = await fetchMediaInfo(trackToPlay.videoId);
        const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || f.audioCodec);
        if (audioFormat?.url) {
          setStreamUrl(audioFormat.url);
          setIsPlaying(true);
        } else { setError('No suitable audio stream found.'); setIsPlaying(false); }
      } catch (e: any) { setError(e.message || 'Failed to fetch media details.'); setIsPlaying(false); }
      finally { setIsLoading(false); }
    }
  }, []);


  const playTrack = useCallback((track: PlayerScreenTrack, newQueue?: PlayerScreenTrack[], playAtIndex?: number) => {
    if (newQueue && newQueue.length > 0) {
        setPlaybackQueue(newQueue);
        const indexToPlay = playAtIndex !== undefined ? playAtIndex : newQueue.findIndex(t => t.id === track.id && t.videoId === track.videoId);
        const validIndex = indexToPlay >= 0 ? indexToPlay : 0;
        setCurrentQueueIndex(validIndex);
        setCurrentTrack(newQueue[validIndex]);
        _loadAndPlayTrack(newQueue[validIndex]);
    } else {
        const existingIndex = playbackQueue.findIndex(t => t.id === track.id && t.videoId === track.videoId);
        if (existingIndex !== -1) {
            if (currentQueueIndex === existingIndex && currentTrack?.id === track.id) { // Same track selected
                 if (videoPlayerRef.current) videoPlayerRef.current.seek(0); // Restart track
                 setIsPlaying(true); // Ensure it plays
                 return;
            }
            setCurrentQueueIndex(existingIndex);
        } else {
            // Playing a single track not in current queue - make it the new queue
            setPlaybackQueue([track]);
            setCurrentQueueIndex(0);
        }
        setCurrentTrack(track);
        _loadAndPlayTrack(track);
    }
  }, [_loadAndPlayTrack, playbackQueue, currentQueueIndex, currentTrack]);

  const togglePlayPause = () => {
      if (!currentTrack) return;
      if (!streamUrl && !isLoading) { // If no stream, and not loading, try to play (will load)
          playTrack(currentTrack);
      } else if (streamUrl) { // If stream exists, just toggle
          setIsPlaying(!isPlaying);
      }
  };
  const seekTo = (time: number) => { if(videoPlayerRef.current) videoPlayerRef.current.seek(time); };

  const clearPlayer = useCallback(() => {
      setCurrentTrack(null);
      setPlaybackQueue([]);
      setCurrentQueueIndex(-1);
      // Other states (streamUrl, isPlaying etc.) reset by useEffect on currentTrack change
    }, []);

  const setRepeatMode = useCallback(() => {
    setRepeatModeState(prev => {
      if (prev === 'off') return 'one';
      if (prev === 'one') return 'all';
      return 'off'; // Cycle off -> one -> all -> off
    });
  }, []);

  const skipNext = useCallback(() => {
    if (playbackQueue.length === 0) return;
    let nextIndex = currentQueueIndex + 1;
    if (nextIndex >= playbackQueue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        console.log('End of queue');
        setIsPlaying(false);
        return;
      }
    }
    setCurrentQueueIndex(nextIndex);
    const nextTrack = playbackQueue[nextIndex];
    setCurrentTrack(nextTrack);
    _loadAndPlayTrack(nextTrack);
  }, [currentQueueIndex, playbackQueue, repeatMode, _loadAndPlayTrack]);

  const skipPrevious = useCallback(() => {
    if (playbackQueue.length === 0) return;
    let prevIndex = currentQueueIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = playbackQueue.length - 1;
      } else {
        console.log('Start of queue, seeking to 0');
        if(videoPlayerRef.current) videoPlayerRef.current.seek(0);
        return;
      }
    }
    setCurrentQueueIndex(prevIndex);
    const prevTrack = playbackQueue[prevIndex];
    setCurrentTrack(prevTrack);
    _loadAndPlayTrack(prevTrack);
  }, [currentQueueIndex, playbackQueue, repeatMode, _loadAndPlayTrack]);

  const onVideoLoad = (data: OnLoadData) => {
      console.log(`[PlaybackContext] Video loaded. Duration: ${data.duration}s. Track: ${currentTrack?.title}`);
      setProgress(prev => ({ ...prev, seekableDuration: data.duration }));
      if (currentTrack && ('filePath' in currentTrack && currentTrack.filePath || streamUrl) && isPlaying) {
          // If isPlaying was already true (e.g. auto-play for new track), ensure it continues
          // This is mostly handled by the `paused` prop on Video component
      }
  };
  const onVideoProgress = (data: OnProgressData) => { setProgress({ currentTime: data.currentTime, seekableDuration: data.seekableDuration || progress.seekableDuration }); };
  const onVideoError = (err: OnErrorData) => {
      const errorMessage = err.error?.localizedFailureReason || err.error?.localizedDescription || 'Unknown playback error';
      console.error('[PlaybackContext] Video Playback Error:', errorMessage, err);
      setError(errorMessage);
      setIsPlaying(false);
  };

  const onVideoEnd = () => {
    console.log('[PlaybackContext] Video ended. Repeat mode:', repeatMode, "Queue index/length:", currentQueueIndex, playbackQueue.length);
    if (repeatMode === 'one' && currentTrack) {
      if (videoPlayerRef.current) { videoPlayerRef.current.seek(0); }
      // setIsPlaying(true); // Should auto-restart if paused={!isPlaying}
    } else if (repeatMode === 'all' || currentQueueIndex < playbackQueue.length - 1) {
      skipNext();
    } else {
      setIsPlaying(false);
      setProgress(prev => ({ ...prev, currentTime: prev.seekableDuration }));
    }
  };

  return (
    <PlaybackContext.Provider value={{ currentTrack, isPlaying, isLoading, progress, error, repeatMode, playbackQueue, currentQueueIndex, playTrack, togglePlayPause, seekTo, setRepeatMode, skipNext, skipPrevious, clearPlayer }}>
      {children}
      {streamUrl && ( <Video ref={videoPlayerRef} source={{ uri: streamUrl }} paused={!isPlaying || isLoading} audioOnly={true} playInBackground={true} playWhenInactive={true} ignoreSilentSwitch={"ignore"} onError={onVideoError} onLoad={onVideoLoad} onProgress={onVideoProgress} onEnd={onVideoEnd} style={{ width: 0, height: 0 }} progressUpdateInterval={1000} /> )}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = (): PlaybackContextType => {
  const context = useContext(PlaybackContext);
  if (context === undefined) throw new Error('usePlayback must be used within a PlaybackProvider');
  return context;
 };
