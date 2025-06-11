import { SearchResult, DownloadedMediaItem } from '../types'; // Ensure both are imported

export interface PlaybackProgressState { // For passing progress
  currentTime: number;
  seekableDuration: number;
}

export type PlayerScreenTrack = SearchResult | DownloadedMediaItem; // Track can be from search or library

export interface PlayerScreenParams {
  track: PlayerScreenTrack;
  isPlaying: boolean;
  progress?: PlaybackProgressState;
  // Add other necessary params like current stream URL if not handled by context later
}

export type RootStackParamList = {
  Home: undefined; // No params for Home
  SearchResults: { query: string; results: SearchResult[] };
  Library: undefined;
  Settings: undefined;
  Player: PlayerScreenParams;
  Downloads: undefined;
  // Add other screens here later
};
