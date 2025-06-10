# ChillyMusic Backend

This directory contains the Node.js/Express backend for the ChillyMusic application.

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

## Setup
1. Navigate to this directory: `cd chillymusic/backend`
2. Install dependencies: `npm install` (or `yarn install`)
3. Create a `.env` file by copying `.env.example`: `cp .env.example .env`
4. Populate the `.env` file with your actual API keys and configurations (e.g., `YOUTUBE_API_KEY`).
   **Note:** For development without a real YouTube API key, the service will return mock data.

## Running the server
- Development mode (with auto-restarting using ts-node-dev or similar): `npm run dev` (script to be added in package.json)
- Production mode: `npm start` (after building, script to be added)

## API Endpoints
- `GET /api/health`: Health check for the API.
- `GET /api/search?q={query}&limit={number}`: Searches for music.
  - `q`: The search query (e.g., song title, artist).
  - `limit`: (Optional) Number of results to return (default: 10).

## Project Structure
- `src/`: Contains the source code.
  - `index.ts`: Main server entry point.
  - `routes/`: API route handlers.
  - `services/`: Business logic and external service integrations (e.g., YouTube service).
  - `utils/`: Utility functions.
  - `models/`: (Future) Database models if using an ORM like Prisma.
- `.env.example`: Example environment variables.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
