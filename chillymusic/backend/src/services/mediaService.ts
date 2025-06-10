// Define MediaFormatDetails and MediaInfo interfaces based on PRD
// These might need to be in a shared types file later, e.g., src/types/media.ts

export interface MediaFormatDetails {
  formatId: string; // e.g., '140' for m4a, '18' for mp4 360p
  ext: 'm4a' | 'mp3' | 'mp4' | 'webm' | 'flv' | '3gp';
  resolution?: string; // e.g., '640x360' or 'audio only'
  qualityLabel?: string; // e.g., '360p', '720p', '128kbps'
  filesize?: number; // bytes
  url: string; // Direct stream/download URL
  abr?: number; // Audio bitrate in kbit/s
  vbr?: number; // Video bitrate in kbit/s
  fps?: number;
  protocol?: 'http' | 'https' | 'rtmp' | 'hls';
  container?: string;
  videoCodec?: string;
  audioCodec?: string;
}

export interface MediaInfo {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number; // seconds
  channel?: string;
  formats: MediaFormatDetails[];
  // Add other metadata as needed from yt-dlp output
}

// Placeholder function for fetching media info (will use yt-dlp later)
export const getMediaInfo = async (videoId: string): Promise<MediaInfo | null> => {
  console.log(`Fetching media info for videoId: ${videoId}`);

  // Mock data for now, simulating what yt-dlp might provide
  // In a real scenario, you'd execute yt-dlp here:
  // const command = `yt-dlp -j --no-warnings ${videoId}`;
  // const { stdout } = await execPromise(command);
  // const data = JSON.parse(stdout);
  // And then map 'data' to the MediaInfo structure.

  // For this step, return mock data:
  if (videoId === 'mock_video_id_1' || videoId.startsWith('mock_')) {
    return {
      videoId: videoId,
      title: `Mock Title for ${videoId}`,
      description: 'This is a mock description for the video.',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: 245, // Example duration in seconds
      channel: 'Mock Channel',
      formats: [
        {
          formatId: '140',
          ext: 'm4a',
          qualityLabel: '128kbps (AAC)',
          url: 'https://rr5---sn-npoe7ne7.googlevideo.com/videoplayback?...&mime=audio/mp4', // Placeholder URL
          abr: 128,
          audioCodec: 'mp4a.40.2',
          protocol: 'https',
          container: 'm4a_dash',
        },
        {
          formatId: '18',
          ext: 'mp4',
          resolution: '640x360',
          qualityLabel: '360p',
          url: 'https://rr2---sn-npoe7ne7.googlevideo.com/videoplayback?...&mime=video/mp4', // Placeholder URL
          filesize: 15000000, // Approx 15MB
          fps: 30,
          videoCodec: 'avc1.42001E',
          audioCodec: 'mp4a.40.2',
          protocol: 'https',
          container: 'mp4',
        },
        {
          formatId: '22',
          ext: 'mp4',
          resolution: '1280x720',
          qualityLabel: '720p',
          url: 'https://rr2---sn-npoe7ne7.googlevideo.com/videoplayback?...&mime=video/mp4', // Placeholder URL
          filesize: 30000000, // Approx 30MB
          fps: 30,
          videoCodec: 'avc1.64001F',
          audioCodec: 'mp4a.40.2',
          protocol: 'https',
          container: 'mp4',
        },
      ],
    };
  }
  return null; // Return null if videoId is not a recognized mock ID
};
