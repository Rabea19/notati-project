import { parseBody, sendError, allow } from '../../lib/http.js';
import { requireUser, verifyPassword, hashPassword, revokeSessions, clearSession, checkOrigin } from '../../lib/auth.js';
import User from '../../lib/user.js';
export default async function handler(req,res) {
  if (!allow(req,res,['POST']) || !checkOrigin(req,res)) return;
  try {
    const active=await requireUser(req,res);if(!active)return;
    const { currentPassword,newPassword }=parseBody(req.body);
    if (typeof currentPassword!=='string'||typeof newPassword!=='string'||newPassword.length<12||newPassword.length>128) return res.status(400).json({ error:'New password must be 12–128 characters.' });
    const user=await User.findById(active.user._id).select('+passwordHash');
    if (!user||!await verifyPassword(currentPassword,user.passwordHash)) return res.status(401).json({ error:'Current password is incorrect.' });
    user.passwordHash=await hashPassword(newPassword);await user.save();
    await revokeSessions(user._id);clearSession(res);
    return res.status(200).json({ message:'Password changed. Sign in again.' });
  }catch(error){return sendError(res,error);}
}
