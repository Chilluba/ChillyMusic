import { createSlice, PayloadAction, EntityState, createEntityAdapter } from '@reduxjs/toolkit';

export interface Song {
  id: string; // videoId from SearchResult, or a unique ID if it's from another source
  title: string;
  artist: string; // 'channel' from SearchResult can map to 'artist'
  duration: number; // in seconds
  thumbnail: string; // URL
  videoId: string; // Essential for linking back to YouTube or for re-fetching
  filePath?: string; // For downloaded songs
  addedAt: string; // ISO Date string, when this song info was added to our app's song list
}

// Using createEntityAdapter for normalized state
const songsAdapter = createEntityAdapter<Song>({
  // Keep the default sort order (by ID) or specify one if needed
  // selectId: (song) => song.id, // This is the default
});

const initialState: EntityState<Song> = songsAdapter.getInitialState();

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    addSong: (state, action: PayloadAction<Song>) => {
      songsAdapter.upsertOne(state, action.payload); // upsert = add or update
    },
    addSongs: (state, action: PayloadAction<Song[]>) => {
      songsAdapter.upsertMany(state, action.payload);
    },
    removeSong: (state, action: PayloadAction<string>) => { // Action payload is songId
      songsAdapter.removeOne(state, action.payload);
    },
    updateSong: (state, action: PayloadAction<{ id: string; changes: Partial<Song> }>) => {
      songsAdapter.updateOne(state, { id: action.payload.id, changes: action.payload.changes });
    },
    clearSongs: (state) => {
      songsAdapter.removeAll(state);
    },
    setSongs: (state, action: PayloadAction<Song[]>) => { // For loading from storage
      songsAdapter.setAll(state, action.payload);
    }
  },
});

export const {
  addSong,
  addSongs,
  removeSong,
  updateSong,
  clearSongs,
  setSongs,
} = songsSlice.actions;

// Selectors
// Making the selector RootState type more generic for web, can be defined in store/index.ts
export const {
  selectById: selectSongById,
  selectAll: selectAllSongs,
  selectIds: selectSongIds,
  selectTotal: selectTotalSongs,
} = songsAdapter.getSelectors((state: any) => state.songs);

export default songsSlice.reducer;
