import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Video, { OnLoadData, OnProgressData, VideoRef } from 'react-native-video';
import { AppDispatch, RootState } from '../store';
import {
    PlayerTrackInfo,
    selectCurrentPlayerTrack,
    setPlaybackState,
    updateProgress,
    setPlayerLoading,
    setPlayerError,
    setCurrentTrack, // For potentially setting track from params if not already set
} from '../store/playerSlice';

// Props passed via navigation (example)
interface PlayerScreenProps {
  route?: {
    // Optional: if we decide to pass full track info via nav params
    // params?: PlayerTrackInfo;
  };
  navigation?: any; // React Navigation prop
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const videoRef = useRef<VideoRef>(null); // Ref for react-native-video

  // If track info is passed via route params, prioritize it, otherwise use from Redux state.
  // This handles deep linking or direct navigation with a new track.
  // const trackFromParams = route?.params;
  const currentTrack = useSelector(selectCurrentPlayerTrack); // Primarily rely on Redux state for current track
  const trackInfo = currentTrack; // Use track from Redux state

  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const isLoading = useSelector((state: RootState) => state.player.isLoading);
  const progress = useSelector((state: RootState) => state.player.progress);
  const duration = useSelector((state: RootState) => state.player.duration);
  const error = useSelector((state: RootState) => state.player.error);

  // Effect to handle track loading if params are passed and differ from current track in store
  // This is more for if PlayerScreen is reusable for various entry points.
  // For downloads, DownloadsScreen already dispatches setCurrentTrack.
  // useEffect(() => {
  //   if (trackFromParams && trackFromParams.uri !== currentTrack?.uri) {
  //     dispatch(setCurrentTrack(trackFromParams));
  //   }
  // }, [trackFromParams, currentTrack, dispatch]);

  // Set initial loading state when trackInfo changes or URI is available
  useEffect(() => {
    if (trackInfo?.uri) {
      dispatch(setPlayerLoading(true));
      dispatch(setPlayerError(null)); // Clear previous errors
    }
  }, [trackInfo?.uri, dispatch]);


  const onVideoLoad = (data: OnLoadData) => {
    console.log('Video loaded:', data.duration);
    dispatch(updateProgress({ progress: 0, duration: data.duration }));
    dispatch(setPlayerLoading(false));
    // dispatch(setPlaybackState(true)); // Auto-play if desired, or respect current isPlaying state
  };

  const onVideoProgress = (data: OnProgressData) => {
    dispatch(updateProgress({ progress: data.currentTime }));
  };

  const onVideoError = (videoError: any) => {
    console.error('Video Error:', JSON.stringify(videoError));
    let errorMessage = 'Playback error occurred.';
    if (videoError.error) {
      if (videoError.error.localizedDescription) {
        errorMessage = videoError.error.localizedDescription;
      } else if (videoError.error.code) {
        errorMessage = `Error code: ${videoError.error.code}`;
      } else if (videoError.error.message) {
        errorMessage = videoError.error.message;
      }
    }
    dispatch(setPlayerError(errorMessage));
    dispatch(setPlayerLoading(false));
  };

  const onVideoEnd = () => {
    console.log('Video ended');
    dispatch(setPlaybackState(false));
    dispatch(updateProgress({ progress: duration })); // Mark as finished
    // TODO: Implement next track in queue, repeat, etc.
  };

  const togglePlayPause = () => {
    if (trackInfo?.uri) { // Only allow toggle if there's a track
        dispatch(setPlaybackState(!isPlaying));
    }
  };

  const seekForward = () => {
    if(videoRef.current && duration > 0) {
        const newTime = Math.min(progress + 15, duration);
        videoRef.current.seek(newTime);
        dispatch(updateProgress({ progress: newTime }));
    }
  };

  const seekBackward = () => {
    if(videoRef.current) {
        const newTime = Math.max(progress - 15, 0);
        videoRef.current.seek(newTime);
        dispatch(updateProgress({ progress: newTime }));
    }
  };


  if (!trackInfo || !trackInfo.uri) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>No track selected for playback.</Text>
        {/* Optionally, a button to go back or to a library screen */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Now Playing</Text>
      {trackInfo.thumbnail && <Image source={{uri: trackInfo.thumbnail}} style={styles.thumbnail} />}
      <Text style={styles.trackTitle} numberOfLines={1}>{trackInfo.title || 'Unknown Title'}</Text>
      <Text style={styles.artistName} numberOfLines={1}>{trackInfo.artist || 'Unknown Artist'}</Text>
      {trackInfo.isLocalFile && <Text style={styles.localFileText}>(Playing from Downloads)</Text>}

      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: trackInfo.uri }}
          style={styles.videoElement}
          controls={false} // Using custom controls
          paused={!isPlaying}
          onLoad={onVideoLoad}
          onProgress={onVideoProgress}
          onError={onVideoError}
          onEnd={onVideoEnd}
          resizeMode="contain"
          playInBackground={true} // Basic background play config
          playWhenInactive={true} // For iOS control center
          ignoreSilentSwitch={"ignore"} // For iOS, play even if ringer is off
          progressUpdateInterval={1000} // Update progress every second
          onBuffer={({ isBuffering }) => dispatch(setPlayerLoading(isBuffering))}
        />
        {isLoading && (
            <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" color="#FFF" />
            </View>
        )}
         {error && !isLoading && (
            <View style={styles.errorOverlay}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        )}
      </View>

      {/* Basic Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }]} />
      </View>
      <Text style={styles.progressText}>
        {new Date(progress * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
      </Text>

      <View style={styles.controlsContainer}>
         <TouchableOpacity style={styles.controlButton} onPress={seekBackward}>
          <Text style={styles.controlButtonText}>⏪ 15s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
          <Text style={styles.controlButtonText}>{isPlaying ? '❚❚ Pause' : '▶ Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={seekForward}>
          <Text style={styles.controlButtonText}>15s ⏩</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1117', // Background Primary
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 20,
  },
  thumbnail: {
      width: 200,
      height: 200,
      borderRadius: 10,
      marginBottom: 15,
  },
  trackTitle: {
    fontSize: 18,
    color: '#F0F6FC',
    fontWeight: '600',
    textAlign: 'center',
  },
  artistName: {
    fontSize: 16,
    color: '#8B949E',
    marginBottom: 10,
  },
  uriText: {
      fontSize: 12,
      color: '#6E7681',
      marginBottom: 5,
  },
  localFileText: {
      fontSize: 12,
      color: '#2DA44E', // Accent
      marginBottom: 10,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  videoElement: { // Style for actual Video component
    // position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
    width: '100%',
    height: '100%',
  },
  videoStatusText: {
      color: '#FFF',
      fontSize: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 10,
  },
  controlButton: {
    backgroundColor: '#2DA44E', // Accent Primary
    padding: 10,
    borderRadius: 5,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
  },
  progressText: {
      color: '#8B949E',
      fontSize: 14,
  },
  errorText: {
    color: '#F85149', // Error color
    textAlign: 'center',
  }
});

export default PlayerScreen;
