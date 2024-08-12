import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { Word } from '@/types';

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}

const AddWordModal: React.FC<AddWordModalProps> = ({ open, onClose, setWords }) => {
  const [word, setWord] = useState<string>('');
  const [meaning, setMeaning] = useState<string>('');
  const [examples, setExamples] = useState<string>('');
  const [partOfSpeech, setPartOfSpeech] = useState<string>('');
  const [synonyms, setSynonyms] = useState<string>('');
  const [antonyms, setAntonyms] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

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
        setWords(prevWords => [response.data.data, ...prevWords]);
        onClose();
      }
    } catch (err) {
      setErrorMessage((err as any)?.response?.data.error || '');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
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
          {errorMessage && (
            <Box display="flex" alignItems="center" ml={2}>
              <Typography variant="body1" color="error">
                {errorMessage}
              </Typography>
            </Box>
          )}
          <DialogActions>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Add Word
              </Button>
            </Box>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWordModal;
