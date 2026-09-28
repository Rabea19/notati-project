import mongoose from 'mongoose';
export const categories = ['Personal', 'Work', 'Ideas', 'Learning'];
const noteSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, default: '', maxlength: 20000 },
  category: { type: String, enum: categories, default: 'Personal' },
  color: { type: String, enum: ['lavender', 'peach', 'mint', 'sky', 'cream'], default: 'lavender' },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });
noteSchema.index({ owner: 1, pinned: -1, updatedAt: -1 });
export default mongoose.models.Note || mongoose.model('Note', noteSchema);
