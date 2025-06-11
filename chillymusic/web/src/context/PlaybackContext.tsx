import React, { createContext, useState, useRef, useContext, ReactNode, useEffect, useCallback } from 'react';
import { PlayerTrack } from '../components/player/EnhancedPlayer'; // Re-use PlayerTrack
import { fetchMediaInfo } from '../services/apiService';
import { SearchResult, DownloadedMediaItem, MediaInfo } from '../types';


export interface PlaybackProgressState {
  currentTime: number;
  seekableDuration: number;
}

interface PlaybackContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: PlaybackProgressState;
  error: string | null;
  playTrack: (track: PlayerTrack) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  clearPlayer: () => void;
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

  const audioRef = useRef<HTMLAudioElement>(typeof Audio !== 'undefined' ? new Audio() : null); // Conditionally create Audio for SSR safety

  const playAudioInternal = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setError('Error playing audio: ' + (e.message || 'Playback failed.'));
        setIsPlaying(false);
      });
    }
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (streamUrl) {
      if (audioElement.src !== streamUrl) { // Prevent re-setting src if it's the same
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
  }, [streamUrl, playAudioInternal]); // isPlaying removed as direct dependency here, handled by below effect


  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying && streamUrl) { // Ensure streamUrl is present before trying to play
      playAudioInternal();
    } else {
      audioElement.pause();
    }
  }, [isPlaying, streamUrl, playAudioInternal]); // streamUrl added as playAudioInternal depends on it implicitly


  // Audio event listeners
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => setProgress({ currentTime: audioElement.currentTime, seekableDuration: audioElement.duration || 0 });
    const handleLoadedMetadata = () => setProgress(prev => ({ ...prev, seekableDuration: audioElement.duration || 0 }));
    const handleEnded = () => { setIsPlaying(false); setCurrentTrack(null); }; // Clear track on end
    const handleError = () => { setError('Audio playback error'); setIsPlaying(false); };
    const handleCanPlay = () => { // Autoplay if intended
        if(isPlaying) {
            playAudioInternal();
        }
    }

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);
    audioElement.addEventListener('canplay', handleCanPlay);
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
      audioElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [playAudioInternal, isPlaying]); // isPlaying added to re-evaluate canplay if needed

  const playTrack = async (track: PlayerTrack) => {
    setError(null);
    setIsLoading(true);
    setProgress(initialProgressWeb);

    if (currentTrack?.id === track.id && currentTrack.videoId === track.videoId) {
        setIsPlaying(true);
        if (audioRef.current) audioRef.current.currentTime = 0;
        setIsLoading(false);
        return;
    }

    setCurrentTrack(track);
    setIsPlaying(false);

    if ('filePath' in track && track.filePath) {
        console.warn('Web playback of local files from library not directly supported via file:// scheme.');
        setError('Local file playback from web is not directly supported.');
        setStreamUrl(null); // Ensure no old URL is used
        setIsLoading(false);
        return;
    }

    try {
      const info = await fetchMediaInfo(track.videoId);
      const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || (f.audioCodec && f.audioCodec !== 'none'));
      if (audioFormat?.url) {
        setStreamUrl(audioFormat.url);
        setIsPlaying(true);
      } else {
        setError('No suitable audio stream found.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch media details.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    if (!streamUrl && !isLoading) {
        playTrack(currentTrack);
    } else if (streamUrl) { // Only toggle if streamUrl is set (meaning track is loaded or attempted)
        setIsPlaying(!isPlaying);
    }
  };

  const clearPlayer = () => {
    setCurrentTrack(null);
    setStreamUrl(null);
    setIsPlaying(false);
    setProgress(initialProgressWeb);
    setError(null);
    // No need to interact with audioRef.current here, useEffect for streamUrl will handle it
  };

  const seekTo = (time: number) => {
    if (audioRef.current && audioRef.current.seekable) {
        const newTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
        audioRef.current.currentTime = newTime;
        setProgress(prev => ({...prev, currentTime: newTime}));
    }
  };

  return (
    <WebPlaybackContext.Provider value={{ currentTrack, isPlaying, isLoading, progress, error, playTrack, togglePlayPause, seekTo, clearPlayer }}>
      {children}
      {/* HTML5 audio element is managed by the provider and not rendered directly by consumers */}
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
