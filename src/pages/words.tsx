import {
  Button,
  Container,
  Typography,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';
import Navbar from '@/components/navbar';
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import WordComponent from '@/components/word';

const Words: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [word, setWord] = useState<string>('');
  const [meaning, setMeaning] = useState<string>('');
  const [examples, setExamples] = useState<string>('');
  const [partOfSpeech, setPartOfSpeech] = useState<string>('');
  const [synonyms, setSynonyms] = useState<string>('');
  const [antonyms, setAntonyms] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchWords() {
      const response = await axios.get('/api/words');
      setWords(response.data.data);
    }
    fetchWords();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await axios.post('/api/words', {
        word,
        meaning,
        examples: examples.split('\n'),
        partOfSpeech,
        synonyms: synonyms?.split(',').map(syn => syn.trim()),
        antonyms: antonyms?.split(',').map(ant => ant.trim()),
      });
      if (response.data.success) {
        setWords([...words, response.data.data]);
        handleClose();
      }
    } catch (err) {
      setErrorMessage((err as any)?.response?.data.error || '');
    }
  };

  return (
    <Container>
      <Navbar />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h2" sx={{ marginTop: '16px' }}>
          Words
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add New Word
        </Button>
      </Box>
      <List>
        {words.map((word, index) => (
          <WordComponent key={index} index={index} word={word} setWords={setWords} />
        ))}
      </List>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Word</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Word"
              variant="outlined"
              fullWidth
              margin="normal"
              value={word}
              onChange={e => setWord(e.target.value)}
              required
            />
            <TextField
              label="Meaning"
              variant="outlined"
              fullWidth
              margin="normal"
              value={meaning}
              onChange={e => setMeaning(e.target.value)}
              required
            />
            <TextField
              label="Examples (one per line)"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={examples}
              onChange={e => setExamples(e.target.value)}
              required
            />
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="part-of-speech-label">Part of Speech</InputLabel>
              <Select
                labelId="part-of-speech-label"
                value={partOfSpeech}
                onChange={e => setPartOfSpeech(e.target.value)}
                label="Part of Speech"
                required
              >
                <MenuItem value="noun">Noun</MenuItem>
                <MenuItem value="verb">Verb</MenuItem>
                <MenuItem value="adjective">Adjective</MenuItem>
                <MenuItem value="adverb">Adverb</MenuItem>
                <MenuItem value="pronoun">Pronoun</MenuItem>
                <MenuItem value="preposition">Preposition</MenuItem>
                <MenuItem value="conjunction">Conjunction</MenuItem>
                <MenuItem value="interjection">Interjection</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Synonyms (comma separated)"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={2}
              value={synonyms}
              onChange={e => setSynonyms(e.target.value)}
            />
            <TextField
              label="Antonyms (comma separated)"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={2}
              value={antonyms}
              onChange={e => setAntonyms(e.target.value)}
            />
            <DialogActions>
              <Box display="flex" flexDirection="column" gap="12px" justifyContent="space-between" width="100%">
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button type="submit" variant="contained" color="primary">
                    Add Word
                  </Button>
                </Box>
                {errorMessage && (
                  <Box display="flex" alignItems="center" ml={2}>
                    <Typography variant="body1" color="error">
                      {errorMessage}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
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

export default Words;
