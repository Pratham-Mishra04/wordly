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
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Question } from '@/types';
import QuizResults from '@/components/quiz_results';
import LiveQuiz from '@/components/quiz';
import Navbar from '@/components/navbar';
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';

interface WordCounts {
  [key: string]: number;
}

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [results, setResults] = useState<Array<any> | null>(null);
  const [quizLength, setQuizLength] = useState<number>(3);
  const [timestamp, setTimestamp] = useState<string>('all time');
  const [errorMessage, setErrorMessage] = useState('');
  const [wordCounts, setWordCounts] = useState<WordCounts>({});

  useEffect(() => {
    const fetchWordCounts = async () => {
      try {
        const response = await axios.get('/api/words/meta');
        setWordCounts(response.data.data);
      } catch (err) {
        console.error('Failed to fetch word counts', err);
      }
    };

    fetchWordCounts();
  }, []);

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
                  {Object.keys(wordCounts).map(key => (
                    <MenuItem key={key} value={key}>
                      {`${key.charAt(0).toUpperCase() + key.slice(1)} (${wordCounts[key]} words)`}
                    </MenuItem>
                  ))}
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
