import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));
const categories = ['Personal', 'Work', 'Ideas', 'Learning'];
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, default: '', maxlength: 20000 },
  category: { type: String, enum: categories, default: 'Personal' },
  color: { type: String, enum: ['lavender', 'peach', 'mint', 'sky', 'cream'], default: 'lavender' },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });
const Note = mongoose.model('Note', schema);
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
function payload(body) {
  const fields = ['title', 'content', 'category', 'color', 'pinned'];
  const data = Object.fromEntries(fields.filter(k => Object.hasOwn(body, k)).map(k => [k, body[k]]));
  if (Object.hasOwn(data, 'title') && typeof data.title !== 'string') throw Object.assign(new Error('Title must be text.'), { status: 400 });
  if (Object.hasOwn(data, 'content') && typeof data.content !== 'string') throw Object.assign(new Error('Content must be text.'), { status: 400 });
  if (Object.hasOwn(data, 'pinned') && typeof data.pinned !== 'boolean') throw Object.assign(new Error('Pinned must be true or false.'), { status: 400 });
  return data;
}
app.get('/api/health', (req, res) => res.json({ ok: mongoose.connection.readyState === 1 }));
app.get('/api/notes', asyncRoute(async (req, res) => {
  const notes = await Note.find().sort({ pinned: -1, updatedAt: -1 }).lean();
  res.json(notes);
}));
app.post('/api/notes', asyncRoute(async (req, res) => {
  const note = await Note.create(payload(req.body));
  res.status(201).json(note);
}));
app.patch('/api/notes/:id', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid note ID.' });
  const data = payload(req.body);
  const note = await Note.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  res.json(note);
}));
app.delete('/api/notes/:id', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid note ID.' });
  const note = await Note.findByIdAndDelete(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  res.status(204).end();
}));
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
app.use(express.static(path.join(root, 'dist')));
app.get('/{*path}', (req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) return res.status(400).json({ error: Object.values(err.errors).map(x => x.message).join(' ') });
  if (err.status === 400 || err.status === 413 || err instanceof SyntaxError) return res.status(err.status || 400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notati';
const port = Number(process.env.PORT) || 3001;
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  app.listen(port, () => console.log(`Notati API listening on http://localhost:${port}`));
} catch (error) {
  console.error(`MongoDB connection failed: ${error.message}\nStart local MongoDB and check MONGODB_URI in .env.`);
  process.exitCode = 1;
}
