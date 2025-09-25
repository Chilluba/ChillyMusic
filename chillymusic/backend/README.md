# ChillyMusic Backend

This directory contains the Node.js/Express backend for the ChillyMusic application.

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- **yt-dlp**: Ensure `yt-dlp` is installed and accessible in your system PATH. It can be installed via pip: `pip install yt-dlp` or other methods described on its official GitHub page.

## Setup
1. Navigate to this directory: `cd chillymusic/backend`
2. Install dependencies: `npm install` (or `yarn install`)
3. Create a `.env` file by copying `.env.example`: `cp .env.example .env`
4. Populate the `.env` file. `YOUTUBE_API_KEY` is used for the `/api/search` endpoint. The `/api/media` endpoint (for fetching media info and download links) uses `yt-dlp` and does not require an API key for basic operations.

## Running the server
- Development mode (with auto-restarting using ts-node-dev or similar): `npm run dev`
- Production mode: `npm start` (after building)

## API Endpoints
- `GET /api/health`: Health check for the API.
- `GET /api/search?q={query}&limit={number}`: Searches for music (uses YouTube API Key).
  - `q`: The search query (e.g., song title, artist).
  - `limit`: (Optional) Number of results to return (default: 10).
- `GET /api/media/:videoId/info`: Fetches media information and available formats for a given YouTube video ID (uses `yt-dlp`).

## Project Structure
- `src/`: Contains the source code.
  - `index.ts`: Main server entry point.
  - `routes/`: API route handlers.
  - `services/`: Business logic and external service integrations (e.g., YouTube search service, yt-dlp media service).
  - `types/`: TypeScript type definitions for the backend.
  - `utils/`: Utility functions.
  - `models/`: (Future) Database models if using an ORM like Prisma.
- `.env.example`: Example environment variables.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
