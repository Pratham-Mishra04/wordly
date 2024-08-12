import Navbar from '@/components/navbar';
import { Button, Container, Typography, Grid } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container>
      <Navbar />
      <Typography variant="h2" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <Button variant="contained" color="primary" fullWidth component={Link} href="/words">
            View Words
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button variant="contained" color="primary" fullWidth component={Link} href="/quiz">
            Take Quiz
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button variant="contained" color="primary" fullWidth component={Link} href="/scores">
            Quiz History
          </Button>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button variant="contained" color="primary" fullWidth component={Link} href="/flashcards">
            Flashcards
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
