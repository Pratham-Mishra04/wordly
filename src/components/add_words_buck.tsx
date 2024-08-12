import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { Word } from '@/types';

interface BulkAddModalProps {
  open: boolean;
  onClose: () => void;
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}

const BulkAddModal: React.FC<BulkAddModalProps> = ({ open, onClose, setWords }) => {
  const [inputWords, setInputWords] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/buck', {
        words: inputWords.split(',').map(word => word.trim()),
      });

      const { savedWords, failedWords } = response.data;

      const reversedSavedWords = [...savedWords].reverse();

      setWords(prevWords => {
        // Create a Map to handle existing words
        const existingWords = new Map(prevWords.map(word => [word.word.toLowerCase(), word]));

        // Determine new words not already in the list
        const newWords = reversedSavedWords.filter(word => !existingWords.has(word.word.toLowerCase()));

        // Add new words to the beginning of the list
        const updatedWords = [...newWords, ...prevWords.filter(word => !newWords.includes(word))];

        // Update the Map with new words
        newWords.forEach((word: Word) => existingWords.set(word.word.toLowerCase(), word));

        // Return the updated words array
        return updatedWords;
      });

      if (failedWords.length > 0) {
        setErrorMessage(`The following words could not be added: ${failedWords.join(', ')}`);
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMessage('An error occurred while adding words.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%', // Adjust width as needed
          maxWidth: '800px', // Set a max width to ensure it's not too wide
        },
      }}
    >
      <DialogTitle>Add Words in Bulk</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Enter words (comma separated)"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={inputWords}
            onChange={e => setInputWords(e.target.value)}
            required
          />
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" marginTop="8px">
              <CircularProgress />
            </Box>
          )}
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
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Words'}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddModal;
