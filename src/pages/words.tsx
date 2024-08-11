import {
  Button,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';

const Words: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [word, setWord] = useState<string>('');
  const [meaning, setMeaning] = useState<string>('');
  const [examples, setExamples] = useState<string>('');

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
    const response = await axios.post('/api/words', {
      word,
      meaning,
      examples: examples.split('\n'),
    });
    if (response.data.success) {
      setWords([...words, response.data.data]);
      handleClose();
    }
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Words
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Word
      </Button>
      <List>
        {words.map(word => (
          <ListItem key={word._id}>
            <ListItemText primary={word.word} secondary={`Meaning: ${word.meaning}`} />
          </ListItem>
        ))}
      </List>

      {/* Add Word Modal */}
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
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Add Word
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Words;
