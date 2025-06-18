import { createSlice, PayloadAction, EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { Song } from './songsSlice'; // Assuming Song is exported from songsSlice or a common types file

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

const playlistsAdapter = createEntityAdapter<Playlist>({
  sortComparer: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(), // Newest first
});

const initialState: EntityState<Playlist> = playlistsAdapter.getInitialState();

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    createPlaylist: (state, action: PayloadAction<{ name: string; description?: string }>) => {
      const now = new Date().toISOString();
      const newPlaylist: Playlist = {
        id: uuidv4(),
        name: action.payload.name,
        songIds: [],
        createdAt: now,
        updatedAt: now,
        description: action.payload.description,
      };
      playlistsAdapter.addOne(state, newPlaylist);
    },
    renamePlaylist: (state, action: PayloadAction<{ id: string; newName: string }>) => {
      const { id, newName } = action.payload;
      const existingPlaylist = state.entities[id];
      if (existingPlaylist) {
        playlistsAdapter.updateOne(state, {
          id,
          changes: { name: newName, updatedAt: new Date().toISOString() },
        });
      }
    },
    deletePlaylist: (state, action: PayloadAction<{ id: string }>) => {
      playlistsAdapter.removeOne(state, action.payload.id);
      // Note: This does not remove songs from the songsSlice, only the playlist itself.
      // Song cleanup would be a more complex operation if songs are only tied to playlists.
    },
    addSongToPlaylist: (state, action: PayloadAction<{ playlistId: string; songId: string }>) => {
      const { playlistId, songId } = action.payload;
      const playlist = state.entities[playlistId];
      if (playlist) {
        // Ensure songId is not already in the playlist to prevent duplicates
        if (!playlist.songIds.includes(songId)) {
          playlist.songIds.push(songId);
          playlist.updatedAt = new Date().toISOString();
        }
      }
    },
    removeSongFromPlaylist: (state, action: PayloadAction<{ playlistId: string; songId: string }>) => {
      const { playlistId, songId } = action.payload;
      const playlist = state.entities[playlistId];
      if (playlist) {
        playlist.songIds = playlist.songIds.filter(id => id !== songId);
        playlist.updatedAt = new Date().toISOString();
      }
    },
    loadPlaylists: (state, action: PayloadAction<Playlist[]>) => {
      playlistsAdapter.setAll(state, action.payload);
    },
    // For reordering songs within a playlist, if needed in the future
    // reorderSongsInPlaylist: (state, action: PayloadAction<{ playlistId: string; newSongIds: string[] }>) => {
    //   const { playlistId, newSongIds } = action.payload;
    //   const playlist = state.entities[playlistId];
    //   if (playlist) {
    //     playlist.songIds = newSongIds;
    //     playlist.updatedAt = new Date().toISOString();
    //   }
    // },
  },
});

export const {
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  loadPlaylists,
} = playlistsSlice.actions;

// Selectors
export const {
  selectById: selectPlaylistById,
  selectAll: selectAllPlaylists,
  selectIds: selectPlaylistIds,
  selectTotal: selectTotalPlaylists,
} = playlistsAdapter.getSelectors((state: any) => state.playlists); // Assuming 'playlists' is the key

export default playlistsSlice.reducer;
