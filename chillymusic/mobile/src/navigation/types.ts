import { SearchResult } from '../types';

export type RootStackParamList = {
  Home: undefined; // No params for Home
  SearchResults: { query: string; results: SearchResult[] };
  Library: undefined;
  Settings: undefined;
  // Add other screens here later
};
