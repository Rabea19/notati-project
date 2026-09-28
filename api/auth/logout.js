import { sendError, allow } from '../../lib/http.js';
import { currentSession, clearSession, checkOrigin } from '../../lib/auth.js';
export default async function handler(req,res) {
  if (!allow(req,res,['POST']) || !checkOrigin(req,res)) return;
  try { const active=await currentSession(req); if(active) await active.session.deleteOne(); clearSession(res); return res.status(204).end(); }
  catch(error) { return sendError(res,error); }
}
