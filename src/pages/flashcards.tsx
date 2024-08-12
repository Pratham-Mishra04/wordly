import { Container, Typography, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';
import Flashcard from '@/components/flashcard';
import Navbar from '@/components/navbar';
import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';

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

export default Flashcards;
