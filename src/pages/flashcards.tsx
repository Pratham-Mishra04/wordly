import { Container, Typography, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Word } from '@/types';
import Flashcard from '@/components/flashcard';
import Navbar from '@/components/navbar';
import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import Masonry from 'react-masonry-css';
import InfiniteScroll from 'react-infinite-scroll-component';

const Flashcards: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchWords = async (initialPage?: number) => {
    try {
      const response = await axios.get(
        `/api/words?page=${initialPage ? initialPage : page}&limit=25&query=${searchQuery}`
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
  }, [searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Container>
      <Navbar />
      <Typography variant="h2" sx={{ marginTop: '16px', marginBottom: '12px' }}>
        Flashcards
      </Typography>
      <TextField
        label="Search Words"
        variant="outlined"
        fullWidth
        style={{ marginBottom: '24px' }}
        value={searchQuery}
        onChange={handleSearchChange}
      />

      <InfiniteScroll
        style={{ padding: '16px', overflowY: 'hidden' }}
        dataLength={words.length}
        next={fetchWords}
        hasMore={hasMore}
        loader={<></>}
      >
        <Masonry
          breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {words.map((word, index) => (
            <Flashcard
              key={index}
              index={index}
              word={word}
              expandedCard={expandedCard}
              setExpandedCard={setExpandedCard}
            />
          ))}
        </Masonry>
      </InfiniteScroll>
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
