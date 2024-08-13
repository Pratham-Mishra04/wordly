import {
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { Question } from '@/types';
import QuizResults from '@/components/quiz_results';
import LiveQuiz from '@/components/quiz';
import Navbar from '@/components/navbar';
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [results, setResults] = useState<Array<any> | null>(null);
  const [quizLength, setQuizLength] = useState<number>(3);
  const [timestamp, setTimestamp] = useState<string>('all time');
  const [errorMessage, setErrorMessage] = useState('');

  const handleQuizLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuizLength(Number(event.target.value));
  };

  const handleTimestampChange = (event: React.ChangeEvent<{ value: unknown }> | SelectChangeEvent<string>) => {
    setTimestamp(event.target.value as string);
  };

  const handleCreateQuiz = async (type: string) => {
    try {
      setErrorMessage('');
      const response = await axios.post(`/api/quiz/${type}`, { length: quizLength, timestamp });
      setQuestions(response.data.data.questions);
    } catch (err) {
      setErrorMessage((err as any)?.response?.data.error || '');
    }
  };

  return (
    <Container>
      <Navbar />
      <Container maxWidth="md">
        <Typography variant="h2" align="center" sx={{ marginY: '16px' }}>
          Quiz
        </Typography>
        {!quizCompleted ? (
          !questions ? (
            <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" gutterBottom align="center">
                Welcome to the Quiz!
              </Typography>
              <TextField
                label="Number of Questions"
                type="number"
                value={quizLength}
                onChange={handleQuizLengthChange}
                inputProps={{ min: 1 }}
                sx={{ marginBottom: 2, width: '100%' }}
                variant="outlined"
              />
              <FormControl variant="outlined" sx={{ marginBottom: 2, width: '100%' }}>
                <InputLabel id="timestamp-label">Word Added Time Range</InputLabel>
                <Select
                  labelId="timestamp-label"
                  value={timestamp}
                  onChange={handleTimestampChange}
                  label="Word Added Time Range"
                >
                  <MenuItem value="all time">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="last 3 days">Last 3 Days</MenuItem>
                  <MenuItem value="last week">Last Week</MenuItem>
                  <MenuItem value="last month">Last Month</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleCreateQuiz('')}
                sx={{ marginBottom: 2, width: '100%' }}
              >
                Random Quiz
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleCreateQuiz('personalized')}
                sx={{ width: '100%' }}
              >
                Personalized Quiz
              </Button>
              {errorMessage && (
                <Typography variant="body1" color="error" sx={{ marginTop: 2 }}>
                  {errorMessage}
                </Typography>
              )}
            </Paper>
          ) : (
            <LiveQuiz
              questions={questions}
              setQuizCompleted={setQuizCompleted}
              setScore={setScore}
              setResults={setResults}
            />
          )
        ) : (
          results && <QuizResults score={score} results={results} />
        )}
      </Container>
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

export default Quiz;
