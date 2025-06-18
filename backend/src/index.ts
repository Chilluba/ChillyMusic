import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import searchRoutes from './routes/searchRoutes';

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Basic root route for health check or info
app.get('/', (req: Request, res: Response) => {
  res.send('ChillyMusic API is running!');
});

// Mount API routes
app.use('/api', searchRoutes); // All routes from searchRoutes will be prefixed with /api

// Simple error handling middleware (optional, but good practice)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('WARNING: YOUTUBE_API_KEY is not set in the environment variables. Search functionality will fail.');
  }
});

// For running with ts-node-dev or similar, export app
// export default app;
