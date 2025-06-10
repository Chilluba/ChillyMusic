import express, { Request, Response } from 'express';
import { getMediaInfo, getDownloadUrl } from '../services/mediaService'; // Added getDownloadUrl

const router = express.Router();

// Route for /api/media/:videoId/info
router.get('/:videoId/info', async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json({ message: 'Video ID is required' });
  }

  try {
    const mediaInfo = await getMediaInfo(videoId);
    if (!mediaInfo) {
      return res.status(404).json({ message: 'Media information not found for the given video ID.' });
    }
    res.json(mediaInfo);
  } catch (error: any) {
    console.error(`Error fetching media info for ${videoId}:`, error);
    res.status(500).json({ message: 'Error fetching media information', error: error.message });
  }
});

interface DownloadRequestBody {
  videoId: string;
  format: 'mp3' | 'mp4'; // Matches PRD: { videoId, format, quality }
  quality: string; // e.g., '128kbps', '720p'
}

router.post('/download', async (req: Request, res: Response) => {
  const { videoId, format, quality } = req.body as DownloadRequestBody;

  if (!videoId || !format || !quality) {
    return res.status(400).json({ message: 'videoId, format, and quality are required in the request body.' });
  }

  if (format !== 'mp3' && format !== 'mp4') {
    return res.status(400).json({ message: 'Invalid format. Must be \'mp3\' or \'mp4\'.' });
  }

  try {
    const downloadInfo = await getDownloadUrl(videoId, format, quality);
    if (!downloadInfo) {
      return res.status(404).json({ message: 'Could not retrieve download URL for the specified parameters.' });
    }
    res.json(downloadInfo);
  } catch (error: any) {
    console.error(`Error in /download route for ${videoId}:`, error);
    res.status(500).json({ message: 'Error retrieving download URL', error: error.message });
  }
});

export default router;
