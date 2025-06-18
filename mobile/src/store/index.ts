import { configureStore } from '@reduxjs/toolkit';
import songsReducer from './songsSlice';
import playlistsReducer from './playlistsSlice';
import searchFiltersReducer from './searchFiltersSlice';
import searchReducer from './searchSlice';
import downloadsReducer from './downloadsSlice';
import playerReducer from './playerSlice'; // Import the new player slice reducer
import persistenceMiddleware from './persistenceMiddleware';

export const store = configureStore({
  reducer: {
    songs: songsReducer,
    playlists: playlistsReducer,
    searchFilters: searchFiltersReducer,
    search: searchReducer,
    downloads: downloadsReducer,
    player: playerReducer, // Add player slice reducer
    // other reducers can be added here
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistenceMiddleware),
  // Additional enhancers can be configured here
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks that are pre-typed (optional, but good practice)
// import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
