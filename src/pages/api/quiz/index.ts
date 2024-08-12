import Quiz from '@/models/quiz';
import Word from '@/models/word';
import connectToDB from '@/server/db';
import { Option } from '@/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export const getAllQuizzes = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDB();

  if (req.method === 'GET') {
    try {
      const quizzes = await Quiz.find({});
      res.status(200).json({
        data: quizzes.map(quiz => ({
          score: quiz.score,
          correctCount: quiz.score,
          incorrectCount: quiz.questions?.length - quiz.score,
          date: quiz.created_at,
          questions: quiz.questions?.map((q: { question: string; correctAnswer: string; selectedAnswer: string }) => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            selectedAnswer: q.selectedAnswer,
            isCorrect: q.selectedAnswer === q.correctAnswer,
          })),
        })),
      });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
};

export const createQuiz = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDB();

  if (req.method === 'POST') {
    const { length } = req.body;

    try {
      // Fetch random words from the database
      const words = await Word.aggregate([{ $sample: { size: length } }]);

      // Retrieve all words for option generation
      const allWords = await Word.find({}).select('-_id');

      const questions = words.map(word => {
        const example = word.examples[0];
        const question = example.replace(word.word, '____');
        const correctOption: Option = {
          value: word.word,
          isCorrect: true,
        };

        // Generate options
        const options: Option[] = [];
        while (options.length < 4) {
          const randomWord = allWords[Math.floor(Math.random() * allWords.length)].word;
          if (!options.some(opt => opt.value === randomWord)) {
            options.push({ value: randomWord, isCorrect: false });
          }
        }

        // Shuffle options
        const shuffledOptions = options.sort(() => Math.random() - 0.5);

        return {
          question,
          options: shuffledOptions.map(opt => opt.value),
          correctAnswer: allWords.filter(w => w.word == correctOption.value)[0],
        };
      });

      res.status(200).json({ success: true, data: { questions } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAllQuizzes(req, res);
    case 'POST':
      return createQuiz(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
