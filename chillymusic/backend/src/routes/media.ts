import express, { Request, Response } from 'express';
import { getMediaInfo } from '../services/mediaService'; // New service we'll create

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

export default router;
