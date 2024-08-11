import Quiz from '@/models/quiz';
import connectToDB from '@/server/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export const submitQuiz = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDB();

  if (req.method === 'POST') {
    const { questions } = req.body;

    try {
      // Calculate the score based on user answers and correct answers
      const totalQuestions = questions.length;
      const correctAnswers = questions.filter(
        (q: { correctAnswer: string; selectedAnswer: string | null }) => q.correctAnswer === q.selectedAnswer
      ).length;

      // Create a new quiz entry
      const newQuiz = new Quiz({
        questions,
        score: correctAnswers,
        length: totalQuestions,
      });

      // Save to database
      await newQuiz.save();

      const results = questions.map((q: any) => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        selectedAnswer: q.selectedAnswer,
        isCorrect: q.correctAnswer === q.selectedAnswer,
      }));

      res.status(200).json({ success: true, data: { score: correctAnswers, results } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return submitQuiz(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
