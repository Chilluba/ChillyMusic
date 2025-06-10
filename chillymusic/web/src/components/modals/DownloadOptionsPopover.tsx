import React from 'react';
import { MediaInfo, MediaFormatDetails } from '../../types';
import Icon from '../ui/Icon'; // Assuming Icon component exists

// User-friendly download option structure (similar to mobile)
export interface DownloadOption {
  label: string;
  format: 'mp3' | 'mp4';
  quality: string;
  formatDetails?: MediaFormatDetails;
}

interface DownloadOptionsPopoverProps {
  mediaInfo: MediaInfo | null;
  isLoading: boolean;
  onSelectOption: (option: DownloadOption) => void;
  onClose: () => void; // For closing the popover/modal
  anchorElement: HTMLElement | null; // For positioning a popover
}

// Helper to generate download options (similar to mobile's generateDownloadOptions)
const generateDownloadOptions = (mediaInfo: MediaInfo | null): DownloadOption[] => {
  if (!mediaInfo?.formats) return [];
  const options: DownloadOption[] = [];
  const addedQualities: { [key: string]: boolean } = {};

  const audioFormats = mediaInfo.formats
    .filter(f => f.audioCodec && f.audioCodec !== 'none' && (!f.videoCodec || f.videoCodec === 'none'))
    .sort((a, b) => (b.abr || 0) - (a.abr || 0));

  if (audioFormats.length > 0) {
    const bestAudio = audioFormats[0];
    if (bestAudio.abr && bestAudio.abr >= 256) {
       options.push({ label: `MP3 - High (~${Math.round(bestAudio.abr)}kbps)`, format: 'mp3', quality: '320kbps', formatDetails: bestAudio });
    }
    if (bestAudio.abr && bestAudio.abr >= 190) {
       options.push({ label: `MP3 - Medium (~${Math.round(bestAudio.abr)}kbps)`, format: 'mp3', quality: '192kbps', formatDetails: bestAudio });
    }
    options.push({ label: `MP3 - Standard (~${bestAudio.abr ? Math.round(bestAudio.abr) : 128}kbps)`, format: 'mp3', quality: '128kbps', formatDetails: bestAudio });
  } else {
     options.push({ label: 'MP3 - 128kbps', format: 'mp3', quality: '128kbps' });
  }

  const videoQualities: { [quality: string]: MediaFormatDetails } = {};
  mediaInfo.formats.forEach(f => {
    if (f.ext === 'mp4' && f.videoCodec && f.videoCodec !== 'none' && f.audioCodec && f.audioCodec !== 'none') {
      const qualityLabel = f.resolution || f.qualityLabel || (f.height ? `${f.height}p` : null);
      if (qualityLabel && !videoQualities[qualityLabel]) {
        videoQualities[qualityLabel] = f;
      } else if (qualityLabel && f.fps && (f.fps > (videoQualities[qualityLabel]?.fps || 0))) {
        videoQualities[qualityLabel] = f;
      }
    }
  });

  const targetVideoQualities = {
      '360p': videoQualities['360p'] || mediaInfo.formats.find(f=>f.height === 360 && f.ext === 'mp4'),
      '720p': videoQualities['720p'] || mediaInfo.formats.find(f=>f.height === 720 && f.ext === 'mp4'),
      '1080p': videoQualities['1080p'] || mediaInfo.formats.find(f=>f.height === 1080 && f.ext === 'mp4'),
  };
  Object.entries(targetVideoQualities).forEach(([qualityKey, formatDetail]) => {
      if(formatDetail){
          const label = `MP4 - ${qualityKey} (${formatDetail.resolution || ''})`.trim();
          if (!addedQualities[label]) {
            options.push({ label, format: 'mp4', quality: qualityKey, formatDetails: formatDetail });
            addedQualities[label] = true;
          }
      } else {
          const label = `MP4 - ${qualityKey}`;
           if (!addedQualities[label]) {
            options.push({ label, format: 'mp4', quality: qualityKey });
            addedQualities[label] = true;
          }
      }
  });
  return options.filter((option, index, self) => index === self.findIndex((o) => o.label === option.label))
    .sort((a,b) => {
      if (a.format === 'mp3' && b.format === 'mp4') return -1;
      if (a.format === 'mp4' && b.format === 'mp3') return 1;
      return 0;
  });
};

const DownloadOptionsPopover: React.FC<DownloadOptionsPopoverProps> = ({
  mediaInfo,
  isLoading,
  onSelectOption,
  onClose,
  anchorElement,
}) => {
  const downloadOptions = React.useMemo(() => generateDownloadOptions(mediaInfo), [mediaInfo]);

  if (!anchorElement) return null;

  const rect = anchorElement.getBoundingClientRect();
  const style: React.CSSProperties = {
    position: 'absolute',
    top: rect.bottom + window.scrollY + 8, // Position below the anchor
    left: rect.left + window.scrollX,
    zIndex: 1000,
  };

  return (
    // Basic popover structure; a proper library like Headless UI or Popper.js would be better.
    // Adding a backdrop to close on click outside.
    <>
      <div className='fixed inset-0 bg-black/10 z-[999]' onClick={onClose} />
      <div style={style} className='bg-bg-tertiary text-text-primary rounded-md shadow-xl border border-border-primary min-w-[250px] max-h-[300px] overflow-y-auto p-sm'>
        <div className='flex justify-between items-center mb-xs'>
          <h3 className='text-lg font-semibold'>Download Options</h3>
          <button onClick={onClose} className='p-1 rounded hover:bg-bg-primary'>
            <Icon name='Close' size={20} />
          </button>
        </div>
        {isLoading && (
          <div className='flex justify-center items-center py-lg'>
            <svg className='animate-spin h-6 w-6 text-accent-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
          </div>
        )}
        {!isLoading && downloadOptions.length === 0 && (
          <p className='text-text-secondary py-md text-center'>No download options found.</p>
        )}
        {!isLoading && downloadOptions.length > 0 && (
          <ul className='divide-y divide-border-primary'>
            {downloadOptions.map(option => (
              <li key={option.label}>
                <button
                  onClick={() => onSelectOption(option)}
                  className='w-full text-left px-xs py-sm hover:bg-bg-primary rounded flex justify-between items-center'
                >
                  <span>{option.label}</span>
                  {option.formatDetails?.filesize ? (
                    <span className='text-xs text-text-muted'>
                      (~{(option.formatDetails.filesize / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default DownloadOptionsPopover;
