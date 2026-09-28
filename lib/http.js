import mongoose from 'mongoose';
export function parseBody(body) { return typeof body === 'string' ? JSON.parse(body) : (body || {}); }
export function sendError(res, error) {
  if (error instanceof mongoose.Error.ValidationError || error?.code === 11000 || error?.status === 400 || error instanceof SyntaxError) {
    return res.status(400).json({ error: error?.code === 11000 ? 'Email is already registered.' : error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
export function allow(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', ')); res.status(405).json({ error: 'Method not allowed.' }); return false;
}
