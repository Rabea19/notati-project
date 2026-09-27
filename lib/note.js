import mongoose from 'mongoose';

export const categories = ['Personal', 'Work', 'Ideas', 'Learning'];

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, default: '', maxlength: 20000 },
  category: { type: String, enum: categories, default: 'Personal' },
  color: {
    type: String,
    enum: ['lavender', 'peach', 'mint', 'sky', 'cream'],
    default: 'lavender'
  },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);

export default Note;
