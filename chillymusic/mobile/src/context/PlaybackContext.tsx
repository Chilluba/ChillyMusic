import React, { createContext, useState, useRef, useContext, ReactNode, useEffect, useCallback } from 'react';
// @ts-ignore
import Video, { OnLoadData, OnProgressData, OnErrorData } from 'react-native-video';
import { Alert } from 'react-native';
import { PlayerScreenTrack, PlaybackProgressState } from '../navigation/types';
import { fetchMediaInfo } from '../services/apiService';
import { MediaInfo, SearchResult, DownloadedMediaItem } from '../types';


export type RepeatMode = 'off' | 'one'; // 'all' for future

interface PlaybackContextType {
  currentTrack: PlayerScreenTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: PlaybackProgressState;
  error: string | null;
  repeatMode: RepeatMode; // Added
  playTrack: (track: PlayerScreenTrack) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setRepeatMode: () => void; // Added: cycles 'off' -> 'one' -> 'off'
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

  useEffect(() => {
    if (!currentTrack) {
      setStreamUrl(null);
      setIsPlaying(false);
      setProgress(initialProgress);
      setError(null);
      // Do not reset repeatMode here, user preference should persist
    }
   }, [currentTrack]);

  const playTrack = async (track: PlayerScreenTrack) => {
    setError(null);
    setIsLoading(true);
    setProgress(initialProgress);

    if (currentTrack?.id === track.id && currentTrack.videoId === track.videoId && streamUrl) {
      setIsPlaying(true);
      videoPlayerRef.current?.seek(0);
      setIsLoading(false);
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(false);

    if ('filePath' in track && track.filePath) {
      console.log('[PlaybackContext] Playing local file:', track.filePath);
      setStreamUrl(`file://${track.filePath}`);
      setIsPlaying(true);
      setIsLoading(false);
    } else {
      try {
        console.log('[PlaybackContext] Fetching media info for track:', track.title);
        const info = await fetchMediaInfo(track.videoId);
        const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || f.audioCodec);
        if (audioFormat?.url) {
          console.log('[PlaybackContext] Stream URL fetched:', audioFormat.url);
          setStreamUrl(audioFormat.url);
          setIsPlaying(true);
        } else {
          const errMessage = 'No suitable audio stream found for this track.';
          setError(errMessage);
          Alert.alert('Playback Error', errMessage);
        }
      } catch (e: any) {
        const errMessage = e.message || 'Failed to fetch media details.';
        setError(errMessage);
        Alert.alert('Playback Error', errMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack || !streamUrl) {
        if (currentTrack) {
            playTrack(currentTrack);
        }
        return;
    }
    setIsPlaying(!isPlaying);
  };
  const seekTo = (time: number) => { if(videoPlayerRef.current) videoPlayerRef.current.seek(time); };

  const clearPlayer = () => {
    setCurrentTrack(null);
    // streamUrl, isPlaying, progress, error will be reset by useEffect on currentTrack change
  };

  const setRepeatMode = useCallback(() => {
    setRepeatModeState(prev => {
      if (prev === 'off') return 'one';
      return 'off';
    });
  }, []);

  const onVideoLoad = (data: OnLoadData) => {
    console.log(`[PlaybackContext] Video loaded. Duration: ${data.duration}s. Track: ${currentTrack?.title}`);
    setProgress(prev => ({ ...prev, seekableDuration: data.duration }));
    if (currentTrack && ('filePath' in currentTrack && currentTrack.filePath || streamUrl)) {
        setIsPlaying(true);
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
    console.log('[PlaybackContext] Video ended. Repeat mode:', repeatMode);
    if (repeatMode === 'one' && currentTrack) {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.seek(0);
      }
      // setIsPlaying(true); // This might be needed if seek(0) doesn't auto-restart, or if player pauses on end
      // For react-native-video, ensuring `paused` prop becomes false is key.
      // If `isPlaying` state is already true, and `paused` is `!isPlaying`, it should restart.
      // If it pauses by default, we might need to call `playTrack(currentTrack)` or similar.
      // Let's rely on current isPlaying state and seek to restart.
      // If it was already playing, it should resume. If it stopped, togglePlayPause or playTrack.
      // A simple seek(0) might not be enough if the player state internally changes to "ended" and stops.
      // Forcing play:
       setTimeout(() => setIsPlaying(true), 100); // Small delay to ensure seek completes then play signal
    } else {
      setIsPlaying(false);
      setProgress(prev => ({ ...prev, currentTime: prev.seekableDuration }));
    }
  };

  return (
    <PlaybackContext.Provider value={{ currentTrack, isPlaying, isLoading, progress, error, repeatMode, playTrack, togglePlayPause, seekTo, setRepeatMode, clearPlayer }}>
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
