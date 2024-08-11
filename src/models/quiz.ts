import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
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
  questions: [
    {
      question: { type: String, required: true },
      correctAnswer: { type: String, required: true },
      selectedAnswer: { type: String, default: null },
    },
  ],
  score: { type: Number, required: true },
  length: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
