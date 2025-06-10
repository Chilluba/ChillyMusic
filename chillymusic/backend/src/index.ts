import express, { Request, Response, NextFunction } from 'express';
import searchRoutes from './routes/search';
import mediaRoutes from './routes/media'; // Import new media routes
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/media', mediaRoutes); // Add media routes

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'ChillyMusic API is healthy' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

export default app;
