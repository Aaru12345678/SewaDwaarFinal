import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidenav from './Sidenav';
import Box from '@mui/material/Box';

const Layout = () => {
  return (
    <>
      <Navbar />
      <Box height={50} />
      <Box sx={{ display: 'flex'  ,marginLeft: '100px', padding: 2 }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default Layout;
