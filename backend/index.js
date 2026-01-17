const express = require('express');
const cors = require('cors');

const organizationRoutes = require("./routes/organizationRoutes");
const locationRoutes = require('./routes/locationRoutes');
const signupRoutes = require('./routes/signupRoutes');
const bookAppointmentRoute=require('./routes/bookAppointmentRoute')
const officerRoute=require('./routes/officerRoute');
const visitorRoutes = require('./routes/visitorRoutes');
const fetchRoutes = require("./routes/fetchRoutes"); // ⭐ VERY IMPORTANT
const helpdeskRoutes=require("./routes/helpdeskRoute");
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // if you want cookies/auth headers
}));
const path = require("path");

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/visitor", require("./routes/visitorRoutes"));
app.use(cors());
app.use(express.json());

app.use("/api", organizationRoutes);
app.use("/api/visitor", visitorRoutes);
app.use('/api', locationRoutes);
app.use('/api', signupRoutes);
app.use('/api', bookAppointmentRoute);
app.use('/api', officerRoute);
app.use('/api/helpdesk',helpdeskRoutes);
const servicesRoute = require("./routes/services");

app.use("/api/services", servicesRoute);

app.use("/api/departments", require("./routes/departmentRoutes"));


const appointmentRoutes = require("./routes/appointmentRoutes");

app.use("/api/appointments", appointmentRoutes);

// ⭐ FETCH ROUTES (READ-ONLY APIs)
app.use("/api", fetchRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Server is running!');
});

const appointmentAnalyticsRoutes = require("./routes/analyticsRoutes");

app.use(
  "/api/appointment-analytics",
  appointmentAnalyticsRoutes
);

const walkinAnalyticsRoutes = require("./routes/walkinAnalyticsRoutes");

app.use(
  "/api/walkin-analytics",
  walkinAnalyticsRoutes
);

const slotConfigRoutes = require("./routes/slotConfigRoutes");

app.use("/api/slot-config", slotConfigRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});