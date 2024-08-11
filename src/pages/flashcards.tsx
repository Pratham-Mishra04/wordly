import { Container, Typography, Button, Card, CardContent } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';

const Flashcards: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showMeaning, setShowMeaning] = useState<boolean>(false);

  useEffect(() => {
    async function fetchWords() {
      const response = await axios.get('/api/words');
      setWords(response.data.data);
    }
    fetchWords();
  }, []);

  const handleNext = () => {
    setShowMeaning(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Flashcards
      </Typography>
      {words.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h4">
              {showMeaning ? words[currentIndex].meaning : words[currentIndex].word}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setShowMeaning(!showMeaning)}>
              {showMeaning ? 'Show Word' : 'Show Meaning'}
            </Button>
            <Button variant="contained" color="secondary" onClick={handleNext}>
              Next
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Flashcards;
