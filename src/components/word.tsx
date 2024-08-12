import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  Typography,
  ListItem,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import axios from 'axios';
import { Word } from '@/types';

interface Props {
  index: number;
  word: Word;
  setWords: Dispatch<SetStateAction<Word[]>>;
}

const WordComponent = ({ index, word, setWords }: Props) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [wordData, setWordData] = useState({
    word: word.word,
    meaning: word.meaning,
    examples: word.examples?.join('\n'),
    partOfSpeech: word.partOfSpeech,
    synonyms: word.synonyms?.join(', '),
    antonyms: word.antonyms?.join(', '),
  });

  const handleEditClick = () => setEditDialogOpen(true);
  const handleEditClose = () => setEditDialogOpen(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as HTMLInputElement | { name?: string; value: string };
    setWordData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleEdit = async () => {
    try {
      const res = await axios.patch(`/api/words?wid=${word._id}`, {
        ...wordData,
        examples: wordData.examples?.split('\n'),
        synonyms: wordData.synonyms?.split(',').map(syn => syn.trim()),
        antonyms: wordData.antonyms?.split(',').map(ant => ant.trim()),
      });
      setWords(prev =>
        prev.map(w => {
          if (w._id == word._id) return res.data.data;
          else return w;
        })
      );
      handleEditClose();
    } catch (error) {
      console.error('Error updating word:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/words?wid=${word._id}`);
      setWords(prev => prev.filter(w => w._id != word._id));
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  return (
    <Box key={word._id} mb={1}>
      <ListItem disableGutters>
        <Card variant="outlined" sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {`${index + 1}. ${word.word}`}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                  Meaning
                </Typography>
                <Typography variant="body1">{word.meaning}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                  Part of Speech
                </Typography>
                <Typography variant="body1">{word.partOfSpeech}</Typography>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2, mb: 1 }}>
              Examples
            </Typography>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {word.examples?.map((example, exampleIndex) => (
                <li key={exampleIndex} style={{ marginBottom: '8px' }}>
                  <Typography variant="body2">{example}</Typography>
                </li>
              ))}
            </ul>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                  Synonyms
                </Typography>
                <Typography variant="body2">{word.synonyms?.join(', ')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                  Antonyms
                </Typography>
                <Typography variant="body2">{word.antonyms?.join(', ')}</Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button variant="outlined" color="primary" onClick={handleEditClick} sx={{ ml: 'auto' }}>
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete} sx={{ ml: 2 }}>
              Delete
            </Button>
          </CardActions>
        </Card>
      </ListItem>

      {/* Edit Word Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Word</DialogTitle>
        <DialogContent>
          <TextField
            label="Word"
            variant="outlined"
            fullWidth
            margin="normal"
            name="word"
            value={wordData.word}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Meaning"
            variant="outlined"
            fullWidth
            margin="normal"
            name="meaning"
            value={wordData.meaning}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Examples (one per line)"
            variant="outlined"
            fullWidth
            margin="normal"
            name="examples"
            value={wordData.examples}
            onChange={handleInputChange}
            multiline
            rows={4}
            required
          />
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="part-of-speech-label">Part of Speech</InputLabel>
            <Select
              labelId="part-of-speech-label"
              value={wordData.partOfSpeech}
              name="partOfSpeech"
              onChange={handleInputChange}
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
            name="synonyms"
            value={wordData.synonyms}
            onChange={handleInputChange}
          />
          <TextField
            label="Antonyms (comma separated)"
            variant="outlined"
            fullWidth
            margin="normal"
            name="antonyms"
            value={wordData.antonyms}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WordComponent;
