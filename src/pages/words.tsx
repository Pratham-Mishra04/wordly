import {
  Button,
  Container,
  Typography,
  List,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';
import Navbar from '@/components/navbar';
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import WordComponent from '@/components/word';
import AddWordModal from '@/components/add_word';
import BulkAddModal from '@/components/add_words_bulk';
import InfiniteScroll from 'react-infinite-scroll-component';

const Words: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [open, setOpen] = useState<boolean>(false);
  const [bulkAddOpen, setBulkAddOpen] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('created_at'); // Add sortOrder state

  const fetchWords = async (initialPage?: number) => {
    try {
      const response = await axios.get(
        `/api/words?page=${initialPage ? initialPage : page}&limit=20&query=${searchQuery}&sort=${sortOrder}`
      );
      const addedWords = response.data.data;
      if (initialPage) setWords(addedWords);
      else setWords(prevWords => [...prevWords, ...addedWords]);
      setHasMore(addedWords.length > 0);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchWords(1);
    setWords([]);
  }, [searchQuery, sortOrder]); // Update words on sortOrder change

  useEffect(() => {
    const fetchWordCounts = async () => {
      try {
        const response = await axios.get('/api/words/meta');
        setWordCount(response.data.data['all time'] || 0);
      } catch (err) {
        console.error('Failed to fetch word counts', err);
      }
    };

    fetchWordCounts();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleBulkAddOpen = () => setBulkAddOpen(true);
  const handleBulkAddClose = () => setBulkAddOpen(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortOrderChange = (event: React.ChangeEvent<{ value: unknown }> | SelectChangeEvent<string>) => {
    setSortOrder(event.target.value as string);
  };

  return (
    <Container>
      <Navbar />
      <Box display="flex" flexDirection="column" sx={{ marginTop: '16px' }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={{ xs: '12px', md: '0px' }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h2">Words ({wordCount})</Typography>
          <Box>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Add New Word
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleBulkAddOpen} sx={{ ml: 2 }}>
              Add Words in Bulk
            </Button>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={{ xs: '12px', md: '0px' }}
          justifyContent="space-between"
          alignItems="center"
          sx={{ marginTop: '16px' }}
        >
          <TextField
            label="Search Words"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FormControl
            variant="outlined"
            sx={{
              marginLeft: { xs: 0, md: 2 },
              minWidth: { xs: '100%', md: 180 },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <InputLabel id="sort-order-label">Sort By</InputLabel>
            <Select labelId="sort-order-label" value={sortOrder} onChange={handleSortOrderChange} label="Sort By">
              <MenuItem value="created_at">Date Added</MenuItem>
              <MenuItem value="alpha">Alphabetical</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <InfiniteScroll
        style={{ overflowY: 'hidden' }}
        dataLength={words.length}
        next={fetchWords}
        hasMore={hasMore}
        loader={<></>}
      >
        <List>
          {words.map((word, index) => (
            <WordComponent key={index} index={index} word={word} setWords={setWords} />
          ))}
        </List>
      </InfiniteScroll>

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
