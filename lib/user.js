import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  failedLogins: { type: Number, default: 0, select: false },
  lockedUntil: { type: Date, default: null, select: false }
}, { timestamps: true });
export default mongoose.models.User || mongoose.model('User', userSchema);
