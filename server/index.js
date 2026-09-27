import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from '../lib/db.js';
import Note from '../lib/note.js';
import { payload } from '../lib/payload.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

const asyncRoute = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/api/health', asyncRoute(async (req, res) => {
  await connectDB();
  res.json({ ok: mongoose.connection.readyState === 1 });
}));

app.get('/api/notes', asyncRoute(async (req, res) => {
  const notes = await Note.find().sort({ pinned: -1, updatedAt: -1 }).lean();
  res.json(notes);
}));

app.post('/api/notes', asyncRoute(async (req, res) => {
  const note = await Note.create(payload(req.body));
  res.status(201).json(note);
}));

app.patch('/api/notes/:id', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid note ID.' });
  }

  const note = await Note.findByIdAndUpdate(
    req.params.id,
    payload(req.body),
    { new: true, runValidators: true }
  );

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  res.json(note);
}));

app.delete('/api/notes/:id', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid note ID.' });
  }

  const note = await Note.findByIdAndDelete(req.params.id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  res.status(204).end();
}));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
app.use(express.static(path.join(root, 'dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(root, 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: Object.values(err.errors).map(item => item.message).join(' ')
    });
  }

  if (err.status === 400 || err.status === 413 || err instanceof SyntaxError) {
    return res.status(err.status || 400).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT) || 3001;

try {
  await connectDB();
  app.listen(port, () => {
    console.log(`Notati API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error(
    `MongoDB connection failed: ${error.message}\nStart local MongoDB and check MONGODB_URI in .env.`
  );
  process.exitCode = 1;
}
