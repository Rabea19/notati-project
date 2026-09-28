import User from '../../lib/user.js';
import { connectDB } from '../../lib/db.js';
import { parseBody, sendError, allow } from '../../lib/http.js';
import { createSession, verifyPassword, hashPassword, publicUser, validateCredentials, checkOrigin } from '../../lib/auth.js';
const dummyHash = hashPassword('dummy-password-for-timing');
export default async function handler(req,res) {
  if (!allow(req,res,['POST']) || !checkOrigin(req,res)) return;
  try {
    const { email,password } = validateCredentials(parseBody(req.body));
    await connectDB();
    const user = await User.findOne({ email }).select('+passwordHash +failedLogins +lockedUntil');
    if (user?.lockedUntil && user.lockedUntil > new Date()) return res.status(429).json({ error:'Too many attempts. Try again in 15 minutes.' });
    const valid = user ? await verifyPassword(password,user.passwordHash) : await verifyPassword(password,await dummyHash);
    if (!user || !valid) {
      if (user) { user.failedLogins = (user.failedLogins || 0) + 1; if (user.failedLogins >= 5) { user.lockedUntil = new Date(Date.now()+15*60*1000); user.failedLogins=0; } await user.save(); }
      return res.status(401).json({ error:'Invalid email or password.' });
    }
    user.failedLogins=0;user.lockedUntil=null;await user.save();
    await createSession(res,user);
    return res.status(200).json({ user: publicUser(user) });
  } catch(error) { return sendError(res,error); }
}
