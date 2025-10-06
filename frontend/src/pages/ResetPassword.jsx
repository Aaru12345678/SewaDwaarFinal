import React, { useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:5000/api";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) navigate('/forgot');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');

    if (form.newPassword.length < 8 || form.confirmPassword.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const hashedPassword = CryptoJS.SHA256(form.newPassword.trim()).toString();

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/reset-password`, { email, password: hashedPassword });
      setMessage(res.data.message);
      setForm({ newPassword: '', confirmPassword: '' });
      // Navigate to login after success
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
        <Typography variant="h5" mb={3} textAlign="center">Reset Password</Typography>
        <form onSubmit={handleReset}>
          <TextField
            label="New Password"
            name="newPassword"
            type="password"
            fullWidth
            margin="normal"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset'}
          </Button>
          {message && <Alert severity="info" sx={{ mt: 2 }}>{message}</Alert>}
        </form>
      </Box>
    </Container>
  );
};

export default ResetPassword;
