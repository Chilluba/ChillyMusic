import React, { useState, useEffect, MouseEvent, ChangeEvent, useCallback } from 'react';
import Icon from '../ui/Icon';
import { useWebPlayback } from '../../context/PlaybackContext';
import * as webFavoritesService from '../../services/webFavoritesService'; // Corrected path
import { DownloadedMediaItem, FavoriteItem } from '../../types'; // Assuming types are needed
// import { useDownloadOptions } from './useDownloadOptions'; // If download logic is complex

const EnhancedPlayer: React.FC<{onCloseProp?: () => void}> = ({ onCloseProp }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading: isLoadingPlayback,
    progress,
    playbackError,
    togglePlayPause,
    seekTo, // Assuming seekTo is used by handleSeek
    playNextTrack: handleNextTrack, // Assuming these are from context
    playPreviousTrack: handlePreviousTrack,
    canSkipNext,
    canSkipPrevious,
    toggleRepeatMode: setRepeatMode, // Aliasing for clarity if preferred
    repeatMode,
    // volume, // If volume control is part of context
    // setVolume,
  } = useWebPlayback();

  const [isCurrentTrackFavorite, setIsCurrentTrackFavorite] = useState(false);
  // Placeholder for download options state/handlers if not already part of a custom hook or context
  const [isLoadingDownloadOptions, setIsLoadingDownloadOptions] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState<any[]>([]); // Simplified
  const [isDownloadOptionsOpen, setIsDownloadOptionsOpen] = useState(false);

  // const { openDownloadOptions, ... } = useDownloadOptions(currentTrack); // Example if using a hook

  // Placeholder: actual download initiation would be more complex
  const handleOpenDownloadOptions = async () => {
    if (!currentTrack) return;
    setIsLoadingDownloadOptions(true);
    // Simulate fetching options or use actual API call
    // const options = await fetchDownloadOptions(currentTrack.videoId);
    // setDownloadOptions(options);
    setIsDownloadOptionsOpen(true); // This would typically open a modal/popover
    setIsLoadingDownloadOptions(false);
    alert("Download options would appear here.");
  };


  useEffect(() => {
    if (currentTrack) {
      webFavoritesService.isFavorite(currentTrack.videoId).then(setIsCurrentTrackFavorite);
    } else {
      setIsCurrentTrackFavorite(false);
    }
  }, [currentTrack]);

  const handleToggleFavorite = useCallback(async () => {
    if (!currentTrack) return;
    try {
      const favoriteItem: FavoriteItem = {
        videoId: currentTrack.videoId,
        title: currentTrack.title,
        channel: currentTrack.channel || '',
        thumbnail: currentTrack.thumbnailUrl || '', // Ensure field matches type
      };
      if (isCurrentTrackFavorite) {
        await webFavoritesService.removeFavorite(currentTrack.videoId);
        setIsCurrentTrackFavorite(false);
        // Consider a toast notification here instead of alert
        // alert('Unfavorited');
      } else {
        await webFavoritesService.addFavorite(favoriteItem);
        setIsCurrentTrackFavorite(true);
        // alert('Favorited');
      }
    } catch (error) {
      console.error("Error toggling web favorite:", error);
      alert('Error updating favorites.');
    }
  }, [currentTrack, isCurrentTrackFavorite]);


  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    // ... (existing seek logic)
  };

  if (!currentTrack) return null; // currentTrack from context
  // ... (albumArtUrl, displayTitle, etc. from context.currentTrack) ...

  return (
    <>
      <div className='fixed inset-x-0 bottom-0 bg-bg-secondary dark:bg-dark-bg-secondary ... z-50 ...'>
        {/* ... (player structure) ... */}
        <div className='flex-1 min-w-0 pt-1 md:pt-0'>
          {/* ... (track info, loading/error messages) ... */}
          <div className='mt-xs md:mt-sm'> {/* Slider and Time Labels Container */}
            <input
              type='range'
              min='0'
              max={progress.seekableDuration > 0 ? progress.seekableDuration : 100}
              value={progress.currentTime} // Or local sliderValue for smoother dragging if implemented that way
              onInput={handleSeek} // Changed from onChange for more responsive seeking during drag
                                   // onChange would be more like onSlidingComplete
              disabled={isLoadingPlayback || progress.seekableDuration === 0 || !!playbackError}
              className='w-full h-1.5 rounded-full appearance-none cursor-pointer
                         accent-accent-primary dark:accent-dark-accent-primary
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary/50 dark:focus:ring-dark-accent-primary/50
                         disabled:opacity-50 disabled:cursor-not-allowed'
              // Removed inline pseudo-element classes:
              // [&::-webkit-slider-thumb]:appearance-none
              // [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 ... etc.
              // These are now handled by globals.css
            />
            <div className='flex justify-between text-xs text-text-muted dark:text-dark-text-muted mt-1'>
              {/* ... time labels ... */}
            </div>
          </div>
        </div>

        {/* Main Controls (Play/Pause, Prev, Next) - Assuming these are managed by useWebPlayback and rendered */}
        {/* For example:
        <div className='flex items-center justify-center space-x-2 p-1'>
          <button onClick={handlePreviousTrack} className='p-1 ...' disabled={!canSkipPrevious}><Icon name='SkipBack' size={24} /></button>
          <button onClick={togglePlayPause} className='p-1 ...'><Icon name={isPlaying ? 'Pause' : 'Play'} size={36} /></button>
          <button onClick={handleNextTrack} className='p-1 ...' disabled={!canSkipNext}><Icon name='SkipForward' size={24} /></button>
        </div>
        */}

        {/* Secondary Action Buttons Row */}
        <div className="flex items-center justify-around md:justify-end space-x-1 md:space-x-2 px-2 py-1 md:absolute md:right-2 md:bottom-10">
          {/* Repeat Button */}
          <button
            onClick={setRepeatMode}
            className='p-1 text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50'
            disabled={!currentTrack}
            title={`Repeat mode: ${repeatMode}`}
          >
            <Icon
              name={repeatMode === 'off' ? 'Repeat' : repeatMode === 'track' ? 'RepeatOne' : 'Repeat'}
              size={20}
              className={repeatMode !== 'off' ? 'text-accent-primary dark:text-dark-accent-primary' : 'text-text-secondary dark:text-dark-text-secondary'}
            />
          </button>

          {/* Download Button Placeholder (actual might involve popover) */}
          <button
            onClick={() => handleOpenDownloadOptions()} // Assuming handleOpenDownloadOptions exists
            className='p-1 text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50'
            disabled={!currentTrack || isLoadingDownloadOptions} // Assuming isLoadingDownloadOptions exists
            title="Download options"
          >
            <Icon name={'Download'} size={20} />
             {/* More complex logic for icon based on download state can be here */}
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className='p-1 text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50'
            disabled={!currentTrack}
            title={isCurrentTrackFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Icon
              name={isCurrentTrackFavorite ? 'HeartFilled' : 'HeartOutline'}
              size={20}
              className={isCurrentTrackFavorite ? 'text-accent-primary dark:text-dark-accent-primary' : 'text-text-secondary dark:text-dark-text-secondary'}
            />
          </button>

          {/* Add to Playlist Button */}
          <button
            onClick={() => alert('Add to Playlist functionality coming soon!')}
            className='p-1 text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50'
            disabled={!currentTrack}
            title="Add to playlist"
          >
            <Icon name='PlaylistAdd' size={20} />
          </button>

          {/* Volume Control Placeholder - Actual volume control is more complex */}
          {/*
          <div className="flex items-center space-x-1">
            <Icon name={volume > 0.5 ? 'VolumeUp' : volume > 0 ? 'VolumeDown' : 'VolumeMute'} size={20} />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
                   className="w-16 h-1 accent-accent-primary dark:accent-dark-accent-primary" />
          </div>
          */}
        </div>
      </div>
      {/* ... (DownloadOptionsPopover) ... */}
    </>
  );
};
// Ensure full component structure and styles are maintained by subtask worker.
// Only showing relevant parts for slider style update.

export default EnhancedPlayer;
