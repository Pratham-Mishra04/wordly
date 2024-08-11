import { Button, Container, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Box } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { Question } from '@/types';

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const handleCreateQuiz = async () => {
    const response = await axios.post('/api/quiz', { length: 3 });
    setQuestions(response.data.data.questions);
  };

  const handleNext = () => {
    if (questions && selectedAnswer !== null) {
      setAnswers(new Map(answers.set(currentIndex, selectedAnswer)));
      setSelectedAnswer(null);
      setCurrentIndex(currentIndex + 1);
      if (currentIndex === questions.length - 1) {
        setQuizCompleted(true);
      }
    }
  };

  const handleSubmitQuiz = async () => {
    if (questions) {
      const response = await axios.post('/api/quiz/submit', {
        questions: questions.map((q, index) => ({
          question: q.question,
          correctAnswer: q.correctAnswer,
          selectedAnswer: answers.get(index),
        })),
      });
      setScore(response.data.data.score);
    }
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Quiz
      </Typography>
      {!quizCompleted && (
        <>
          {!questions ? (
            <Button variant="contained" color="primary" onClick={handleCreateQuiz}>
              Start Quiz
            </Button>
          ) : (
            questions[currentIndex] && (
              <Box>
                <Typography variant="h4">{questions[currentIndex].question}</Typography>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Options</FormLabel>
                  <RadioGroup>
                    {questions[currentIndex].options.map((option, i) => (
                      <FormControlLabel
                        key={i}
                        control={<Radio checked={selectedAnswer === option} onChange={() => setSelectedAnswer(option)} />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleNext} disabled={selectedAnswer === null}>
                  Next
                </Button>
              </Box>
            )
          )}
        </>
      )}
      {quizCompleted && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Quiz Results
          </Typography>
          <Typography>Your score: {score}</Typography>
          <Button variant="contained" color="primary" onClick={handleSubmitQuiz}>
            Submit Quiz
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Quiz;
