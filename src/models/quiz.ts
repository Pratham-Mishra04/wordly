import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  questions: {
    question: string;
    correctAnswer: string;
    selectedAnswer: string | null;
  }[];
  score: number;
  length: number;
  created_at: Date;
}

const QuizSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [
    {
      question: { type: String, required: true },
      correctAnswer: { type: String, required: true },
      selectedAnswer: { type: String, required: false },
    },
  ],
  score: { type: Number, required: true },
  length: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
