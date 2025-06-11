import { exec } from 'child_process';
import { promisify } from 'util';
import { MediaInfo, MediaFormatDetails, YtDlpFormat, YtDlpOutput } from '../types'; // Ensure types are correctly imported

const execPromise = promisify(exec);

// Refined helper to select representative formats.
// We aim for a few good audio-only options and a few good video+audio options.
const processYtDlpFormats = (ytDlpFormats: YtDlpFormat[]): MediaFormatDetails[] => {
  if (!ytDlpFormats) return [];

  const processedFormats: MediaFormatDetails[] = [];
  const addedSignatures: Set<string> = new Set(); // To avoid duplicates like 'mp4 720p'

  // Map yt-dlp format to our MediaFormatDetails structure
  const mapFormat = (fmt: YtDlpFormat, qualitySuffix?: string): MediaFormatDetails => {
    let qualityLabel = fmt.format_note || (fmt.height ? `${fmt.height}p` : (fmt.abr ? `${Math.round(fmt.abr)}kbps` : 'Unknown'));
    if (qualitySuffix) qualityLabel = `${qualityLabel} (${qualitySuffix})`;

    return {
      formatId: fmt.format_id,
      ext: fmt.ext as MediaFormatDetails['ext'],
      resolution: fmt.resolution || (fmt.height ? `${fmt.width}x${fmt.height}` : undefined),
      qualityLabel: qualityLabel,
      filesize: fmt.filesize || fmt.filesize_approx,
      url: fmt.url,
      abr: fmt.abr,
      vbr: fmt.vbr,
      fps: fmt.fps,
      protocol: fmt.protocol as MediaFormatDetails['protocol'],
      container: fmt.container,
      videoCodec: fmt.vcodec !== 'none' ? fmt.vcodec : undefined,
      audioCodec: fmt.acodec !== 'none' ? fmt.acodec : undefined,
    };
  };

  // 1. Audio-only formats (AAC in M4A/MP4, Opus in WebM/Opus, MP3)
  const audioOnlyFormats = ytDlpFormats
    .filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))
    .sort((a, b) => (b.abr || 0) - (a.abr || 0));

  const bestM4a = audioOnlyFormats.find(f => f.ext === 'm4a' && f.acodec?.startsWith('mp4a'));
  if (bestM4a) {
    const fm = mapFormat(bestM4a, 'AAC');
    const sig = `audio_m4a_${fm.abr || 'best'}`;
    if (!addedSignatures.has(sig)) {
      processedFormats.push(fm);
      addedSignatures.add(sig);
    }
  }

  const bestOpus = audioOnlyFormats.find(f => f.ext === 'opus' || (f.ext === 'webm' && f.acodec === 'opus'));
   if (bestOpus && (!bestM4a || Math.abs((bestOpus.abr || 0) - (bestM4a?.abr || 0)) > 32 )) {
    const fm = mapFormat(bestOpus, 'Opus');
    const sig = `audio_opus_${fm.abr || 'best'}`;
     if (!addedSignatures.has(sig)) {
        processedFormats.push(fm);
        addedSignatures.add(sig);
    }
  }

  if (processedFormats.filter(f => !f.videoCodec).length === 0 && audioOnlyFormats.length > 0) {
    const fm = mapFormat(audioOnlyFormats[0]);
    const sig = `audio_${fm.ext}_${fm.abr || 'best'}`;
    if (!addedSignatures.has(sig)) {
        processedFormats.push(fm);
        addedSignatures.add(sig);
    }
  }

  // 2. Video formats (MP4 with H.264/AAC preferred, WebM with VP9/Opus as alternative)
  const targetResolutions = [360, 480, 720, 1080];
  const videoAudioFormats = ytDlpFormats
    .filter(f => f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none')
    .sort((a,b) => (b.height || 0) - (a.height || 0) || (b.fps || 0) - (a.fps || 0) || (b.tbr || 0) - (a.tbr || 0) );

  targetResolutions.forEach(resHeight => {
    let chosenFmt = videoAudioFormats.find(f =>
        f.height === resHeight &&
        f.ext === 'mp4' &&
        f.vcodec?.startsWith('avc1') &&
        f.acodec?.startsWith('mp4a')
    );
    if (!chosenFmt) {
      chosenFmt = videoAudioFormats.find(f => f.height === resHeight && f.ext === 'mp4');
    }
    if (!chosenFmt) {
      chosenFmt = videoAudioFormats.find(f =>
          f.height === resHeight &&
          (f.ext === 'webm' && f.vcodec?.startsWith('vp9') && (f.acodec === 'opus' || f.acodec === 'vorbis'))
      );
    }
     if (!chosenFmt) {
      chosenFmt = videoAudioFormats.find(f => f.height === resHeight);
    }
    if (chosenFmt) {
      const fm = mapFormat(chosenFmt);
      const sig = `video_${fm.ext}_${fm.resolution || fm.qualityLabel}`;
      if (!addedSignatures.has(sig)) {
        processedFormats.push(fm);
        addedSignatures.add(sig);
      }
    }
  });

  if (processedFormats.filter(f=>f.videoCodec).length === 0 && videoAudioFormats.length > 0) {
      const bestOverallVideo = videoAudioFormats[0];
      if (bestOverallVideo) {
          const fm = mapFormat(bestOverallVideo);
          const sig = `video_${fm.ext}_${fm.resolution || fm.qualityLabel}`;
           if (!addedSignatures.has(sig)) {
            processedFormats.push(fm);
            addedSignatures.add(sig);
          }
      }
  }

  processedFormats.sort((a, b) => {
    if (!a.videoCodec && b.videoCodec) return -1;
    if (a.videoCodec && !b.videoCodec) return 1;
    if (!a.videoCodec && !b.videoCodec) return (b.abr || 0) - (a.abr || 0);
    const aHeight = a.resolution ? parseInt(a.resolution.split('x')[1]) : 0;
    const bHeight = b.resolution ? parseInt(b.resolution.split('x')[1]) : 0;
    return (aHeight || 0) - (bHeight || 0);
  });

  return processedFormats;
};

export const getMediaInfo = async (videoId: string): Promise<MediaInfo | null> => {
  const command = `yt-dlp -j --no-playlist --no-warnings "https://www.youtube.com/watch?v=${videoId}"`;
  console.log(`Executing command: ${command}`);

  try {
    const { stdout, stderr } = await execPromise(command, { timeout: 15000 });

    if (stderr) console.warn(`yt-dlp stderr for ${videoId}: ${stderr}`);
    if (!stdout) throw new Error('Failed to get media information: yt-dlp returned empty output.');

    const data = JSON.parse(stdout) as YtDlpOutput;

    if (!data || data.extractor_key !== 'Youtube') {
        throw new Error('Invalid data received from yt-dlp. Not a YouTube video.');
    }

    const refinedFormats = processYtDlpFormats(data.formats || []);

    return {
      videoId: data.id,
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnail || (data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : undefined),
      duration: data.duration,
      channel: data.channel || data.uploader,
      formats: refinedFormats, // Use the refined list
    };

  } catch (error: any) {
    console.error(`Error executing yt-dlp for ${videoId}:`, error);
    if (error.message && (error.message.includes('Video unavailable') || error.message.includes('Private video') || error.message.includes('Premiere'))) {
      return null;
    }
    if (error.killed && error.signal === 'SIGTERM') {
        throw new Error(`Timeout fetching media information for ${videoId}.`);
    }
    throw new Error(`Failed to process media information for ${videoId}: ${error.message}`);
  }
};

// Helper function to map user-friendly quality to yt-dlp format codes
const mapQualityToFormatCode = (
  ext: 'mp3' | 'mp4',
  quality: string,
  allFormats?: YtDlpFormat[]
): string => {
  if (ext === 'mp3') {
    switch (quality) {
      case '320kbps':
        return 'bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio';
      case '192kbps':
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
  return ext === 'mp3' ? 'bestaudio[ext=mp3]/bestaudio' : 'best[ext=mp4]/best';
};

export interface DownloadUrlResponse {
  downloadUrl: string;
  fileName?: string;
}

export const getDownloadUrl = async (
  videoId: string,
  formatExt: 'mp3' | 'mp4',
  quality: string
): Promise<DownloadUrlResponse | null> => {
  const formatCode = mapQualityToFormatCode(formatExt, quality);
  let command: string;
  if (formatExt === 'mp3') {
    command = `yt-dlp -f "${formatCode}" --get-url --no-playlist --no-warnings "https://www.youtube.com/watch?v=${videoId}"`;
  } else {
    command = `yt-dlp -f "${formatCode}" --get-url --no-playlist --no-warnings "https://www.youtube.com/watch?v=${videoId}"`;
  }
  console.log(`Executing command for download URL: ${command}`);
  try {
    const { stdout, stderr } = await execPromise(command, { timeout: 20000 });
    if (stderr) {
      console.warn(`yt-dlp stderr for download URL (${videoId}, ${formatExt}, ${quality}): ${stderr}`);
    }
    const downloadUrl = stdout.trim();
    if (!downloadUrl || !downloadUrl.startsWith('http')) {
      console.error(`yt-dlp returned invalid URL: '${downloadUrl}' for ${videoId}`);
      throw new Error('Failed to get a valid download URL from yt-dlp.');
    }
    return {
      downloadUrl: downloadUrl,
    };
  } catch (error: any) {
    console.error(`Error executing yt-dlp for download URL (${videoId}, ${formatExt}, ${quality}):`, error);
    if (error.killed && error.signal === 'SIGTERM') {
        throw new Error(`Timeout getting download URL for ${videoId}.`);
    }
    throw new Error(`Failed to get download URL for ${videoId}: ${error.message}`);
  }
};
