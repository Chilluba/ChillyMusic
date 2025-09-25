import { google, youtube_v3 } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Define the SearchResult interface based on PRD
interface SearchResult {
  id: string; // Typically videoId
  title: string;
  channel: string; // channelTitle
  duration: number; // seconds - This is tricky, search results don't directly provide duration easily. Usually needs another API call per video.
  thumbnail: string; // URL
  videoId: string;
  publishedAt: string;
}

// Placeholder function for YouTube search
export const searchYouTube = async (query: string, limit: number = 10): Promise<SearchResult[]> => {
  if (!YOUTUBE_API_KEY) {
    console.warn('YOUTUBE_API_KEY is not set. Returning mock data.');
    // Return mock data if API key is not available
    return Promise.resolve(
      Array.from({ length: limit }, (_, i) => ({
        id: `mock_video_id_${i + 1}`,
        title: `Mock Song ${i + 1} for query: ${query}`,
        channel: 'Mock Artist',
        duration: Math.floor(Math.random() * 300) + 180, // Random duration between 3-8 mins
        thumbnail: `https://i.ytimg.com/vi/mock_video_id_${i + 1}/hqdefault.jpg`, // Placeholder thumbnail
        videoId: `mock_video_id_${i + 1}`,
        publishedAt: new Date().toISOString(),
      }))
    );
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: YOUTUBE_API_KEY,
    });

    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'], // Search for videos
      maxResults: limit,
      videoEmbeddable: 'true', // Only search for embeddable videos
      videoCategoryId: '10', // Music category
    });

    const items = response.data.items || [];

    // Note: Getting duration for each video typically requires an additional API call to videos.list with contentDetails part.
    // For simplicity in this step, duration will be a placeholder or random.
    // A full implementation would map over items and fetch video details.

    return items.map((item: youtube_v3.Schema$SearchResult): SearchResult => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || 'No title',
      channel: item.snippet?.channelTitle || 'No channel',
      duration: 0, // Placeholder: Duration requires another API call (videos.list with contentDetails)
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
      videoId: item.id?.videoId || '',
      publishedAt: item.snippet?.publishedAt || '',
    }));

  } catch (error: any) {
    console.error('Error fetching from YouTube API:', error.message);
    if (error.response?.data?.error?.message) {
      console.error('YouTube API Error Details:', error.response.data.error.message);
      throw new Error(`YouTube API Error: ${error.response.data.error.message}`);
    }
    throw new Error('Failed to fetch data from YouTube API.');
  }
};
