import { configureStore } from '@reduxjs/toolkit';
import songsReducer from './songsSlice';
import playlistsReducer from './playlistsSlice';
import searchFiltersReducer from './searchFiltersSlice';
import searchReducer from './searchSlice';
import downloadsReducer from './downloadsSlice';
import playerReducer from './playerSlice';
import { apiSlice } from './apiSlice'; // Import the apiSlice
import persistenceMiddleware from './persistenceMiddleware';

export const store = configureStore({
  reducer: {
    songs: songsReducer,
    playlists: playlistsReducer,
    searchFilters: searchFiltersReducer,
    search: searchReducer, // This might be partially or fully replaced by apiSlice for results
    downloads: downloadsReducer,
    player: playerReducer,
    [apiSlice.reducerPath]: apiSlice.reducer, // Add the apiSlice reducer
    // other reducers can be added here
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(persistenceMiddleware)
      .concat(apiSlice.middleware), // Add the apiSlice middleware
  // Additional enhancers can be configured here
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks that are pre-typed (optional, but good practice)
// import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
