# Notati

A private notes dashboard built with vanilla JavaScript, Tailwind, Express, and MongoDB. Users register with email, name, and password; sign in and out; change password; and manage only their own notes. Passwords are scrypt hashed. Sessions are random opaque tokens stored as SHA-256 hashes in MongoDB and sent in HttpOnly SameSite cookies. Auth mutations check request origin.

## Local setup

Node.js 20.19+ and a running MongoDB server are required.

```bash
npm install
cp .env.example .env
npm run dev
```

PowerShell: `Copy-Item .env.example .env`. Open http://localhost:5173. The Express API runs at http://localhost:3001 behind the Vite proxy. Build with `npm run build`, then run `npm start` for a local production style server.

## Vercel deployment

This repository uses Vite static hosting and Vercel `api/` functions. Keep the existing `MONGODB_URI` in Vercel pointing to a reachable MongoDB Atlas cluster. Vercel auto-deploys when the connected GitHub branch updates. Do not commit `.env` or connection strings.

## Previous public notes

Existing notes created before authentication have no `owner`. They are deliberately invisible to every account after deploying this version. To assign **all** ownerless notes to one existing account, register that account, back up the database, then run the following command on a trusted machine with `MONGODB_URI` configured:

```bash
node scripts/claim-legacy-notes.js YOUR_EMAIL --confirm
```

Do this only if all existing notes belong to that person. The script never changes notes already assigned to an owner. If old notes belong to several people, manually review and assign them; do not use this script.

## API

- `POST /api/auth/register` — name, email, password (12–128 characters)
- `POST /api/auth/login` — email, password
- `GET /api/auth/me` — current user
- `POST /api/auth/logout` — revoke current session
- `POST /api/auth/password` — currentPassword, newPassword; revokes all sessions
- `GET /api/notes`, `POST /api/notes` — list and create only the signed-in user's notes
- `PATCH /api/notes/:id`, `DELETE /api/notes/:id` — update/delete only a note owned by the signed-in user

The API returns 401 when signed out and 404 for another user's note ID. The app does not yet include email verification or a password-reset-by-email service. Users who forget passwords require an admin recovery process; add a mail provider and reset flow before relying on this for production accounts.
