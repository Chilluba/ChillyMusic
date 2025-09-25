import express, { Request, Response } from 'express';
import { searchYouTube } from '../services/youtubeService';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const limitParam = req.query.limit as string;
  const limit = limitParam ? parseInt(limitParam, 10) : 10; // Default limit to 10

  if (!query) {
    return res.status(400).json({ message: 'Search query (q) is required' });
  }

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ message: 'Limit must be a positive number' });
  }

  try {
    const results = await searchYouTube(query, limit);
    res.json({
      results: results,
      total: results.length // This might not be the actual total from YouTube, but count of items returned
    });
  } catch (error: any) {
    console.error('Error in search route:', error);
    res.status(500).json({ message: 'Error fetching search results', error: error.message });
  }
});

export default router;
