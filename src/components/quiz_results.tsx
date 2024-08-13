import React from 'react';
import { Button, Typography, Box, Container, Paper } from '@mui/material';

interface Props {
  score: number;
  results: Array<any>;
}

const QuizResults = ({ score, results }: Props) => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>
        <Typography variant="h6" gutterBottom>
          Your score:{' '}
          <strong>
            {score}\{results.length}
          </strong>
        </Typography>
        {results.map((result, index) => (
          <Box key={index} mb={2} sx={{ padding: 2, borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {result.question}
            </Typography>
            <Typography variant="body1">
              Your answer: <strong>{result.selectedAnswer}</strong>
            </Typography>
            <Typography variant="body1">
              Correct answer: <strong>{result.correctAnswer}</strong>
            </Typography>
            {!result.isCorrect ? (
              <Typography variant="body1" color="error" sx={{ marginTop: 1 }}>
                <em>Incorrect</em>
              </Typography>
            ) : (
              <Typography variant="body1" sx={{ marginTop: 1, color: 'green' }}>
                <em>Correct</em>
              </Typography>
            )}
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
          <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
            Start New Quiz
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default QuizResults;
