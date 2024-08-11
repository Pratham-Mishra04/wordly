import Quiz from '@/models/quiz';
import Word from '@/models/word';
import connectToDB from '@/server/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export const getAllQuizzes = async (req: NextApiRequest, res: NextApiResponse) => {
    await connectToDB();
  
    if (req.method === 'GET') {
      try {
        const quizzes = await Quiz.find({});
        res.status(200).json({ success: true, data: quizzes });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  };
  
  interface CreateQuizBody {
    length: number;
  }
  

  const shuffle = <T>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };
  
  export const createQuiz = async (req: NextApiRequest, res: NextApiResponse) => {
    await connectToDB();
  
    if (req.method === 'POST') {
      try {
        const { length }: CreateQuizBody = req.body;
  
        // Fetch a random set of words from the database
        const words = await Word.aggregate([{ $sample: { size: length } }]);
  
        const quiz = {
          questions: words.map((word: any) => {
            const randomIndex = Math.floor(Math.random() * word.examples.length);
            const question = word.examples[randomIndex].replace(word.word, '_____');
            const options = shuffle([...Array(3).fill(null), word.word]);
            return { question, options };
          }),
        };
  
        res.status(201).json({ success: true, data: quiz });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
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