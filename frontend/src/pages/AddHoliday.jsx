import React, { useState } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:5000/api";

const AddHoliday = () => {
  const [form, setForm] = useState({ holiday_name: '', date: '', description: '' });
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
      const res = await axios.post(`${BASE_URL}/holiday/add`, form);
      setLoading(false);
      setMessage(res.data.message);

      // after success go back to holiday list  
      navigate('/holidays');
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.message || 'Error adding holiday');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
        <Typography variant="h5" mb={3} color='green' textAlign="center">Add Holiday</Typography>

        <form onSubmit={handleSubmit}>
          {/* Holiday Name */}
          <TextField 
            label="Holiday Name" 
            name="holiday_name" 
            value={form.holiday_name} 
            onChange={handleChange} 
            fullWidth 
            margin="normal" 
            required 
          />

          {/* Correct Date Field */}
          <TextField
            label="Holiday Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />

          {/* Description */}
          <TextField 
            label="Description" 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            fullWidth 
            margin="normal" 
            required 
          />

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }} 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Holiday'}
          </Button>

          {/* Error / Success Message */}
          {message && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default AddHoliday;
