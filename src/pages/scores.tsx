import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { QuizResult } from '@/types';

const QuizHistory: React.FC = () => {
  const [quizHistory, setQuizHistory] = useState<QuizResult[] | null>(null);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const response = await axios.get('/api/quiz');
        setQuizHistory(response.data.data);
      } catch (error) {
        console.error('Failed to fetch quiz history:', error);
      }
    };

    fetchQuizHistory();
  }, []);

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Quiz History
      </Typography>
      {quizHistory ? (
        <List>
          {quizHistory.map((quiz, index) => (
            <Box key={index} mb={3}>
              <ListItem>
                <ListItemText
                  primary={`Quiz ${index + 1}`}
                  secondary={`Date: ${new Date(quiz.date).toLocaleDateString()}`}
                />
              </ListItem>
              <Box pl={3} mb={2}>
                <Typography variant="h6" gutterBottom>
                  Score: {quiz.score}/{quiz.questions.length}
                </Typography>
                <Typography variant="body1">
                  Correct Answers: {quiz.correctCount}
                </Typography>
                <Typography variant="body1" color="error">
                  Incorrect Answers: {quiz.incorrectCount}
                </Typography>
              </Box>
              <Divider />
              {quiz.questions.map((question, qIndex) => (
                <Box key={qIndex} mt={2} mb={2} pl={3}>
                  <Typography variant="h6">{question.question}</Typography>
                  <Typography variant="body1">
                    Your answer: <strong>{question.selectedAnswer}</strong>
                  </Typography>
                  <Typography variant="body1">
                    Correct answer: <strong>{question.correctAnswer}</strong>
                  </Typography>
                  {!question.isCorrect && (
                    <Typography variant="body1" color="error">
                      <em>Incorrect</em>
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </List>
      ) : (
        <Typography>Loading quiz history...</Typography>
      )}
      <Button variant="contained" color="primary" href="/quiz">
        Take New Quiz
      </Button>
    </Container>
  );
};

export default QuizHistory;
