import { Button, Container, Typography, List, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';
import Navbar from '@/components/navbar';
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import WordComponent from '@/components/word';
import AddWordModal from '@/components/add_word';
import BulkAddModal from '@/components/add_words_buck';

const Words: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [bulkAddOpen, setBulkAddOpen] = useState<boolean>(false);

  useEffect(() => {
    async function fetchWords() {
      const response = await axios.get('/api/words');
      setWords(response.data.data);
    }
    fetchWords();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleBulkAddOpen = () => setBulkAddOpen(true);
  const handleBulkAddClose = () => setBulkAddOpen(false);

  return (
    <Container>
      <Navbar />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h2" sx={{ marginTop: '16px' }}>
          Words
        </Typography>
        <Box>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Add New Word
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleBulkAddOpen} sx={{ ml: 2 }}>
            Add Words in Bulk
          </Button>
        </Box>
      </Box>
      <List>
        {words.map((word, index) => (
          <WordComponent key={index} index={index} word={word} setWords={setWords} />
        ))}
      </List>
      <AddWordModal open={open} onClose={handleClose} setWords={setWords} />
      <BulkAddModal open={bulkAddOpen} onClose={handleBulkAddClose} setWords={setWords} />
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
