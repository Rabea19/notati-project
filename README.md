# Notati

A responsive notes dashboard with create, read, edit, delete, search, category filters, colors, and pinning. Built with vanilla JavaScript, Tailwind CSS, Node.js/Express, and local MongoDB.

## Requirements

- Node.js 20.19+ (or 22.12+)
- MongoDB Community Server running locally on `127.0.0.1:27017`

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`. Open **http://localhost:5173**. The API listens on port 3001. Start MongoDB first (on Windows, start its installed MongoDB service; on macOS/Linux, start `mongod` using your installation method). If you use a different port, edit `.env`.

## Production build

```bash
npm run build
npm start
```

Open **http://localhost:3001**. The same Node server serves the built frontend and API. Notes are stored in the `notati` database, `notes` collection. There is no login; intended for personal local use. Do not expose the server publicly without adding authentication.

## API

- `GET /api/notes` — list notes, pinned first
- `POST /api/notes` — create a note
- `PATCH /api/notes/:id` — update a note or pin state
- `DELETE /api/notes/:id` — delete a note
- `GET /api/health` — database connection status

Note fields: `title` (required, max 120), `content` (max 20,000), `category` (`Personal`, `Work`, `Ideas`, `Learning`), `color` (`lavender`, `peach`, `mint`, `sky`, `cream`), `pinned` (boolean).
