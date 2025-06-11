import React, { useState, useEffect, MouseEvent, ChangeEvent } from 'react';
// ... (imports) ...
const EnhancedPlayer: React.FC<{onCloseProp?: () => void}> = ({ onCloseProp }) => {
  // ... (context, state, functions) ...
  const buttonBaseStyle = 'p-1 md:p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary dark:focus-visible:ring-dark-accent-primary focus-visible:ring-offset-bg-secondary dark:focus-visible:ring-offset-dark-bg-secondary';

  if (!currentTrack) return null;
  return (
    <>
      <div className='fixed inset-x-0 bottom-0 ...'>
        <button onClick={handleClosePlayer} className={`absolute top-sm right-sm p-1 text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary z-10 ${buttonBaseStyle}`} aria-label='Close player'><Icon name='Close' size={20} /></button>
        {/* ... (Track Info, Album Art) ... */}
        <div className='flex items-center pl-sm md:pl-md ml-auto flex-shrink-0 self-center'> {/* Main Controls */}
          <button onClick={skipToPrevious} className={`text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={isLoadingPlayback || !currentTrack}><Icon name='SkipBack' size={24} /></button>
          <button onClick={togglePlayPause} className={`mx-xs md:mx-sm bg-accent-primary dark:bg-dark-accent-primary text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg hover:bg-opacity-80 dark:hover:bg-opacity-80 disabled:opacity-50 ${buttonBaseStyle}`} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={isLoadingPlayback || !currentTrack /*...*/}>
            {/* ... Play/Pause Icon ... */}
          </button>
          <button onClick={skipToNext} className={`text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={isLoadingPlayback || !currentTrack}><Icon name='SkipForward' size={24} /></button>
        </div>
        {/* ... (Secondary Action Buttons Row - apply buttonBaseStyle or similar to its buttons) ... */}
        <div className='mt-sm pt-sm border-t ... flex justify-around items-center'>
            <button onClick={() => alert('Repeat TBD')} className={`text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={!currentTrack}>
                <Icon name={repeatMode === 'one' ? 'RepeatOne' : 'Repeat'} size={20} className={repeatMode !== 'off' ? 'text-accent-primary dark:text-dark-accent-primary' : ''} />
            </button>
            {/* Apply to other action buttons: Download, Favorite, PlaylistAdd */}
        </div>
      </div>
      {/* ... (DownloadOptionsPopover) ... */}
    </>
  );
};
export default EnhancedPlayer;
