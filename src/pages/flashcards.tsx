import { Container, Typography, Card, CardContent, Grid, Collapse } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';

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

  const handleCardClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Flashcards
      </Typography>
      <Grid container spacing={2}>
        {words.map((word, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              onClick={() => handleCardClick(index)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                transform: expandedCard === index ? 'scale(1.05)' : 'scale(1)',
                boxShadow: expandedCard === index ? 6 : 2,
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {word.word}
                </Typography>
                <Collapse in={expandedCard === index}>
                  <Typography variant="body1" color="textSecondary">
                    {word.meaning}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mt={2}>
                    Examples:
                  </Typography>
                  {word.examples?.map((example, i) => (
                    <Typography key={i} variant="body2" color="textSecondary">
                      - {example}
                    </Typography>
                  ))}
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Flashcards;
