import mongoose, { Document, Model, Schema } from 'mongoose';

interface IWord extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  word: string;
  meaning: string;
  examples: string[];
  created_at: Date;
}

const WordSchema: Schema<IWord> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  word: { type: String, required: true, unique: true, lowercase: true },
  meaning: { type: String },
  examples: { type: [String] },
  created_at: { type: Date, default: Date.now },
});

const Word: Model<IWord> = mongoose.models.Word || mongoose.model<IWord>('Word', WordSchema);
export default Word;
