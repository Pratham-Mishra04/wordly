import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Breadcrumbs, Link, Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathArray = router.pathname.split('/').filter(path => path);

  const handleBackClick = () => {
    router.back();
  };

  const { data: session } = useSession();

  const handleLogin = () => {
    if (!session) signIn('google');
  };

  const handleLogout = () => {
    signOut();
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
        {session && (
          <>
            {session.user && (
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link color="inherit" href="/" sx={{ cursor: 'pointer' }}>
                    Home
                  </Link>
                  {generateBreadcrumbs()}
                </Breadcrumbs>
                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {session.user.image && (
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden' }}>
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        layout="responsive"
                        objectFit="cover"
                      />
                    </Box>
                  )}
                  {/* <Typography variant="body1">{session.user.name || 'User'}</Typography> */}
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
        {!session && (
          <Button color="inherit" onClick={handleLogin}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
