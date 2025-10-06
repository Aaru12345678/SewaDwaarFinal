import React, { useState } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:5000/api";

const ForgotPassword = () => {
  const [form, setForm] = useState({ username: '', email: '', mobile: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(`${BASE_URL}/forgot-password`, form);
      setLoading(false);
      setMessage(res.data.message);
      // Navigate to VerifyOTP with state
      navigate('/verify', { state: { userInfo: form } });
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.message || 'Error sending OTP');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
        <Typography variant="h5" mb={3} textAlign="center">Forgot Password</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" type="email" required />
          <TextField label="Mobile" name="mobile" value={form.mobile} onChange={handleChange} fullWidth margin="normal" required />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
          {message && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}
        </form>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
