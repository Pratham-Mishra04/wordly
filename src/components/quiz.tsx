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
  const [showFlashcard, setShowFlashcard] = useState<boolean>(false); // State to control flashcard visibility

  const handleAnswerSelect = (option: string) => {
    if (questions && !selectedAnswer) {
      const currentQuestion = questions[currentIndex];
      if (option === currentQuestion.correctAnswer.word) {
        setFeedback('Correct!');
        setShowFlashcard(false); // Hide flashcard on correct answer
      } else {
        setFeedback(`Incorrect! The correct answer is: ${currentQuestion.correctAnswer.word}`);
        setShowFlashcard(true); // Show flashcard on incorrect answer
      }
      setSelectedAnswer(option);
    }
  };

  const handleNext = () => {
    if (questions && selectedAnswer !== null) {
      setAnswers(new Map(answers.set(currentIndex, selectedAnswer)));
      setSelectedAnswer(null);
      setFeedback(null); // Clear feedback for the next question
      setShowFlashcard(false); // Hide flashcard when moving to the next question
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (questions && selectedAnswer !== null) {
      setAnswers(new Map(answers.set(currentIndex, selectedAnswer)));
      setSelectedAnswer(null);
      setFeedback(null); // Clear feedback for the next question

      const response = await axios.post('/api/quiz/submit', {
        questions: questions.map((q, index) => ({
          question: q.question,
          correctAnswer: q.correctAnswer.word,
          selectedAnswer: answers.get(index),
        })),
      });
      setScore(response.data.data.score);
      setResults(response.data.data.results); // Store results for display
      setQuizCompleted(true); // Move this here to avoid early completion
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
        <Typography variant="h4" gutterBottom>
          {questions[currentIndex]?.question}
        </Typography>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Options</FormLabel>
          <RadioGroup>
            {questions[currentIndex]?.options.map((option, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Radio
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    disabled={!!selectedAnswer} // Disable radio buttons once an answer is selected
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
          <Box sx={{ marginTop: 2 }}>
            <Flashcard index={0} word={questions[currentIndex]?.correctAnswer} />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          {currentIndex === questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitQuiz}
              disabled={selectedAnswer === null} // Disable button until an answer is selected
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={selectedAnswer === null} // Disable button until an answer is selected
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default LiveQuiz;
