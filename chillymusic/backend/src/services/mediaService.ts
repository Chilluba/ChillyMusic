import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Types defined in ../types/index.ts now, let's import them
import { MediaInfo, MediaFormatDetails, YtDlpFormat, YtDlpOutput } from '../types';


// Helper to select a 'best' audio format if multiple are available (not used in getMediaInfo directly, but for context)
const getBestAudioFormat = (formats: YtDlpFormat[]): YtDlpFormat | undefined => {
  return formats
    .filter(f => f.acodec !== 'none' && f.vcodec === 'none') // Ensure it's an audio-only format
    .sort((a, b) => (b.abr || 0) - (a.abr || 0)) // Prefer higher audio bitrate
    .find(f => f.ext === 'm4a' || f.ext === 'mp3'); // Prefer m4a or mp3
};

// Helper to get a few common video formats (not used in getMediaInfo directly, but for context)
const getVideoFormats = (formats: YtDlpFormat[]): YtDlpFormat[] => {
  const preferredResolutions = ['360p', '480p', '720p', '1080p'];
  const videoFormats: YtDlpFormat[] = [];

  formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none') // Ensure it has both video and audio
    .forEach(f => {
      const qualityLabel = f.format_note || (f.height ? `${f.height}p` : undefined);
      if (qualityLabel && preferredResolutions.includes(qualityLabel) && (f.ext === 'mp4' || f.ext === 'webm')) {
        if (!videoFormats.find(vf => vf.format_note === qualityLabel || vf.height === f.height)) {
          videoFormats.push(f);
        }
      }
    });
  return videoFormats.sort((a,b) => (a.height || 0) - (b.height || 0)); // Sort by height ascending
};


export const getMediaInfo = async (videoId: string): Promise<MediaInfo | null> => {
  const command = `yt-dlp -j --no-playlist --no-warnings "https://www.youtube.com/watch?v=${videoId}"`;
  console.log(`Executing command: ${command}`);

  try {
    const { stdout, stderr } = await execPromise(command, { timeout: 15000 }); // 15s timeout

    if (stderr) {
      console.warn(`yt-dlp stderr for ${videoId}: ${stderr}`); // Log stderr but attempt to parse stdout
    }

    if (!stdout) {
      console.error(`yt-dlp returned empty stdout for ${videoId}`);
      throw new Error('Failed to get media information: yt-dlp returned empty output.');
    }

    const data = JSON.parse(stdout) as YtDlpOutput;

    if (!data || data.extractor_key !== 'Youtube') { // Check if it's a valid YouTube video response
        console.error(`yt-dlp did not return valid YouTube data for ${videoId}`, data);
        throw new Error('Invalid data received from yt-dlp.');
    }

    const mapFormat = (fmt: YtDlpFormat): MediaFormatDetails => ({
      formatId: fmt.format_id,
      ext: fmt.ext as MediaFormatDetails['ext'], // Assuming YtDlpFormat['ext'] is compatible
      resolution: fmt.resolution || (fmt.height ? `${fmt.width}x${fmt.height}` : (fmt.vcodec !== 'none' && fmt.acodec === 'none' ? 'video only' : (fmt.vcodec === 'none' && fmt.acodec !== 'none' ? 'audio only': undefined))),
      qualityLabel: fmt.format_note || (fmt.height ? `${fmt.height}p` : (fmt.abr ? `${Math.round(fmt.abr)}kbps` : undefined)),
      filesize: fmt.filesize || fmt.filesize_approx,
      url: fmt.url, // This URL might be temporary or require specific headers/cookies
      abr: fmt.abr,
      vbr: fmt.vbr,
      fps: fmt.fps,
      protocol: fmt.protocol as MediaFormatDetails['protocol'],
      container: fmt.container,
      videoCodec: fmt.vcodec !== 'none' ? fmt.vcodec : undefined,
      audioCodec: fmt.acodec !== 'none' ? fmt.acodec : undefined,
    });

    const allFormats = (data.formats || []).map(mapFormat);

    return {
      videoId: data.id,
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnail || (data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : undefined),
      duration: data.duration,
      channel: data.channel || data.uploader,
      formats: allFormats,
    };

  } catch (error: any) {
    console.error(`Error executing yt-dlp for ${videoId}:`, error);
    if (error.message && (error.message.includes('Video unavailable') || error.message.includes('Private video') || error.message.includes('Premiere'))) {
      // Specific known yt-dlp errors that mean the video is not accessible
      return null;
    }
    if (error.killed && error.signal === 'SIGTERM') { // Timeout
        throw new Error(`Timeout fetching media information for ${videoId}.`);
    }
    // General error from yt-dlp or JSON parsing
    throw new Error(`Failed to process media information for ${videoId}: ${error.message}`);
  }
};

// Helper function to map user-friendly quality to yt-dlp format codes
// This is a simplified mapping and might need to be more sophisticated
const mapQualityToFormatCode = (
  ext: 'mp3' | 'mp4',
  quality: string,
  allFormats?: YtDlpFormat[] // Pass all available formats from getMediaInfo if needed for dynamic selection
): string => {
  if (ext === 'mp3') {
    switch (quality) {
      case '320kbps':
        return 'bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio'; // yt-dlp will convert if m4a is best
      case '192kbps':
        // Example: find a format with abr ~192 or let yt-dlp choose a good one and then convert
        return 'bestaudio[abr<=192][ext=m4a]/bestaudio[abr<=192][ext=mp3]/bestaudio[abr<=192]';
      case '128kbps':
      default:
        return 'bestaudio[abr<=128][ext=m4a]/bestaudio[abr<=128][ext=mp3]/bestaudio[abr<=128]';
    }
  }
  if (ext === 'mp4') {
    switch (quality) {
      case '1080p':
        return 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]';
      case '720p':
        return 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]';
      case '360p':
      default:
        return 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]';
    }
  }
  // Fallback to a generic best if no specific match
  return ext === 'mp3' ? 'bestaudio[ext=mp3]/bestaudio' : 'best[ext=mp4]/best';
};

export interface DownloadUrlResponse {
  downloadUrl: string;
  fileName?: string; // yt-dlp can also provide a suggested filename with -o flag
  // expiresAt?: number; // yt-dlp URLs are often temporary, but expiry is hard to get.
}

export const getDownloadUrl = async (
  videoId: string,
  formatExt: 'mp3' | 'mp4',
  quality: string
): Promise<DownloadUrlResponse | null> => {
  // It might be beneficial to first call getMediaInfo to see available formats,
  // then select the best matching format_id.
  // However, for simplicity now, we construct a format selection string for yt-dlp.

  const formatCode = mapQualityToFormatCode(formatExt, quality);

  // For MP3, yt-dlp often downloads audio (e.g., m4a) and then converts.
  // The --get-url flag might give the URL of the source before conversion for MP3.
  // To get a direct MP3 URL is complex if the source isn't MP3.
  // A common pattern is to download and convert server-side, then provide that file.
  // For this step, we'll assume --get-url gives something usable or we aim for the source audio.
  // If formatExt is 'mp3', we might need to use -x --audio-format mp3 and get filename, not URL.
  // Let's simplify: for mp3, we try to get best audio. For mp4, best video+audio.

  let command: string;
  if (formatExt === 'mp3') {
    // This command gets the URL of the best audio, which might be m4a, opus, etc.
    // It doesn't directly give an MP3 URL if the source isn't MP3.
    // True MP3 conversion usually means downloading and then running ffmpeg.
    // For now, we'll assume the client can handle the audio format or this is a placeholder for future server-side conversion.
    command = `yt-dlp -f "${formatCode}" --get-url --no-playlist --no-warnings "https://www.youtube.com/watch?v=${videoId}"`;
  } else { // mp4
    command = `yt-dlp -f "${formatCode}" --get-url --no-playlist --no-warnings "https://www.youtube.com/watch?v=${videoId}"`;
  }

  console.log(`Executing command for download URL: ${command}`);

  try {
    const { stdout, stderr } = await execPromise(command, { timeout: 20000 }); // 20s timeout

    if (stderr) {
      console.warn(`yt-dlp stderr for download URL (${videoId}, ${formatExt}, ${quality}): ${stderr}`);
    }

    const downloadUrl = stdout.trim();
    if (!downloadUrl || !downloadUrl.startsWith('http')) {
      console.error(`yt-dlp returned invalid URL: '${downloadUrl}' for ${videoId}`);
      throw new Error('Failed to get a valid download URL from yt-dlp.');
    }

    // Try to get a filename as well (optional)
    // yt-dlp -f <format_code> --get-filename -o "%(title)s.%(ext)s" <video_id>
    // This would be a separate call or integrated if yt-dlp allows multiple --get flags.
    // For now, we'll just provide the URL.

    return {
      downloadUrl: downloadUrl,
      // fileName: could be derived or fetched with another yt-dlp call using --get-filename
    };

  } catch (error: any) {
    console.error(`Error executing yt-dlp for download URL (${videoId}, ${formatExt}, ${quality}):`, error);
    if (error.killed && error.signal === 'SIGTERM') { // Timeout
        throw new Error(`Timeout getting download URL for ${videoId}.`);
    }
    throw new Error(`Failed to get download URL for ${videoId}: ${error.message}`);
  }
};
