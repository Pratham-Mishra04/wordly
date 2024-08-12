import Quiz from '@/models/quiz'; // Import your Quiz model
import Word from '@/models/word'; // Import your Word model
import connectToDB from '@/server/db';
import { Option } from '@/types';
import { NextApiRequest, NextApiResponse } from 'next';

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  selectedAnswer: string;
  created_at: Date;
}

interface Mistake {
  question: string;
  correctAnswer: string;
  selectedAnswer: string;
  created_at: Date;
  count: number;
}

const createPersonalizedQuiz = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDB();

  if (req.method === 'POST') {
    const { length }: { length: number } = req.body;

    try {
      const quizzes = await Quiz.find({}).sort({ created_at: -1 }).exec();

      const mistakes: Mistake[] = quizzes.flatMap(quiz =>
        quiz.questions
          .filter((q: QuizQuestion) => q.selectedAnswer !== q.correctAnswer)
          .map((q: QuizQuestion) => ({
            question: q.question || '',
            correctAnswer: q.correctAnswer || '',
            selectedAnswer: q.selectedAnswer || '',
            created_at: quiz.created_at || new Date(),
            count: 1,
          }))
      );

      // Calculate generic counts
      const mistakeCountMap: Record<string, Mistake> = mistakes.reduce((map, mistake) => {
        const key = mistake.question;
        if (!map[key]) {
          map[key] = { ...mistake, count: 1 };
        } else {
          map[key].count = (map[key].count || 0) + 1;
        }
        return map;
      }, {} as Record<string, Mistake>);

      // Calculate recency factor and update counts
      const now = new Date();

      const prioritizedMistakes = Object.values(mistakeCountMap)
        .map(mistake => {
          const daysSinceMistake = Math.max(
            0,
            Math.ceil((now.getTime() - mistake.created_at.getTime()) / (24 * 60 * 60 * 1000))
          );
          const recencyFactor = daysSinceMistake <= 14 ? 5 - (5 * daysSinceMistake) / 14 : 0;

          return {
            ...mistake,
            count: (mistake.count || 0) * recencyFactor,
          };
        })
        .sort((a, b) => (b.count || 0) - (a.count || 0));

      const allWords = await Word.find({}).select('-_id').exec();

      if (allWords.length < 4) {
        return res.status(500).json({ success: false, error: 'Not enough words' });
      }

      const questions = prioritizedMistakes
        .slice(0, length)
        .map(mistake => {
          if (!mistake.correctAnswer) return null;

          const word = allWords.find(w => w.word === mistake.correctAnswer);
          if (!word) return null;

          const example = word.examples[0];
          const questionText = example.replace(word.word, '____');
          const correctOption: Option = { value: word.word, isCorrect: true };

          const options: Option[] = [];
          while (options.length < 3) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)].word;
            if (!options.some(opt => opt.value === randomWord) && randomWord !== correctOption.value) {
              options.push({ value: randomWord, isCorrect: false });
            }
          }

          options.push(correctOption);
          const shuffledOptions = options.sort(() => Math.random() - 0.5);

          return {
            question: questionText,
            options: shuffledOptions.map(opt => opt.value),
            correctAnswer: allWords.filter(w => w.word == correctOption.value)[0],
          };
        })
        .filter((q): q is NonNullable<typeof q> => q !== null);

      res.status(200).json({ success: true, data: { questions } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default createPersonalizedQuiz;
