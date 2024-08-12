import mongoose, { Document, Model, Schema } from 'mongoose';

interface IWord extends Document {
  word: string;
  meaning: string;
  examples: string[];
  created_at: Date;
}

const WordSchema: Schema<IWord> = new mongoose.Schema({
  word: { type: String, required: true, unique: true, lowercase: true },
  meaning: { type: String },
  examples: { type: [String] },
  created_at: { type: Date, default: Date.now },
});

const Word: Model<IWord> = mongoose.models.Word || mongoose.model<IWord>('Word', WordSchema);
export default Word;
