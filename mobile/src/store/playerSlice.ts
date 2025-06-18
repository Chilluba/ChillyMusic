import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Song } from './songsSlice'; // Assuming a Song-like structure for track info

export interface PlayerTrackInfo extends Song { // Or a subset/superset
  uri: string; // Can be remote URL or local file URI
  isLocalFile?: boolean;
}

interface PlayerState {
  currentTrack: PlayerTrackInfo | null;
  isPlaying: boolean;
  progress: number; // Current playback progress in seconds
  duration: number; // Total duration of the track in seconds
  isLoading: boolean;
  error: string | null;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  isLoading: false,
  error: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<PlayerTrackInfo>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true; // Auto-play on setting new track (can be configured)
      state.progress = 0;
      state.duration = action.payload.duration || 0; // Get duration from track info
      state.isLoading = true; // Assume loading until player confirms playback
      state.error = null;
    },
    setPlaybackState: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    updateProgress: (state, action: PayloadAction<{ progress: number; duration?: number }>) => {
      state.progress = action.payload.progress;
      if (action.payload.duration) {
        state.duration = action.payload.duration;
      }
      state.isLoading = false; // Progress update means no longer loading initial track
    },
    setPlayerLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPlayerError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isPlaying = false;
    },
    clearPlayer: (state) => {
      state.currentTrack = null;
      state.isPlaying = false;
      state.progress = 0;
      state.duration = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setCurrentTrack,
  setPlaybackState,
  updateProgress,
  setPlayerLoading,
  setPlayerError,
  clearPlayer,
} = playerSlice.actions;

// Selectors
export const selectCurrentPlayerTrack = (state: RootState): PlayerTrackInfo | null => state.player.currentTrack;
export const selectIsPlayerPlaying = (state: RootState): boolean => state.player.isPlaying;
export const selectPlayerProgress = (state: RootState): number => state.player.progress;
export const selectPlayerDuration = (state: RootState): number => state.player.duration;
export const selectIsPlayerLoading = (state: RootState): boolean => state.player.isLoading;
export const selectPlayerError = (state: RootState): string | null => state.player.error;


export default playerSlice.reducer;
