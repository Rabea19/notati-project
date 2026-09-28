import User from '../../lib/user.js';
import { connectDB } from '../../lib/db.js';
import { parseBody, sendError, allow } from '../../lib/http.js';
import { createSession, hashPassword, publicUser, validateCredentials, checkOrigin } from '../../lib/auth.js';
export default async function handler(req,res) {
  if (!allow(req,res,['POST']) || !checkOrigin(req,res)) return;
  try {
    const { name,email,password } = validateCredentials(parseBody(req.body),true);
    await connectDB();
    const user = await User.create({ name,email,passwordHash:await hashPassword(password) });
    await createSession(res,user);
    return res.status(201).json({ user: publicUser(user) });
  } catch(error) { return sendError(res,error); }
}
