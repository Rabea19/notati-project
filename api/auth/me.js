import { sendError, allow } from '../../lib/http.js';
import { requireUser, publicUser } from '../../lib/auth.js';
export default async function handler(req,res) {
  if (!allow(req,res,['GET'])) return;
  try { const active=await requireUser(req,res); if (active) return res.status(200).json({ user: publicUser(active.user) }); }
  catch(error) { return sendError(res,error); }
}
