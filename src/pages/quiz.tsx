import {
  Button,
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  TextField,
} from '@mui/material';
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [results, setResults] = useState<Array<any> | null>(null);
  const [quizLength, setQuizLength] = useState<number>(3); // Default quiz length

  const handleQuizLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuizLength(Number(event.target.value));
  };

  const handleCreateQuiz = async () => {
    const response = await axios.post('/api/quiz', { length: quizLength });
    setQuestions(response.data.data.questions);
    setFeedback(null);
    setCurrentIndex(0);
    setAnswers(new Map());
    setResults(null); // Reset results when a new quiz is created
  };

  const handleAnswerSelect = (option: string) => {
    if (questions && !selectedAnswer) {
      const currentQuestion = questions[currentIndex];
      if (option === currentQuestion.correctAnswer) {
        setFeedback('Correct!');
      } else {
        setFeedback(`Incorrect! The correct answer is: ${currentQuestion.correctAnswer}`);
      }
      setSelectedAnswer(option);
    }
  };

  const handleNext = () => {
    if (questions && selectedAnswer !== null) {
      setAnswers(new Map(answers.set(currentIndex, selectedAnswer)));
      setSelectedAnswer(null);
      setFeedback(null); // Clear feedback for the next question
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
          correctAnswer: q.correctAnswer,
          selectedAnswer: answers.get(index),
        })),
      });
      setScore(response.data.data.score);
      setResults(response.data.data.results); // Store results for display
      setQuizCompleted(true); // Move this here to avoid early completion
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
            <Box>
              <TextField
                label="Quiz Length"
                type="number"
                value={quizLength}
                onChange={handleQuizLengthChange}
                inputProps={{ min: 1 }}
                sx={{ marginBottom: 2 }}
              />
              <Button variant="contained" color="primary" onClick={handleCreateQuiz}>
                Start Quiz
              </Button>
            </Box>
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
                            selectedAnswer === option && option !== questions[currentIndex].correctAnswer
                              ? 'error.main'
                              : 'text.primary',
                          fontWeight: selectedAnswer === option ? 'bold' : 'normal',
                          textDecoration:
                            selectedAnswer === option && option !== questions[currentIndex].correctAnswer
                              ? 'line-through'
                              : 'none',
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                {feedback && (
                  <Typography variant="body1" color={feedback.startsWith('Incorrect') ? 'error' : 'success'}>
                    {feedback}
                  </Typography>
                )}
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
            )
          )}
        </>
      )}
      {quizCompleted && results && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Quiz Results
          </Typography>
          <Typography>Your score: {score}</Typography>
          {results.map((result, index) => (
            <Box key={index} mb={2}>
              <Typography variant="h6">{result.question}</Typography>
              <Typography variant="body1">
                Your answer: <strong>{result.selectedAnswer}</strong>
              </Typography>
              <Typography variant="body1">
                Correct answer: <strong>{result.correctAnswer}</strong>
              </Typography>
              {!result.isCorrect && (
                <Typography variant="body1" color="error">
                  <em>Incorrect</em>
                </Typography>
              )}
            </Box>
          ))}
          <Button variant="contained" color="primary" onClick={handleCreateQuiz}>
            Start New Quiz
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Quiz;
