import { Container, Typography, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';
import Flashcard from '@/components/flashcard';
import Navbar from '@/components/navbar';

const Flashcards: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  useEffect(() => {
    async function fetchWords() {
      const response = await axios.get('/api/words');
      setWords(response.data.data);
    }
    fetchWords();
  }, []);

  return (
    <Container>
      <Navbar />
      <Typography variant="h2" gutterBottom>
        Flashcards
      </Typography>
      <Grid container spacing={2}>
        {words.map((word, index) => (
          <Flashcard
            key={index}
            index={index}
            word={word}
            expandedCard={expandedCard}
            setExpandedCard={setExpandedCard}
          />
        ))}
      </Grid>
    </Container>
  );
};

export default Flashcards;
