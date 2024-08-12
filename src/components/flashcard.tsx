import { Word } from '@/types';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Typography, Card, CardContent, Grid, Collapse } from '@mui/material';

interface Props {
  index: number;
  word: Word;
  expandedCard?: number | null;
  setExpandedCard?: Dispatch<SetStateAction<number | null>>;
}

const Flashcard = ({ index, word, expandedCard, setExpandedCard }: Props) => {
  const [showCard, setShowCard] = useState(false);
  const handleCardClick = (index: number) => {
    if (setExpandedCard) setExpandedCard(prev => (prev === index ? null : index));
    else setShowCard(prev => !prev);
  };

  const isClicked = () => {
    if (expandedCard != null || expandedCard != undefined) return expandedCard === index;
    return showCard;
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={index}>
      <Card
        onClick={() => handleCardClick(index)}
        sx={{
          cursor: 'pointer',
          transition: 'transform 0.2s',
          transform: isClicked() ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isClicked() ? 6 : 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {word.word}
          </Typography>
          <Collapse in={isClicked()}>
            <Typography variant="body1" color="textSecondary">
              {word.meaning}
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={2}>
              Examples:
            </Typography>
            {word.examples?.map((example, i) => (
              <Typography key={i} variant="body2" color="textSecondary">
                - {example}
              </Typography>
            ))}
          </Collapse>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default Flashcard;
