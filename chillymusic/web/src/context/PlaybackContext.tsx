import React, { createContext, useState, useRef, useContext, ReactNode, useEffect, useCallback } from 'react';
// ... (other imports from WebPlaybackContext) ...

export type RepeatMode = 'off' | 'one';
export interface PlaybackProgressState {
  currentTime: number;
  seekableDuration: number;
} // Assuming full definition here

// Forward declaration for PlayerTrack if not imported from types
interface PlayerTrack { // Basic example, ensure this matches your actual PlayerTrack type
  id: string;
  videoId: string;
  title: string;
  channel?: string;
  thumbnailUrl?: string;
  streamUrl?: string; // Essential for playback
  duration?: number;
}


interface PlaybackContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: PlaybackProgressState;
  error: string | null; // Assuming error is a string
  repeatMode: RepeatMode;
  playTrack: (track: PlayerTrack) => Promise<void>; // Or void if not async
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  clearPlayer: () => void;
  setRepeatMode: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement>; // Expose audioRef
}

const WebPlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const WebPlaybackProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Added
  const [isLoading, setIsLoading] = useState(false); // Added
  const [progress, setProgress] = useState<PlaybackProgressState>({currentTime: 0, seekableDuration: 0}); // Added
  const [error, setError] = useState<string | null>(null); // Added
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');
  const audioRef = useRef<HTMLAudioElement>(null);


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
      skipToNext, skipToPrevious, audioRef
    }}>
      {children}
      <audio
        ref={audioRef}
        onLoadedMetadata={() => { /* Handle metadata load, e.g. set duration */ }}
        onTimeUpdate={() => { /* Handle time updates, e.g. setProgress */ }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { /* Handle track end, e.g. play next or repeat */ }}
        onError={(e) => { console.error("Audio Element Error:", e); setError("Playback error."); }}
        // controls // Optional: for debugging
      />
    </WebPlaybackContext.Provider>
  );
};

export const useWebPlayback = (): PlaybackContextType => {
  const context = useContext(WebPlaybackContext);
  if (context === undefined) {
    throw new Error('useWebPlayback must be used within a WebPlaybackProvider');
  }
  return context;
};
// Ensure full context structure is maintained by worker.
