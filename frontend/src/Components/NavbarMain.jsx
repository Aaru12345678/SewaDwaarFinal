import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { jwtDecode } from 'jwt-decode'; // default import

import '../css/NavbarMain.css';
// Removed emblem import

// Helper: decode JWT token
const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token); // decode JWT
    return {
      role_code: decoded.role_code,
      user_code: decoded.user_code,
      full_name: decoded.full_name,
    };
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

const NavbarMain = () => {
  const navigate = useNavigate();
  const tokenData = useMemo(() => getTokenData(), []);
  const isLoggedIn = !!tokenData;
  const roleCode = tokenData?.role_code;
  const name = tokenData?.full_name || '';

  const firstName = name ? name.split(' ')[0] : '';

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleMenuClose();
    navigate("/login");
  };

  const handleLogin = () => navigate("/login");

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">
          {/* Emblem removed */}
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          

          {isLoggedIn && (roleCode === "AD" || roleCode === "SA") && (
            <>
              <li><Link to="/AdminRequest"></Link></li>
              <li><Link to="/AddScheme">Add Scheme</Link></li>
            </>
          )}

          {isLoggedIn && (roleCode === "DE" || roleCode === "SA") && (
            <>
              {/* Future links for DE/SA roles */}
            </>
          )}
        </ul>
      </div>

      <div className="nav-right">
        {isLoggedIn ? (
          <>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ color: 'white', display: 'flex', alignItems: 'center' }}
            >
              <AccountCircle fontSize="large" />
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  lineHeight: 1,
                  fontWeight: 500,
                  color: 'white'
                }}
              >
                {firstName}
              </Typography>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>
                <Typography variant="subtitle1">{name}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: '8px',
              padding: '6px 16px',
              boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
            }}
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default NavbarMain;
