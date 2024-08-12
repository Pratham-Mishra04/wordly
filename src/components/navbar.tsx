import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Breadcrumbs, Link, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathArray = router.pathname.split('/').filter(path => path);

  const handleBackClick = () => {
    router.back();
  };

  const generateBreadcrumbs = () => {
    return pathArray.map((path, index) => {
      const href = '/' + pathArray.slice(0, index + 1).join('/');
      const isLast = index === pathArray.length - 1;

      return isLast ? (
        <Typography key={href} color="textPrimary">
          {path.charAt(0).toUpperCase() + path.slice(1)}
        </Typography>
      ) : (
        <Link key={href} color="inherit" onClick={() => router.push(href)} sx={{ cursor: 'pointer' }}>
          {path.charAt(0).toUpperCase() + path.slice(1)}
        </Link>
      );
    });
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {router.pathname !== '/' && (
          <IconButton edge="start" color="inherit" onClick={handleBackClick} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Wordy
        </Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/" sx={{ cursor: 'pointer' }}>
            Home
          </Link>
          {generateBreadcrumbs()}
        </Breadcrumbs>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
