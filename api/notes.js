import { connectDB } from '../lib/db.js';
import Note from '../lib/note.js';
import { payload } from '../lib/payload.js';
import { parseBody, sendError } from '../lib/http.js';

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const notes = await Note.find().sort({ pinned: -1, updatedAt: -1 }).lean();
      return res.status(200).json(notes);
    }

    if (req.method === 'POST') {
      const note = await Note.create(payload(parseBody(req.body)));
      return res.status(201).json(note);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    return sendError(res, error);
  }
}
