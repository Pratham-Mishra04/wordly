import mongoose, { Document, Model, Schema } from 'mongoose';

interface IQuiz extends Document {
  score: number;
  length: number;
  created_at: Date;
}

const QuizSchema: Schema<IQuiz> = new mongoose.Schema({
  score: { type: Number, required: true },
  length: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
export default Quiz;
