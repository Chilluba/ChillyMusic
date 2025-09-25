import React, { useState, useEffect, MouseEvent, ChangeEvent, useRef } from 'react'; // Added useRef
import Icon from '../ui/Icon';
import { useWebPlayback } from '../../context/PlaybackContext';
// ... (other imports: DownloadOptionsPopover, apiService, types) ...

const EnhancedPlayer: React.FC<{onCloseProp?: () => void}> = ({ onCloseProp }) => {
  const { currentTrack, isPlaying, progress, isLoading: isLoadingPlayback, error: playbackError, togglePlayPause, clearPlayer, seekTo, audioRef, repeatMode, setRepeatMode, skipToNext, skipToPrevious } = useWebPlayback(); // Get audioRef from context

  // ... (states for download popover: downloadPopoverAnchor, etc.) ...
  const [volumeLevel, setVolumeLevel] = useState<number>(0.75); // Default volume 75%
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolumeBeforeMute, setPrevVolumeBeforeMute] = useState<number>(0.75);


  // Effect to set initial volume and mute state from audio element if it's already there
  useEffect(() => {
    if (audioRef?.current) {
      setVolumeLevel(audioRef.current.volume);
      setIsMuted(audioRef.current.muted);
      if (!audioRef.current.muted) {
        setPrevVolumeBeforeMute(audioRef.current.volume);
      }
    }
  }, [audioRef]);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolumeLevel(newVolume);
    if (audioRef?.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) { // If volume changed while muted, unmute
        setIsMuted(false);
        audioRef.current.muted = false;
      } else if (newVolume === 0 && !isMuted) { // If volume set to 0, reflect mute state
        setIsMuted(true);
         audioRef.current.muted = true;
      }
    }
    if (newVolume > 0) setPrevVolumeBeforeMute(newVolume); // Store last active volume
  };

  const handleMuteToggle = () => {
    if (audioRef?.current) {
      const currentlyMuted = !isMuted; // Target state
      setIsMuted(currentlyMuted);
      audioRef.current.muted = currentlyMuted;
      if (currentlyMuted) {
        // setPrevVolumeBeforeMute(volumeLevel); // Already done in handleVolumeChange or useEffect
        setVolumeLevel(0); // Visually update slider to 0 when muted
      } else {
        // Restore to previous volume or default if previous was 0
        const volToRestore = prevVolumeBeforeMute > 0 ? prevVolumeBeforeMute : 0.5;
        setVolumeLevel(volToRestore);
        audioRef.current.volume = volToRestore;
      }
    }
  };

  // ... (formatTime, handleOpenDownloadOptions, etc.) ...
  const handleClosePlayer = () => {
    if (onCloseProp) onCloseProp();
    else clearPlayer();
  };
  const buttonBaseStyle = 'p-1 md:p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary dark:focus-visible:ring-dark-accent-primary focus-visible:ring-offset-bg-secondary dark:focus-visible:ring-offset-dark-bg-secondary';


  if (!currentTrack) return null;
  // ... (albumArtUrl, displayTitle, etc.) ...
  const albumArtUrl = currentTrack.thumbnailUrl || 'https://via.placeholder.com/64';
  const displayTitle = currentTrack.title || 'Unknown Title';
  const displayArtist = currentTrack.channel || 'Unknown Artist';


  const getVolumeIconName = () => {
    if (isMuted || volumeLevel === 0) return 'VolumeMute';
    if (volumeLevel > 0.66) return 'VolumeHigh';
    // if (volumeLevel > 0.33) return 'VolumeMedium'; // Assuming VolumeMedium icon exists
    // return 'VolumeLow'; // Assuming VolumeLow icon exists
    // For now, only High and Mute exist. So, if not muted and volume > 0, show High.
    return 'VolumeHigh';
  };


  return (
    <>
      <div className='fixed inset-x-0 bottom-0 bg-bg-secondary dark:bg-dark-bg-secondary border-t border-border-primary dark:border-dark-border-primary shadow-top-lg z-50 flex flex-col'>
        <div className="flex items-center p-sm"> {/* Main content area */}
            <button onClick={handleClosePlayer} className={`absolute top-sm right-sm p-1 text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary z-10 ${buttonBaseStyle}`} aria-label='Close player'><Icon name='Close' size={20} /></button>

            <img src={albumArtUrl} alt={displayTitle} className='w-12 h-12 md:w-14 md:h-14 rounded-md shadow-md object-cover' />

            <div className='flex-1 min-w-0 ml-sm md:ml-md'>
                <p className='text-sm font-medium text-text-primary dark:text-dark-text-primary truncate' title={displayTitle}>{displayTitle}</p>
                <p className='text-xs text-text-muted dark:text-dark-text-muted truncate' title={displayArtist}>{displayArtist}</p>
                {/* Slider and Time Labels Container */}
                <div className='mt-xs md:mt-sm'>
                    <input
                      type='range'
                      min='0'
                      max={progress.seekableDuration > 0 ? progress.seekableDuration.toFixed(0) : "100"}
                      value={progress.currentTime.toFixed(0)}
                      onInput={(e: ChangeEvent<HTMLInputElement>) => seekTo(parseFloat(e.target.value))}
                      disabled={isLoadingPlayback || progress.seekableDuration === 0 || !!playbackError}
                      className='w-full h-1.5 rounded-full appearance-none cursor-pointer accent-accent-primary dark:accent-dark-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary/50 dark:focus-visible:ring-dark-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
                    />
                </div>
            </div>

            {/* Main Controls container */}
            <div className='flex items-center pl-sm md:pl-md ml-auto flex-shrink-0 self-center'>
                <button onClick={skipToPrevious} className={`text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={isLoadingPlayback || !currentTrack}><Icon name='SkipBack' size={24} /></button>
                <button onClick={togglePlayPause} className={`mx-xs md:mx-sm bg-accent-primary dark:bg-dark-accent-primary text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg hover:bg-opacity-80 dark:hover:bg-opacity-80 disabled:opacity-50 ${buttonBaseStyle}`} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={isLoadingPlayback || !currentTrack}>
                    <Icon name={isPlaying ? 'Pause' : 'Play'} size={isLoadingPlayback ? 0 : 28} />
                    {isLoadingPlayback && <svg className='animate-spin h-7 w-7 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'></circle><path d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' className='opacity-75' fill='currentColor'></path></svg>}
                </button>
                <button onClick={skipToNext} className={`text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={isLoadingPlayback || !currentTrack}><Icon name='SkipForward' size={24} /></button>
            </div>

            {/* Volume Control Section */}
            <div className='items-center ml-xs md:ml-sm self-center group hidden md:flex'> {/* Hide on small screens, flex on md+ */}
                <button onClick={handleMuteToggle} className={`p-1 text-text-primary dark:text-dark-text-primary hover:text-accent-primary dark:hover:text-dark-accent-primary rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary ${buttonBaseStyle}`}>
                    <Icon name={getVolumeIconName()} size={20} />
                </button>
                <input
                    type='range'
                    min='0' max='1' step='0.01'
                    value={isMuted ? 0 : volumeLevel}
                    onChange={handleVolumeChange}
                    className='w-16 md:w-20 h-1 rounded-full appearance-none cursor-pointer
                               accent-accent-primary dark:accent-dark-accent-primary
                               focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary
                               mx-1 group-hover:opacity-100 md:opacity-0 transition-opacity duration-300' // Slider fades in on group hover on larger screens
                    aria-label='Volume'
                />
            </div>
        </div>

        {/* Secondary Action Buttons Row - This was simplified in the prompt, ensure full structure is recalled if needed*/}
        <div className='mt-xs pt-xs border-t border-border-primary dark:border-dark-border-primary flex justify-around items-center px-sm pb-xs'>
            <button onClick={setRepeatMode} className={`text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={!currentTrack} title={`Repeat: ${repeatMode}`}>
                <Icon name={repeatMode === 'one' ? 'RepeatOne' : 'Repeat'} size={20} className={repeatMode !== 'off' ? 'text-accent-primary dark:text-dark-accent-primary' : ''} />
            </button>
            {/* Placeholder for actual Download button with popover logic */}
            <button onClick={() => alert("Download options TBD")} className={`text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={!currentTrack} title="Download options">
                <Icon name={'Download'} size={20} />
            </button>
            {/* Placeholder for actual Favorite button */}
            <button onClick={() => alert("Favorite TBD")} className={`text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={!currentTrack} title="Favorite">
                <Icon name={'HeartOutline'} size={20} />
            </button>
            <button onClick={() => alert('Add to Playlist functionality coming soon!')} className={`text-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-dark-accent-primary disabled:opacity-50 ${buttonBaseStyle}`} disabled={!currentTrack} title="Add to playlist">
                <Icon name='PlaylistAdd' size={20} />
            </button>
        </div>
      </div>
      {/* ... (DownloadOptionsPopover, if its state/trigger is managed here) ... */}
    </>
  );
};

export default EnhancedPlayer;
