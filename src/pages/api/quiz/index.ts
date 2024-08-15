import sessionCheck from '@/middlewares/session';
import Quiz from '@/models/quiz';
import Word from '@/models/word';
import connectToDB from '@/server/db';
import { Option } from '@/types';
import moment from 'moment-timezone';
import type { NextApiRequest, NextApiResponse } from 'next';

const timezone = 'Asia/Kolkata';

const calculateTimestampRange = (timestamp: string): moment.Moment | null => {
  switch (timestamp) {
    case 'today':
      return moment.tz(timezone).startOf('day');
    case 'yesterday':
      return moment.tz(timezone).subtract(1, 'days').startOf('day');
    case 'last 3 days':
      return moment.tz(timezone).subtract(3, 'days').startOf('day');
    case 'last week':
      return moment.tz(timezone).subtract(7, 'days').startOf('day');
    case 'last month':
      return moment.tz(timezone).subtract(1, 'months').startOf('day');
    default:
      return null;
  }
};

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
    const { length, timestamp } = req.body;

    try {
      const rangeStart = calculateTimestampRange(timestamp);

      // Fetch all words belonging to the user that have examples and fall within the timestamp range
      const words = rangeStart
        ? await Word.find({
            userId: req.session.user.id,
            examples: { $exists: true, $ne: [] },
            created_at: {
              $gte: rangeStart.toDate(),
              $lt: moment.tz(timezone).endOf('day').toDate(), // Ensures comparison until the end of the selected day
            },
          }).exec()
        : await Word.find({ userId: req.session.user.id, examples: { $exists: true, $ne: [] } }).exec();

      const allWords = await Word.find({ userId: req.session.user.id }).exec();

      // Group words by their POS
      const wordsByPOS = words.reduce((acc, word) => {
        const pos = word.partOfSpeech;
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(word);
        return acc;
      }, {} as Record<string, typeof words>);

      // Group all words by their POS
      const allWordsByPOS = allWords.reduce((acc, word) => {
        const pos = word.partOfSpeech;
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(word);
        return acc;
      }, {} as Record<string, typeof allWords>);

      // Filter and generate questions
      const questions = words
        .map(word => {
          // Find all examples that include the word
          const validExamples = word.examples.filter((ex: any) => ex.includes(word.word));
          if (validExamples.length === 0) {
            return null;
          }

          // Select a random example
          const example = validExamples[Math.floor(Math.random() * validExamples.length)];

          // Create the question by replacing the word in the example with a blank
          const question = example.replace(word.word, '____');

          const correctOption: Option = {
            value: word.word,
            isCorrect: true,
          };

          const options: Option[] = [correctOption];
          const pos = word.partOfSpeech;
          const samePOSWords = wordsByPOS[pos]?.filter(w => w.word !== word.word) || [];
          const samePOSAllWords = allWordsByPOS[pos]?.filter(w => w.word !== word.word) || [];

          // Add incorrect options from the same POS
          while (options.length < 4 && samePOSWords.length > 0) {
            const randomWord = samePOSWords.splice(Math.floor(Math.random() * samePOSWords.length), 1)[0].word;
            if (!options.some(opt => opt.value === randomWord)) {
              options.push({ value: randomWord, isCorrect: false });
            }
          }

          // Add incorrect options from the same POS of all words
          while (options.length < 4 && samePOSAllWords.length > 0) {
            const randomWord = samePOSAllWords.splice(Math.floor(Math.random() * samePOSAllWords.length), 1)[0].word;
            if (!options.some(opt => opt.value === randomWord)) {
              options.push({ value: randomWord, isCorrect: false });
            }
          }

          // If not enough words with the same POS, add random options from other POS
          const otherWords = allWords.filter(w => w.word !== word.word && w.partOfSpeech !== pos);
          while (options.length < 4) {
            const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)].word;
            if (!options.some(opt => opt.value === randomWord)) {
              options.push({ value: randomWord, isCorrect: false });
            }
          }

          // Shuffle the options
          const shuffledOptions = options.sort(() => Math.random() - 0.5);

          const correctAnswer = words.filter(w => w.word == correctOption.value)[0];
          if (!correctAnswer) return null;

          // Return the question object
          return {
            question,
            options: shuffledOptions.map(opt => opt.value),
            correctAnswer,
          };
        })
        .filter((question): question is NonNullable<typeof question> => question !== null);

      // If the number of generated questions exceeds the required length, slice the array
      const finalQuestions = questions.slice(0, length);

      // Check if there are enough questions after filtering
      if (finalQuestions.length < length) {
        return res.status(400).json({ success: false, error: 'Not enough valid questions to start a quiz' });
      }

      res.status(200).json({ success: true, data: { questions: finalQuestions } });
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
