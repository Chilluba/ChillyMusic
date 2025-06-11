import React, { createContext, useState, useRef, useContext, ReactNode, useEffect, useCallback } from 'react';
// ... (other imports from WebPlaybackContext) ...

export type RepeatMode = 'off' | 'one';
export interface PlaybackProgressState { /* ... */ }

interface PlaybackContextType {
  // ... (existing context type fields) ...
  skipToNext: () => void; // Added
  skipToPrevious: () => void; // Added
}

const WebPlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const WebPlaybackProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // ... (existing states and functions) ...
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null); // Ensure PlayerTrack is defined/imported
  // ... other states ...
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');


  const playTrack = async (track: PlayerTrack) => { /* ... */ };
  const togglePlayPause = () => { /* ... */ };
  const seekTo = (time: number) => { /* ... */ };
  const clearPlayer = () => { /* ... */ };
  const setRepeatMode = useCallback(() => { /* ... */ }, []);
  // ... (useEffect for audio event listeners, including onAudioEnded with repeatMode logic) ...

  const skipToNext = () => {
    alert('Skip functionality requires a playlist or queue (feature coming soon!).');
  };

  const skipToPrevious = () => {
    alert('Skip functionality requires a playlist or queue (feature coming soon!).');
  };

  return (
    <WebPlaybackContext.Provider value={{
      currentTrack, isPlaying, isLoading, progress, error, repeatMode,
      playTrack, togglePlayPause, seekTo, clearPlayer, setRepeatMode,
      skipToNext, skipToPrevious // Provide new functions
    }}>
      {children}
    </WebPlaybackContext.Provider>
  );
};
export const useWebPlayback = (): PlaybackContextType => { /* ... existing ... */ return {} as any; };
// Ensure full context structure is maintained by worker.
