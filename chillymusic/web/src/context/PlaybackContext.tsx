import React, { createContext, useState, useRef, useContext, ReactNode, useEffect, useCallback } from 'react';
import { PlayerTrack } from '../components/player/EnhancedPlayer';
import { fetchMediaInfo } from '../services/apiService';
import { MediaInfo, SearchResult, DownloadedMediaItem } from '../types';

export type RepeatMode = 'off' | 'one' | 'all'; // Added 'all'

export interface PlaybackProgressState { currentTime: number; seekableDuration: number; }
interface PlaybackContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: PlaybackProgressState;
  error: string | null;
  repeatMode: RepeatMode;
  playbackQueue: PlayerTrack[];
  currentQueueIndex: number;
  playTrack: (track: PlayerTrack, newQueue?: PlayerTrack[], playAtIndex?: number) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  clearPlayer: () => void;
  setRepeatMode: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
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

  const [playbackQueue, setPlaybackQueue] = useState<PlayerTrack[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(-1);

  const _loadAndPlayTrackWeb = useCallback(async (trackToPlay: PlayerTrack) => {
    setError(null); setIsLoading(true); setProgress(initialProgressWeb); setStreamUrl(null);
    // setIsPlaying(false); // Let success/failure dictate this
    if ('filePath' in trackToPlay && trackToPlay.filePath) {
        console.warn('Web playback of local files not supported.');
        setError('Local file playback not supported on web.');
        setIsLoading(false); return;
    }
    try {
      const info = await fetchMediaInfo(trackToPlay.videoId);
      const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || (f.audioCodec && f.audioCodec !== 'none'));
      if (audioFormat?.url) { setStreamUrl(audioFormat.url); setIsPlaying(true); }
      else { setError('No suitable audio stream found.'); setIsPlaying(false); }
    } catch (e: any) { setError(e.message || 'Failed to fetch media details.'); setIsPlaying(false); }
    finally { setIsLoading(false); }
  }, []);

  const playTrack = useCallback((track: PlayerTrack, newQueue?: PlayerTrack[], playAtIndex?: number) => {
    if (newQueue && newQueue.length > 0) {
        setPlaybackQueue(newQueue);
        const indexToPlay = playAtIndex !== undefined ? playAtIndex : newQueue.findIndex(t => t.id === track.id && t.videoId === track.videoId);
        const validIndex = indexToPlay >= 0 ? indexToPlay : 0;
        setCurrentQueueIndex(validIndex);
        setCurrentTrack(newQueue[validIndex]);
        _loadAndPlayTrackWeb(newQueue[validIndex]);
    } else {
        const existingIndex = playbackQueue.findIndex(t => t.id === track.id && t.videoId === track.videoId);
        if (existingIndex !== -1) {
            if (currentQueueIndex === existingIndex && currentTrack?.id === track.id) {
                 if (audioRef.current) audioRef.current.currentTime = 0;
                 setIsPlaying(true); return;
            }
            setCurrentQueueIndex(existingIndex);
        } else {
            setPlaybackQueue([track]); setCurrentQueueIndex(0);
        }
        setCurrentTrack(track);
        _loadAndPlayTrackWeb(track);
    }
  }, [_loadAndPlayTrackWeb, playbackQueue, currentQueueIndex, currentTrack]);

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
      if (audioElement.src !== streamUrl) { audioElement.src = streamUrl; audioElement.load(); }
      if (isPlaying) { playAudioInternal(); }
    } else { audioElement.pause(); audioElement.removeAttribute('src'); audioElement.load(); }
  }, [streamUrl, playAudioInternal, isPlaying]); // Added isPlaying

  useEffect(() => { /* ... for isPlaying ... */
    const audioElement = audioRef.current;
    if (!audioElement) return;
    if (isPlaying && streamUrl) { playAudioInternal(); }
    else { audioElement.pause(); }
  }, [isPlaying, streamUrl, playAudioInternal]);

  const togglePlayPause = () => { /* ... existing ... */
    if (!currentTrack) return;
    if (!streamUrl && !isLoading) { playTrack(currentTrack); }
    else if (streamUrl) { setIsPlaying(!isPlaying); }
  };
  const clearPlayer = useCallback(() => { /* ... existing ... */
    setCurrentTrack(null); setPlaybackQueue([]); setCurrentQueueIndex(-1);
    // streamUrl etc. will be reset by useEffect on currentTrack change
  }, []);
  const seekTo = (time: number) => { /* ... existing ... */
     if (audioRef.current && audioRef.current.seekable) {
        const newTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
        audioRef.current.currentTime = newTime;
        setProgress(prev => ({...prev, currentTime: newTime}));
    }
  };
  const setRepeatMode = useCallback(() => {
    setRepeatModeState(prev => {
      if (prev === 'off') return 'one';
      if (prev === 'one') return 'all';
      return 'off';
    });
  }, []);

  const skipNext = useCallback(() => {
    if (playbackQueue.length === 0) return;
    let nextIndex = currentQueueIndex + 1;
    if (nextIndex >= playbackQueue.length) {
      if (repeatMode === 'all') { nextIndex = 0; }
      else { setIsPlaying(false); return; }
    }
    setCurrentQueueIndex(nextIndex);
    const nextTrack = playbackQueue[nextIndex];
    setCurrentTrack(nextTrack);
    _loadAndPlayTrackWeb(nextTrack);
  }, [currentQueueIndex, playbackQueue, repeatMode, _loadAndPlayTrackWeb]);

  const skipPrevious = useCallback(() => {
    if (playbackQueue.length === 0) return;
    let prevIndex = currentQueueIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') { prevIndex = playbackQueue.length - 1; }
      else { if(audioRef.current) audioRef.current.currentTime = 0; return; }
    }
    setCurrentQueueIndex(prevIndex);
    const prevTrack = playbackQueue[prevIndex];
    setCurrentTrack(prevTrack);
    _loadAndPlayTrackWeb(prevTrack);
  }, [currentQueueIndex, playbackQueue, repeatMode, _loadAndPlayTrackWeb]);

  useEffect(() => { // Audio event listeners
    const audioElement = audioRef.current;
    if (!audioElement) return;
    const handleTimeUpdate = () => setProgress({ currentTime: audioElement.currentTime, seekableDuration: audioElement.duration || 0 });
    const handleLoadedMetadata = () => setProgress(prev => ({ ...prev, seekableDuration: audioElement.duration || 0 }));
    const handleAudioEnded = () => {
      if (repeatMode === 'one' && currentTrack) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.error('Error re-playing on repeat (web):', e));
        // setIsPlaying(true); // Not strictly needed as play() should trigger events
      } else if (repeatMode === 'all' || currentQueueIndex < playbackQueue.length - 1) {
        skipNext();
      } else {
        setIsPlaying(false);
      }
    };
    const handleError = () => { setError('Audio playback error'); setIsPlaying(false); };
    const handleCanPlay = () => { if(isPlaying && audioElement.paused) { playAudioInternal(); } };

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
  }, [repeatMode, currentTrack, currentQueueIndex, playbackQueue, skipNext, playAudioInternal, isPlaying]); // Added isPlaying

  return (
    <WebPlaybackContext.Provider value={{ currentTrack, isPlaying, isLoading, progress, error, repeatMode, playbackQueue, currentQueueIndex, playTrack, togglePlayPause, seekTo, clearPlayer, setRepeatMode, skipNext, skipPrevious }}>
      {children}
    </WebPlaybackContext.Provider>
  );
};

export const useWebPlayback = (): PlaybackContextType => {
  const context = useContext(WebPlaybackContext);
  if (context === undefined) throw new Error('useWebPlayback must be used within a WebPlaybackProvider');
  return context;
};
