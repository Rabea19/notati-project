import mongoose from 'mongoose';
import { connectDB } from '../../lib/db.js';
import Note from '../../lib/note.js';
import { payload } from '../../lib/payload.js';
import { parseBody, sendError } from '../../lib/http.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid note ID.' });
  }

  try {
    await connectDB();

    if (req.method === 'PATCH') {
      const note = await Note.findByIdAndUpdate(
        id,
        payload(parseBody(req.body)),
        { new: true, runValidators: true }
      );

      if (!note) {
        return res.status(404).json({ error: 'Note not found.' });
      }

      return res.status(200).json(note);
    }

    if (req.method === 'DELETE') {
      const note = await Note.findByIdAndDelete(id);

      if (!note) {
        return res.status(404).json({ error: 'Note not found.' });
      }

      return res.status(204).end();
    }

    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    return sendError(res, error);
  }
}
