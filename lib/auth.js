import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import User from './user.js';
import Session from './session.js';
import { connectDB } from './db.js';
const scrypt = promisify(scryptCallback);
const COOKIE = 'notati_session';
const TTL = 7 * 24 * 60 * 60 * 1000;
export const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email });
export const tokenHash = token => createHash('sha256').update(token).digest('hex');
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const [kind, salt, hash] = stored.split(':');
  if (kind !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || '')) return false;
  const key = await scrypt(password, salt, 64);
  return timingSafeEqual(key, Buffer.from(hash, 'hex'));
}
export function validateCredentials(body, registration=false) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body?.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw Object.assign(new Error('Enter a valid email address.'), { status: 400 });
  if (typeof password !== 'string' || password.length < (registration ? 12 : 1) || password.length > 128) throw Object.assign(new Error(registration ? 'Password must be 12–128 characters.' : 'Enter your password.'), { status: 400 });
  if (registration && (typeof body?.name !== 'string' || !body.name.trim() || body.name.trim().length > 60)) throw Object.assign(new Error('Name must be 1–60 characters.'), { status: 400 });
  return { email, password, name: registration ? body.name.trim() : undefined };
}
export function checkOrigin(req, res) {
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return true;
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const expected = `https://${host}`;
  if ((!process.env.VERCEL && origin === `http://${host}`) || origin === expected) return true;
  res.status(403).json({ error: 'Request origin is not allowed.' }); return false;
}
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim().split(/=(.*)/s).slice(0,2))); }
export async function currentSession(req) {
  const token = cookies(req)[COOKIE];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  await connectDB();
  const session = await Session.findOne({ tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } }).populate('user');
  return session?.user ? { session, user: session.user } : null;
}
export async function requireUser(req, res) {
  const active = await currentSession(req);
  if (!active) { res.status(401).json({ error: 'Please sign in to continue.' }); return null; }
  return active;
}
export async function createSession(res, user) {
  const token = randomBytes(32).toString('hex');
  await Session.create({ user: user._id, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + TTL) });
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL/1000}${process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
export function clearSession(res) { res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''}`); }
export async function revokeSessions(userId) { await Session.deleteMany({ user: userId }); }
