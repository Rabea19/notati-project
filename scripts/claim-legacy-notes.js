// Explicit one-time migration: assigns only notes with no owner to one existing account.
// Run after backing up the database. Never run as part of deployment.
import 'dotenv/config';
import { connectDB } from '../lib/db.js';
import User from '../lib/user.js';
import Note from '../lib/note.js';
import mongoose from 'mongoose';
const email = process.argv[2]?.trim().toLowerCase();
const confirm = process.argv[3];
if (!email || confirm !== '--confirm') {
  console.error('Usage: node scripts/claim-legacy-notes.js YOUR_EMAIL --confirm');
  process.exit(1);
}
try {
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) throw new Error('Account not found. Register first.');
  const result = await Note.updateMany({ owner: { $exists: false } }, { $set: { owner: user._id } });
  console.log(`Assigned ${result.modifiedCount} legacy notes to ${email}.`);
} catch(error) { console.error(error.message);process.exitCode=1; }
finally { await mongoose.disconnect(); }
