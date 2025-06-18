import express, { Request, Response } from 'express';
import axios from 'axios'; // For making HTTP requests to YouTube API

const router = express.Router();

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper function to calculate publishedAfter date
const getPublishedAfterDate = (uploadDateFilter: string): string | undefined => {
  const now = new Date();
  let publishedAfter: Date | undefined;

  switch (uploadDateFilter) {
    case 'hour':
      publishedAfter = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'today':
      publishedAfter = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      publishedAfter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      // Approximate month as 30 days
      publishedAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      publishedAfter = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default: // 'any' or undefined
      return undefined;
  }
  return publishedAfter.toISOString();
};

router.get('/search', async (req: Request, res: Response) => {
  const { q, type, uploadDate, duration, sortBy, limit = '25' } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query (q) is required.' });
  }
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API Key is not configured.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }

  const params: any = {
    part: 'snippet',
    q: q as string,
    key: YOUTUBE_API_KEY,
    maxResults: parseInt(limit as string, 10) || 25,
  };

  // Map frontend filter values to YouTube API parameters
  if (type) {
    switch (type as string) {
      case 'track':
      case 'album': // YouTube API doesn't have a distinct 'album' type, search for videos.
        params.type = 'video';
        break;
      case 'playlist':
        params.type = 'playlist';
        break;
      case 'artist':
        params.type = 'channel'; // Searching for an artist usually means searching for their channel
        break;
      // 'all' is default, no 'type' param sent to YouTube API
    }
  }

  if (uploadDate && uploadDate !== 'any') {
    const publishedAfter = getPublishedAfterDate(uploadDate as string);
    if (publishedAfter) {
      params.publishedAfter = publishedAfter;
    }
  }

  if (duration && duration !== 'any') {
    // YouTube API: 'short' (<4m), 'medium' (4-20m), 'long' (>20m)
    // Our 'short' maps to 'short'. 'medium' to 'medium', 'long' to 'long'.
    if (['short', 'medium', 'long'].includes(duration as string)) {
      params.videoDuration = duration;
    }
  }

  if (sortBy) {
    switch (sortBy as string) {
      case 'view_count':
        params.order = 'viewCount';
        break;
      case 'upload_date':
        params.order = 'date';
        break;
      case 'rating':
        params.order = 'rating';
        break;
      case 'relevance':
      default:
        params.order = 'relevance';
        break;
    }
  }

  // If type is 'video', we can also add videoSpecific parameters if needed, e.g. videoCategoryId
  // For now, keeping it simple as per defined filters.

  try {
    console.log(`(Backend) Calling YouTube API with params:`, params);
    const response = await axios.get(YOUTUBE_API_URL, { params });

    // Transform YouTube API response to our desired SearchResult structure
    // This is a simplified transformation. A more robust one would handle various item types.
    const searchResults = response.data.items.map((item: any) => {
      let artist = item.snippet?.channelTitle || 'N/A';
      let videoId = item.id?.videoId;
      let id = item.id?.videoId || item.id?.playlistId || item.id?.channelId || item.etag; // etag as last resort for ID

      if (item.id?.kind === 'youtube#video') {
        // Default case
      } else if (item.id?.kind === 'youtube#playlist') {
        videoId = item.id?.playlistId; // For consistency, use playlistId if it's a playlist kind
        // Potentially fetch playlist items or more details here if needed
      } else if (item.id?.kind === 'youtube#channel') {
        videoId = item.id?.channelId; // For consistency
        artist = item.snippet?.title || artist; // Channel title is the artist
      }

      return {
        id: id,
        videoId: videoId, // This might be video, playlist, or channel ID based on item type
        title: item.snippet?.title || 'N/A',
        artist: artist, // Channel title
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
        duration: 0, // YouTube search list doesn't directly provide duration for videos. Needs separate video API call.
                       // For playlists/channels, duration isn't applicable in the same way.
                       // Setting to 0 as a placeholder. A real app would fetch video details for duration.
        channel: item.snippet?.channelTitle, // Keeping raw channel title
        publishedAt: item.snippet?.publishedAt,
        kind: item.id?.kind // e.g. 'youtube#video', 'youtube#playlist', 'youtube#channel'
      };
    });

    res.json({ results: searchResults, total: response.data.pageInfo?.totalResults });

  } catch (error: any) {
    console.error('Error calling YouTube API:', error.response?.data || error.message);
    if (axios.isAxiosError(error) && error.response) {
        return res.status(error.response.status).json({
            error: 'Failed to fetch search results from YouTube.',
            details: error.response.data?.error?.message || error.message
        });
    }
    res.status(500).json({ error: 'Failed to fetch search results.', details: error.message });
  }
});

export default router;
