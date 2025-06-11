import React, { createContext, useState, useRef, useContext, ReactNode, useEffect, useCallback } from 'react';
import { PlayerTrack } from '../components/player/EnhancedPlayer'; // Ensure PlayerTrack is correctly defined/imported
import { fetchMediaInfo } from '../services/apiService';
import { MediaInfo, SearchResult, DownloadedMediaItem } from '../types'; // Keep these for PlayerTrack compatibility

export type RepeatMode = 'off' | 'one';

export interface PlaybackProgressState { currentTime: number; seekableDuration: number; }
interface PlaybackContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: PlaybackProgressState;
  error: string | null;
  repeatMode: RepeatMode;
  playTrack: (track: PlayerTrack) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  clearPlayer: () => void;
  setRepeatMode: () => void;
}

const initialProgressWeb: PlaybackProgressState = { currentTime: 0, seekableDuration: 0 };
const WebPlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const WebPlaybackProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<PlaybackProgressState>(initialProgressWeb);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(typeof Audio !== 'undefined' ? new Audio() : null);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');

  const playAudioInternal = useCallback(() => { /* ... existing ... */
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setError('Error playing audio: ' + (e.message || 'Playback failed.'));
        setIsPlaying(false);
      });
    }
  }, []);

  useEffect(() => { /* ... for streamUrl ... */
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (streamUrl) {
      if (audioElement.src !== streamUrl) {
        audioElement.src = streamUrl;
        audioElement.load();
      }
      if (isPlaying) {
          playAudioInternal();
      }
    } else {
      audioElement.pause();
      audioElement.removeAttribute('src');
      audioElement.load();
    }
  }, [streamUrl, playAudioInternal]); // isPlaying removed here

  useEffect(() => { /* ... for isPlaying ... */
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying && streamUrl) {
      playAudioInternal();
    } else {
      audioElement.pause();
    }
  }, [isPlaying, streamUrl, playAudioInternal]);

  const playTrack = async (track: PlayerTrack) => { /* ... existing ... */
    setError(null); setIsLoading(true); setProgress(initialProgressWeb);
    if (currentTrack?.id === track.id && currentTrack.videoId === track.videoId) {
        setIsPlaying(true);
        if (audioRef.current) audioRef.current.currentTime = 0;
        setIsLoading(false); return;
    }
    setCurrentTrack(track); setIsPlaying(false);
    if ('filePath' in track && track.filePath) {
        console.warn('Web playback of local files not supported.');
        setError('Local file playback not supported on web.');
        setStreamUrl(null); setIsLoading(false); return;
    }
    try {
      const info = await fetchMediaInfo(track.videoId);
      const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || (f.audioCodec && f.audioCodec !== 'none'));
      if (audioFormat?.url) { setStreamUrl(audioFormat.url); setIsPlaying(true); }
      else { setError('No suitable audio stream found.'); }
    } catch (e: any) { setError(e.message || 'Failed to fetch media details.');
    } finally { setIsLoading(false); }
  };
  const togglePlayPause = () => { /* ... existing ... */
    if (!currentTrack) return;
    if (!streamUrl && !isLoading) { playTrack(currentTrack); }
    else if (streamUrl) { setIsPlaying(!isPlaying); }
  };
  const clearPlayer = () => { /* ... existing ... */
    setCurrentTrack(null); setStreamUrl(null); setIsPlaying(false);
    setProgress(initialProgressWeb); setError(null);
  };
  const seekTo = (time: number) => { /* ... existing ... */
     if (audioRef.current && audioRef.current.seekable) {
        const newTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
        audioRef.current.currentTime = newTime;
        setProgress(prev => ({...prev, currentTime: newTime}));
    }
  };

  const setRepeatMode = useCallback(() => {
    setRepeatModeState(prev => (prev === 'off' ? 'one' : 'off'));
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    const handleTimeUpdate = () => setProgress({ currentTime: audioElement.currentTime, seekableDuration: audioElement.duration || 0 });
    const handleLoadedMetadata = () => setProgress(prev => ({ ...prev, seekableDuration: audioElement.duration || 0 }));
    const handleAudioEnded = () => {
      console.log('[WebPlaybackContext] Audio ended. Repeat mode:', repeatMode);
      if (repeatMode === 'one' && audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.error('Error re-playing on repeat (web):', e));
        // setIsPlaying(true); // play() should trigger playing event, or timeupdate will show progress
      } else {
        setIsPlaying(false);
        // setProgress(prev => ({ ...prev, currentTime: prev.seekableDuration })); // Let timeupdate handle this
      }
    };
    const handleError = () => { setError('Audio playback error'); setIsPlaying(false); };
    const handleCanPlay = () => { if(isPlaying && audioElement.paused) { playAudioInternal(); } }; // Resume if was meant to be playing

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleAudioEnded);
    audioElement.addEventListener('error', handleError);
    audioElement.addEventListener('canplay', handleCanPlay);
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleAudioEnded);
      audioElement.removeEventListener('error', handleError);
      audioElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [repeatMode, playAudioInternal, isPlaying]); // Added isPlaying to dependencies of event listeners

  return (
    <WebPlaybackContext.Provider value={{ currentTrack, isPlaying, isLoading, progress, error, repeatMode, playTrack, togglePlayPause, seekTo, clearPlayer, setRepeatMode }}>
      {children}
    </WebPlaybackContext.Provider>
  );
};

export const useWebPlayback = (): PlaybackContextType => {
  const context = useContext(WebPlaybackContext);
  if (context === undefined) throw new Error('useWebPlayback must be used within a WebPlaybackProvider');
  return context;
};
