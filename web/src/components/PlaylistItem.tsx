import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deletePlaylist } from '../store/playlistsSlice';
import { AppDispatch } from '../store';

interface PlaylistItemProps {
  id: string;
  name: string;
  songCount: number;
  onPress: (playlistId: string) => void;
  onRenamePress: (playlistId: string, currentName: string) => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ id, name, songCount, onPress, onRenamePress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onRenamePress(id, name);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`Are you sure you want to delete the playlist "${name}"? This cannot be undone.`)) {
      dispatch(deletePlaylist({ id }));
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);


  return (
    <div
      className="flex justify-between items-center p-4 bg-background-secondary rounded-lg mb-2 border border-border cursor-pointer hover:bg-background-tertiary transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg"
      onClick={() => onPress(id)}
    >
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-text-primary">{name}</h2>
        <p className="text-sm text-text-secondary">{songCount} songs</p>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleMoreOptions}
          className="p-2 rounded-full hover:bg-background-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-background-tertiary rounded-md shadow-lg z-10 border border-border">
            <a
              href="#"
              onClick={handleRename}
              className="block px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary"
            >
              Rename
            </a>
            <a
              href="#"
              onClick={handleDelete}
              className="block px-4 py-2 text-sm text-error hover:bg-background-secondary"
            >
              Delete
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistItem;
