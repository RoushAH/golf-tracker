# Golf Tracker PWA

A progressive web app for tracking golf chipping and putting practice sessions.

## Features

- **Three Default Drill Types:**
  - Putting by Distance (under 3', 3-6', 6-12', 12'+)
  - Chipping Target Practice (10-20', 30-50', 50'+)
  - Par 18 (9 balls off the green, chip and putt each)

- **Custom Drill Creation:** Create your own drills with custom categories and scoring
- **Session Tracking:** Record practice sessions with detailed results
- **Statistics & Progression:** View overall stats and session-by-session progress
- **Offline-First:** Works offline, syncs when reconnected (PWA features)

## Quick Start

### Windows

Simply double-click `start.bat` to launch both server and client.

### Manual Start

```bash
# Install dependencies
npm install

# Start server (terminal 1)
npm run server

# Start client (terminal 2)
npm run client
```

Server runs on http://localhost:3001  
Client runs on http://localhost:5173

## Tech Stack

- **Frontend:** React + Vite, PWA with service workers
- **Backend:** Node.js + Express + SQLite (sql.js)
- **Offline Storage:** IndexedDB
- **Sync:** Bidirectional sync with conflict resolution

## Project Structure

```
golf_tracker/
├── shared/          # Shared TypeScript types
├── server/          # Node.js backend
│   ├── src/
│   │   ├── db/     # Database schema and queries
│   │   └── routes/ # API endpoints
│   └── data/       # SQLite database
├── client/          # React PWA frontend
│   └── src/
│       ├── components/
│       └── services/
└── start.bat        # Windows launcher
```

## API Endpoints

- `GET /api/drills` - List all drills
- `POST /api/drills` - Create custom drill
- `GET /api/drills/:id/stats` - Get drill statistics
- `GET /api/drills/:id/progression` - Get session history
- `POST /api/sessions` - Create practice session
- `POST /api/sessions/:id/results` - Add result to session
- `POST /api/sync` - Bidirectional sync

## Development

```bash
# Install all workspace dependencies
npm install

# Run both server and client concurrently
npm run dev

# Build for production
npm run build
```

## License

MIT
