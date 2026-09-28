import Note from '../lib/note.js';
import { payload } from '../lib/payload.js';
import { parseBody, sendError, allow } from '../lib/http.js';
import { requireUser, checkOrigin } from '../lib/auth.js';
export default async function handler(req, res) {
  if (!allow(req,res,['GET','POST']) || !checkOrigin(req,res)) return;
  try {
    const active = await requireUser(req,res); if (!active) return;
    if (req.method === 'GET') return res.status(200).json(await Note.find({ owner: active.user._id }).sort({ pinned: -1, updatedAt: -1 }).lean());
    return res.status(201).json(await Note.create({ ...payload(parseBody(req.body)), owner: active.user._id }));
  } catch (error) { return sendError(res,error); }
}
