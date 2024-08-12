import { Word } from '@/types';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Typography, Card, CardContent, Collapse, Box } from '@mui/material';

interface Props {
  index: number;
  word: Word;
  expandedCard?: number | null;
  setExpandedCard?: Dispatch<SetStateAction<number | null>>;
}

const Flashcard = ({ index, word, expandedCard, setExpandedCard }: Props) => {
  const [clicked, setClicked] = useState(false);

  const isExpanded = () => {
    if (expandedCard) return expandedCard === index;
    return clicked;
  };

  const handleCardClick = () => {
    if (setExpandedCard) setExpandedCard(prev => (prev === index ? null : index));
    else setClicked(prev => !prev);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        cursor: 'pointer',
        transition: '0.3s',
        transform: isExpanded() ? 'scale(1.025)' : 'scale(1)',
        zIndex: isExpanded() ? 1 : 'auto',
        boxShadow: isExpanded() ? 8 : 4,
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: 2,
      }}
    >
      <CardContent>
        <Typography variant="h5">{word.word}</Typography>
        <Collapse in={isExpanded()}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="textSecondary">
              <strong>Meaning:</strong> {word.meaning}
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={2}>
              <strong>Part of Speech:</strong> {word.partOfSpeech}
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={2}>
              <strong>Synonyms:</strong> {word.synonyms?.join(', ') || 'None'}
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={2}>
              <strong>Antonyms:</strong> {word.antonyms?.join(', ') || 'None'}
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={2}>
              <strong>Examples:</strong>
            </Typography>
            {word.examples
              ?.filter((_, i) => i < 2)
              .map((example, i) => (
                <Typography key={i} variant="body2" color="textSecondary" mt={1}>
                  - {example}
                </Typography>
              ))}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default Flashcard;
