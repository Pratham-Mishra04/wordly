import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Button, Card, CardContent, Divider, CircularProgress } from '@mui/material';
import { QuizResult } from '@/types';
import Navbar from '@/components/navbar';
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';

const QuizHistory: React.FC = () => {
  const [quizHistory, setQuizHistory] = useState<QuizResult[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const response = await axios.get('/api/quiz');
        setQuizHistory(response.data.data);
        setLoading(false);
      } catch (error) {
        console.log('Failed to fetch quiz history:', error);
      }
    };

    fetchQuizHistory();
  }, []);

  return (
    <Container>
      <Navbar />
      <Typography variant="h2" gutterBottom>
        Quiz History
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress />
        </Box>
      ) : quizHistory && quizHistory.length > 0 ? (
        <Box>
          {quizHistory.map((quiz, index) => (
            <Card key={index} sx={{ marginBottom: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">Quiz {index + 1}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Date: {new Date(quiz.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Divider sx={{ marginY: 2 }} />
                <Box mb={2}>
                  <Typography variant="h6" gutterBottom>
                    Score: {quiz.score}/{quiz.questions.length}
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Correct Answers: {quiz.correctCount}
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    Incorrect Answers: {quiz.incorrectCount}
                  </Typography>
                </Box>
                <Divider sx={{ marginY: 2 }} />
                <ul>
                  {quiz.questions.map((question, qIndex) => (
                    <li key={qIndex}>
                      <Box mb={2}>
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
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography align="center" variant="body1">
          No quiz history available.
        </Typography>
      )}
      <Box display="flex" justifyContent="center" mt={4}>
        <Button variant="contained" color="primary" href="/quiz">
          Take New Quiz
        </Button>
      </Box>
    </Container>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  return {
    props: {},
  };
};

export default QuizHistory;
