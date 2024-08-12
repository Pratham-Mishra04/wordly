import sessionCheck from '@/middlewares/session';
import Quiz from '@/models/quiz';
import Word from '@/models/word';
import connectToDB from '@/server/db';
import { Option } from '@/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export const getAllQuizzes = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDB();

  if (req.method === 'GET') {
    try {
      const quizzes = await Quiz.find({ userId: req.session.user.id });
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
      // Retrieve words that have examples
      const words = await Word.aggregate([
        { $match: { examples: { $exists: true, $ne: [] } } },
        { $sample: { size: length } },
      ]);

      const allWords = await Word.find({ userId: req.session.user.id }).select('-_id');

      if (allWords.length < 4) {
        return res.status(400).json({ success: false, error: 'Not enough words to start a quiz' });
      }

      const questions = words
        .map(word => {
          // Find all examples that include the word
          const validExamples = word.examples.filter((ex: any) => ex.includes(word.word));
          if (validExamples.length === 0) {
            return null;
          }

          const example = validExamples[Math.floor(Math.random() * validExamples.length)];

          const question = example.replace(word.word, '____');
          const correctOption: Option = {
            value: word.word,
            isCorrect: true,
          };

          const options: Option[] = [correctOption];
          while (options.length < 4) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)].word;
            if (randomWord !== word.word && !options.some(opt => opt.value === randomWord)) {
              options.push({ value: randomWord, isCorrect: false });
            }
          }

          const shuffledOptions = options.sort(() => Math.random() - 0.5);

          return {
            question,
            options: shuffledOptions.map(opt => opt.value),
            correctAnswer: allWords.filter(word => word.word == correctOption.value)[0],
          };
        })
        .filter(question => question !== null);

      res.status(200).json({ success: true, data: { questions } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAllQuizzes(req, res);
    case 'POST':
      return createQuiz(req, res);
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}

export default sessionCheck(handler);
