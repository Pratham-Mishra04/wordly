import sessionCheck from '@/middlewares/session';
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
      const quizzes = await Quiz.find({ userId: req.session.user.id }).sort({ created_at: -1 }).exec();

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

      const allWords = await Word.find({ userId: req.session.user.id }).select('-_id').exec();

      if (allWords.length < 4) {
        return res.status(400).json({ success: false, error: 'Not enough words to start a quiz' });
      }

      const questions = prioritizedMistakes
        .slice(0, length)
        .map(mistake => {
          if (!mistake.correctAnswer) return null;

          const word = allWords.find(w => w.word === mistake.correctAnswer);
          if (!word) return null;

          // Filter examples that contain the word and select one randomly
          const validExamples = word.examples.filter(ex => ex.includes(word.word));
          if (validExamples.length === 0) return null;

          const example = validExamples[Math.floor(Math.random() * validExamples.length)];
          const questionText = example.replace(word.word, '____');
          const correctOption: Option = { value: word.word, isCorrect: true };

          // Generate options
          const options: Option[] = [correctOption];
          while (options.length < 4) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)].word;
            if (!options.some(opt => opt.value === randomWord) && randomWord !== correctOption.value) {
              options.push({ value: randomWord, isCorrect: false });
            }
          }

          // Shuffle options
          const shuffledOptions = options.sort(() => Math.random() - 0.5);

          return {
            question: questionText,
            options: shuffledOptions.map(opt => opt.value),
            correctAnswer: allWords.filter(word => word.word == correctOption.value)[0],
          };
        })
        .filter((q): q is NonNullable<typeof q> => q !== null && q.correctAnswer !== null);

      if (questions.length == 0) {
        return res.status(400).json({ success: false, error: 'Not enough quizzes taken for personalized quiz' });
      }

      res.status(200).json({ success: true, data: { questions } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
};

export default sessionCheck(createPersonalizedQuiz);
