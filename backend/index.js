const express = require('express');
const cors = require('cors');

const locationRoutes = require('./routes/locationRoutes');
const signupRoutes = require('./routes/signupRoutes');
const bookAppointmentRoute=require('./routes/bookAppointmentRoute')
const officerRoute=require('./routes/officerRoute');
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // if you want cookies/auth headers
}));

app.use("/api/visitor", require("./routes/visitorRoutes"));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});