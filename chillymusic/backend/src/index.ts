import express, { Request, Response, NextFunction } from 'express';
import searchRoutes from './routes/search';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Routes
app.use('/api/search', searchRoutes);

// Basic health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'ChillyMusic API is healthy' });
});

// Global error handler (very basic)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

export default app;
