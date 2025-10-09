const express = require('express');
const cors = require('cors');

const locationRoutes = require('./routes/locationRoutes');
const signupRoutes = require('./routes/signupRoutes');
const bookAppointmentRoute=require('./routes/bookAppointmentRoute')
const officerRoute=require('./routes/officerRoute');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', locationRoutes);
app.use('/api', signupRoutes);
app.use('/api', bookAppointmentRoute);
app.use('/api', officerRoute);

// Health check
app.get('/', (req, res) => {
  res.send('Server is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
