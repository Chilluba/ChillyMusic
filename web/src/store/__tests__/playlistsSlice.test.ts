import playlistsReducer, {
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  loadPlaylists,
  Playlist, // Assuming Playlist interface is exported from the slice
  PlaylistsState, // Assuming PlaylistsState (EntityState<Playlist>) is implicitly handled or defined
} from '../playlistsSlice'; // Adjust path as necessary
import { EntityState } from '@reduxjs/toolkit';

// Mocking uuid
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
import { v4 as uuidv4 } from 'uuid';

// Mocking Date.now()
const mockDateNow = Date.now();
jest.spyOn(global.Date, 'now').mockImplementation(() => mockDateNow);

// Define a minimal initial state for testing, similar to how createEntityAdapter initializes
const getInitialState = (): EntityState<Playlist> => ({
    ids: [],
    entities: {},
});


describe('playlistsSlice', () => {
  let testInitialState: EntityState<Playlist>;

  beforeEach(() => {
    testInitialState = getInitialState();
    // Reset mock for uuid if it's called multiple times in tests
    (uuidv4 as jest.Mock).mockClear();
  });

  it('should return the initial state', () => {
    expect(playlistsReducer(undefined, { type: 'unknown' })).toEqual(getInitialState());
  });

  describe('createPlaylist', () => {
    it('should add a new playlist with generated id and timestamps', () => {
      const mockUuid = 'test-uuid-1';
      (uuidv4 as jest.Mock).mockReturnValue(mockUuid);
      const expectedDate = new Date(mockDateNow).toISOString();

      const action = createPlaylist({ name: 'My Chill Mix' });
      const nextState = playlistsReducer(testInitialState, action);

      const expectedPlaylist: Playlist = {
        id: mockUuid,
        name: 'My Chill Mix',
        songIds: [],
        createdAt: expectedDate,
        updatedAt: expectedDate,
        description: undefined, // Or an empty string if that's the default
      };

      expect(nextState.ids).toContain(mockUuid);
      expect(nextState.entities[mockUuid]).toEqual(expectedPlaylist);
    });
  });

  describe('renamePlaylist', () => {
    it('should rename an existing playlist and update updatedAt', () => {
      const playlistId = 'p1';
      const initialPlaylist: Playlist = {
        id: playlistId, name: 'Old Name', songIds: [],
        createdAt: new Date(mockDateNow - 1000).toISOString(), // Older date
        updatedAt: new Date(mockDateNow - 1000).toISOString(),
      };
      const stateWithPlaylist: EntityState<Playlist> = {
        ids: [playlistId],
        entities: { [playlistId]: initialPlaylist },
      };
      const newName = 'New Awesome Playlist';
      const action = renamePlaylist({ id: playlistId, newName });

      // Mock a new Date.now() for the update operation
      const updatedMockDateNow = mockDateNow + 5000; // 5 seconds later
      (global.Date.now as jest.Mock).mockReturnValueOnce(updatedMockDateNow);

      const nextState = playlistsReducer(stateWithPlaylist, action);

      expect(nextState.entities[playlistId]?.name).toBe(newName);
      expect(nextState.entities[playlistId]?.updatedAt).toBe(new Date(updatedMockDateNow).toISOString());
      expect(nextState.entities[playlistId]?.createdAt).toBe(initialPlaylist.createdAt); // CreatedAt should not change
    });

    it('should not change state if playlist to rename does not exist', () => {
      const action = renamePlaylist({ id: 'non-existent-id', newName: 'New Name' });
      const nextState = playlistsReducer(testInitialState, action);
      expect(nextState).toEqual(testInitialState);
    });
  });

  describe('deletePlaylist', () => {
    it('should remove an existing playlist', () => {
      const playlistId = 'p1';
      const stateWithPlaylist: EntityState<Playlist> = {
        ids: [playlistId],
        entities: { [playlistId]: { id: playlistId, name: 'To Delete', songIds: [], createdAt: '', updatedAt: '' } },
      };
      const action = deletePlaylist({ id: playlistId });
      const nextState = playlistsReducer(stateWithPlaylist, action);

      expect(nextState.ids).not.toContain(playlistId);
      expect(nextState.entities[playlistId]).toBeUndefined();
    });

    it('should not change state if playlist to delete does not exist', () => {
      const action = deletePlaylist({ id: 'non-existent-id' });
      const nextState = playlistsReducer(testInitialState, action);
      expect(nextState).toEqual(testInitialState);
    });
  });

  describe('addSongToPlaylist', () => {
    const playlistId = 'p1';
    const initialPlaylist: Playlist = {
      id: playlistId, name: 'My Playlist', songIds: ['s1'],
      createdAt: new Date(mockDateNow - 1000).toISOString(),
      updatedAt: new Date(mockDateNow - 1000).toISOString(),
    };
    const stateWithPlaylist: EntityState<Playlist> = {
      ids: [playlistId],
      entities: { [playlistId]: initialPlaylist },
    };

    it('should add a new songId to an existing playlist and update updatedAt', () => {
      const songIdToAdd = 's2';
      const action = addSongToPlaylist({ playlistId, songId: songIdToAdd });

      const updatedMockDateNow = mockDateNow + 5000;
      (global.Date.now as jest.Mock).mockReturnValueOnce(updatedMockDateNow);

      const nextState = playlistsReducer(stateWithPlaylist, action);

      expect(nextState.entities[playlistId]?.songIds).toContain(songIdToAdd);
      expect(nextState.entities[playlistId]?.songIds.length).toBe(2);
      expect(nextState.entities[playlistId]?.updatedAt).toBe(new Date(updatedMockDateNow).toISOString());
    });

    it('should not add a duplicate songId to a playlist', () => {
      const songIdToAdd = 's1'; // Already exists
      const action = addSongToPlaylist({ playlistId, songId: songIdToAdd });
      const nextState = playlistsReducer(stateWithPlaylist, action);

      expect(nextState.entities[playlistId]?.songIds.length).toBe(1); // Length should remain 1
      expect(nextState.entities[playlistId]?.updatedAt).toBe(initialPlaylist.updatedAt); // UpdatedAt should not change
    });

    it('should not change state if playlist does not exist', () => {
      const action = addSongToPlaylist({ playlistId: 'non-existent-playlist', songId: 's3' });
      const nextState = playlistsReducer(testInitialState, action);
      expect(nextState).toEqual(testInitialState);
    });
  });

  describe('removeSongFromPlaylist', () => {
    const playlistId = 'p1';
    const songIdToRemove = 's2';
    const initialPlaylist: Playlist = {
      id: playlistId, name: 'My Playlist', songIds: ['s1', songIdToRemove, 's3'],
      createdAt: new Date(mockDateNow - 1000).toISOString(),
      updatedAt: new Date(mockDateNow - 1000).toISOString(),
    };
     const stateWithPlaylist: EntityState<Playlist> = {
      ids: [playlistId],
      entities: { [playlistId]: initialPlaylist },
    };

    it('should remove an existing songId from a playlist and update updatedAt', () => {
      const action = removeSongFromPlaylist({ playlistId, songId: songIdToRemove });

      const updatedMockDateNow = mockDateNow + 7000;
      (global.Date.now as jest.Mock).mockReturnValueOnce(updatedMockDateNow);

      const nextState = playlistsReducer(stateWithPlaylist, action);

      expect(nextState.entities[playlistId]?.songIds).not.toContain(songIdToRemove);
      expect(nextState.entities[playlistId]?.songIds.length).toBe(2);
      expect(nextState.entities[playlistId]?.updatedAt).toBe(new Date(updatedMockDateNow).toISOString());
    });

    it('should not change songIds or updatedAt if songId to remove does not exist in playlist', () => {
      const action = removeSongFromPlaylist({ playlistId, songId: 'non-existent-song' });
      const nextState = playlistsReducer(stateWithPlaylist, action);

      expect(nextState.entities[playlistId]?.songIds.length).toBe(3);
      expect(nextState.entities[playlistId]?.updatedAt).toBe(initialPlaylist.updatedAt);
    });

    it('should not change state if playlist does not exist', () => {
        const action = removeSongFromPlaylist({ playlistId: 'non-existent-playlist', songId: 's1' });
        const nextState = playlistsReducer(testInitialState, action);
        expect(nextState).toEqual(testInitialState);
      });
  });

  describe('loadPlaylists', () => {
    it('should replace the state with loaded playlists', () => {
      const playlistsToLoad: Playlist[] = [
        { id: 'p1', name: 'Loaded Playlist 1', songIds: ['s1'], createdAt: 'date1', updatedAt: 'date1' },
        { id: 'p2', name: 'Loaded Playlist 2', songIds: ['s2', 's3'], createdAt: 'date2', updatedAt: 'date2' },
      ];
      const action = loadPlaylists(playlistsToLoad);
      const nextState = playlistsReducer(testInitialState, action);

      expect(nextState.ids.length).toBe(2);
      expect(nextState.ids).toContain('p1');
      expect(nextState.ids).toContain('p2');
      expect(nextState.entities['p1']).toEqual(playlistsToLoad[0]);
      expect(nextState.entities['p2']).toEqual(playlistsToLoad[1]);
    });
  });
});
