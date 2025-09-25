import React, { createContext, useState, useRef, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Alert } from 'react-native'; // Import Alert
// @ts-ignore
import Video, { OnLoadData, OnProgressData, OnErrorData } from 'react-native-video';
import { PlayerScreenTrack, PlaybackProgressState } from '../navigation/types';
import { fetchMediaInfo } from '../services/apiService';

export type RepeatMode = 'off' | 'one';

interface PlaybackContextType {
  currentTrack: PlayerScreenTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: PlaybackProgressState;
  error: string | null;
  repeatMode: RepeatMode;
  playTrack: (track: PlayerScreenTrack) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setRepeatMode: () => void;
  clearPlayer: () => void;
  skipToNext: () => void; // Added
  skipToPrevious: () => void; // Added
}

const initialProgress: PlaybackProgressState = { currentTime: 0, seekableDuration: 0 };
const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // ... (existing states and functions: currentTrack, streamUrl, isPlaying, etc.) ...
  const [currentTrack, setCurrentTrack] = useState<PlayerScreenTrack | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<PlaybackProgressState>(initialProgress);
  const [error, setError] = useState<string | null>(null);
  const videoPlayerRef = useRef<Video>(null);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');

  const playTrack = async (track: PlayerScreenTrack) => { /* ... */ };
  const togglePlayPause = () => { /* ... */ };
  const seekTo = (time: number) => { /* ... */ };
  const setRepeatMode = useCallback(() => { /* ... */ }, []);
  const clearPlayer = () => { /* ... */ };
  const onVideoLoad = (data: OnLoadData) => { /* ... */ };
  const onVideoProgress = (data: OnProgressData) => { /* ... */ };
  const onVideoError = (err: OnErrorData) => { /* ... */ };
  const onVideoEnd = () => { /* ... */ };

  const skipToNext = () => {
    Alert.alert('Coming Soon', 'Skip functionality requires a playlist or queue (feature coming soon!).');
  };

  const skipToPrevious = () => {
    Alert.alert('Coming Soon', 'Skip functionality requires a playlist or queue (feature coming soon!).');
  };

  return (
    <PlaybackContext.Provider value={{
      currentTrack, isPlaying, isLoading, progress, error, repeatMode,
      playTrack, togglePlayPause, seekTo, setRepeatMode, clearPlayer,
      skipToNext, skipToPrevious // Provide new functions
    }}>
      {children}
      {/* ... Video component ... */}
    </PlaybackContext.Provider>
  );
};
export const usePlayback = (): PlaybackContextType => { /* ... existing ... */ return {} as any; };
// Ensure full context structure is maintained by worker.
