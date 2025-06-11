import React, { createContext, useState, useRef, useContext, ReactNode, useEffect } from 'react';
// @ts-ignore
import Video, { OnLoadData, OnProgressData, OnErrorData } from 'react-native-video';
import { Alert } from 'react-native';
import { PlayerScreenTrack, PlaybackProgressState } from '../navigation/types'; // Reusing types
import { fetchMediaInfo } from '../services/apiService';
import { MediaInfo, SearchResult, DownloadedMediaItem } from '../types';

interface PlaybackContextType {
  currentTrack: PlayerScreenTrack | null;
  isPlaying: boolean;
  isLoading: boolean; // Loading media info or stream
  progress: PlaybackProgressState;
  error: string | null;
  playTrack: (track: PlayerScreenTrack) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  // skipNext: () => void; // Placeholder
  // skipPrevious: () => void; // Placeholder
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

  useEffect(() => {
    if (!currentTrack) {
      setStreamUrl(null);
      setIsPlaying(false);
      setProgress(initialProgress);
      setError(null);
    }
  }, [currentTrack]);

  const playTrack = async (track: PlayerScreenTrack) => {
    setError(null);
    setIsLoading(true);
    setProgress(initialProgress);

    // If the same track is selected, and it's already playing, behavior might be to restart or do nothing.
    // If it's paused, then resume. For now, if same track, it implies a restart or unpause via toggle.
    if (currentTrack?.id === track.id && currentTrack.videoId === track.videoId && streamUrl) {
      setIsPlaying(true); // Ensure it plays
      videoPlayerRef.current?.seek(0); // Restart from beginning
      setIsLoading(false);
      return;
    }

    setCurrentTrack(track); // Set new track
    setIsPlaying(false); // Start paused until ready

    if ('filePath' in track && track.filePath) {
      console.log('Playing local file:', track.filePath);
      setStreamUrl(`file://${track.filePath}`);
      // Duration for local files might already be in track.duration, Video onLoad will confirm
      setIsPlaying(true);
      setIsLoading(false);
    } else {
      try {
        console.log('Fetching media info for track:', track.title);
        const info = await fetchMediaInfo(track.videoId);
        const audioFormat = info.formats.find(f => f.ext === 'm4a' || f.ext === 'mp3' || f.audioCodec);
        if (audioFormat?.url) {
          console.log('Stream URL fetched:', audioFormat.url);
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
        if (currentTrack) { // If track is selected but no streamUrl (e.g. error state), try playing it again
            playTrack(currentTrack);
        }
        return;
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    if (videoPlayerRef.current) {
        videoPlayerRef.current.seek(time);
        // Keep playing if it was playing, or paused if it was paused.
        // If paused, RN Video typically updates currentTime but doesn't auto-play.
        // If playing, it continues from new time.
    }
  };

  const onVideoLoad = (data: OnLoadData) => {
    console.log(`Video loaded. Duration: ${data.duration}s. Track: ${currentTrack?.title}`);
    setProgress(prev => ({ ...prev, seekableDuration: data.duration }));
    if (currentTrack && 'filePath' in currentTrack && currentTrack.filePath) { // Autoplay local files if they were set to play
        setIsPlaying(true);
    }
    // For streamed files, isPlaying is set after streamUrl is fetched and set.
  };
  const onVideoProgress = (data: OnProgressData) => {
    setProgress({ currentTime: data.currentTime, seekableDuration: data.seekableDuration || progress.seekableDuration });
  };
  const onVideoError = (err: OnErrorData) => {
    const errorMessage = err.error?.localizedFailureReason || err.error?.localizedDescription || 'Unknown playback error';
    console.error('Video Playback Error:', errorMessage, err);
    setError(errorMessage);
    setIsPlaying(false);
    // Alert.alert('Playback Error', errorMessage); // Can be too intrusive if error is minor or auto-recovers
  };
  const onVideoEnd = () => {
    setIsPlaying(false);
    setProgress(prev => ({ ...prev, currentTime: prev.seekableDuration }));
  };

  return (
    <PlaybackContext.Provider value={{ currentTrack, isPlaying, isLoading, progress, error, playTrack, togglePlayPause, seekTo }}>
      {children}
      {streamUrl && (
        <Video
          ref={videoPlayerRef}
          source={{ uri: streamUrl }}
          paused={!isPlaying || isLoading}
          audioOnly={true}
          playInBackground={true}
          playWhenInactive={true} // Ensure this is true for background on iOS
          ignoreSilentSwitch={"ignore"} // ignore silent switch
          onError={onVideoError}
          onLoad={onVideoLoad}
          onProgress={onVideoProgress}
          onEnd={onVideoEnd}
          style={{ width: 0, height: 0 }}
          progressUpdateInterval={1000}
        />
      )}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = (): PlaybackContextType => {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
};
