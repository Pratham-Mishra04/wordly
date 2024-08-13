import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Container,
  Paper,
  LinearProgress,
} from '@mui/material';
import { Question } from '@/types';
import axios from 'axios';
import Flashcard from '@/components/flashcard'; // Import the Flashcard component

interface Props {
  questions: Question[];
  setQuizCompleted: Dispatch<SetStateAction<boolean>>;
  setScore: Dispatch<SetStateAction<number>>;
  setResults: Dispatch<SetStateAction<Array<any> | null>>;
}

const LiveQuiz = ({ questions, setQuizCompleted, setScore, setResults }: Props) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showFlashcard, setShowFlashcard] = useState<boolean>(false);

  const handleAnswerSelect = (option: string) => {
    if (questions && !selectedAnswer) {
      const currentQuestion = questions[currentIndex];
      if (option === currentQuestion.correctAnswer.word) {
        setFeedback('Correct!');
        setShowFlashcard(false);
      } else {
        setFeedback(`Incorrect! The correct answer is: ${currentQuestion.correctAnswer.word}`);
        setShowFlashcard(true);
      }
      setSelectedAnswer(option);
    }
  };

  const handleNext = () => {
    if (questions && selectedAnswer !== null) {
      setAnswers(new Map(answers.set(currentIndex, selectedAnswer)));
      setSelectedAnswer(null);
      setFeedback(null);
      setShowFlashcard(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (questions && selectedAnswer !== null) {
      setAnswers(new Map(answers.set(currentIndex, selectedAnswer)));
      setSelectedAnswer(null);
      setFeedback(null);

      const response = await axios.post('/api/quiz/submit', {
        questions: questions.map((q, index) => ({
          question: q.question,
          correctAnswer: q.correctAnswer.word,
          selectedAnswer: answers.get(index),
        })),
      });
      setScore(response.data.data.score);
      setResults(response.data.data.results);
      setQuizCompleted(true);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Question {currentIndex + 1} of {questions.length}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={((currentIndex + 1) / questions.length) * 100}
          sx={{ marginBottom: 4 }}
        />
        <Typography variant="h5" gutterBottom>
          {questions[currentIndex]?.question}
        </Typography>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Choose an answer:</FormLabel>
          <RadioGroup>
            {questions[currentIndex]?.options.map((option, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Radio
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    disabled={!!selectedAnswer}
                  />
                }
                label={option}
                sx={{
                  color:
                    selectedAnswer === option && option !== questions[currentIndex]?.correctAnswer.word
                      ? 'error.main'
                      : 'text.primary',
                  fontWeight: selectedAnswer === option ? 'bold' : 'normal',
                  textDecoration:
                    selectedAnswer === option && option !== questions[currentIndex]?.correctAnswer.word
                      ? 'line-through'
                      : 'none',
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
        {feedback && (
          <Typography
            variant="body1"
            sx={{ marginTop: 2, color: feedback.startsWith('Incorrect') ? 'error.main' : 'success.main' }}
          >
            {feedback}
          </Typography>
        )}
        {showFlashcard && (
          <Box sx={{ marginTop: 3, animation: 'fadeIn 0.5s' }}>
            <Flashcard index={0} word={questions[currentIndex]?.correctAnswer} />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {currentIndex === questions.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleSubmitQuiz} disabled={selectedAnswer === null}>
              Submit Quiz
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext} disabled={selectedAnswer === null}>
              Next Question
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default LiveQuiz;
