import mongoose from 'mongoose';

export function parseBody(body) {
  return typeof body === 'string' ? JSON.parse(body) : (body || {});
}

export function sendError(res, error) {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: Object.values(error.errors).map(item => item.message).join(' ')
    });
  }

  if (error instanceof SyntaxError || error?.status === 400) {
    return res.status(400).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
