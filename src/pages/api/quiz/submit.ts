import Quiz from '@/models/quiz';
import connectToDB from '@/server/db';
import type { NextApiRequest, NextApiResponse } from 'next';

interface SubmitQuizBody {
    answers: { question: string; selectedOption: string; correctOption: string }[];
  }
  
  export const submitQuiz = async (req: NextApiRequest, res: NextApiResponse) => {
    await connectToDB();
  
    if (req.method === 'POST') {
      try {
        const { answers }: SubmitQuizBody = req.body;
        const score = answers.filter(
          (answer) => answer.selectedOption === answer.correctOption
        ).length;
  
        const quiz = new Quiz({ score, length: answers.length });
        await quiz.save();
  
        res.status(201).json({ success: true, data: { score, quiz } });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
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
