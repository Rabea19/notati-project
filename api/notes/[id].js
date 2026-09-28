import mongoose from 'mongoose';
import Note from '../../lib/note.js';
import { payload } from '../../lib/payload.js';
import { parseBody, sendError, allow } from '../../lib/http.js';
import { requireUser, checkOrigin } from '../../lib/auth.js';
export default async function handler(req,res) {
  if (!allow(req,res,['PATCH','DELETE']) || !checkOrigin(req,res)) return;
  if (!mongoose.isValidObjectId((req.params?.id || req.query.id))) return res.status(400).json({ error:'Invalid note ID.' });
  try {
    const active = await requireUser(req,res); if (!active) return;
    const filter = { _id: (req.params?.id || req.query.id), owner: active.user._id };
    if (req.method === 'PATCH') {
      const note = await Note.findOneAndUpdate(filter,payload(parseBody(req.body)),{ new:true,runValidators:true });
      return note ? res.status(200).json(note) : res.status(404).json({ error:'Note not found.' });
    }
    const note = await Note.findOneAndDelete(filter);
    return note ? res.status(204).end() : res.status(404).json({ error:'Note not found.' });
  } catch(error) { return sendError(res,error); }
}
