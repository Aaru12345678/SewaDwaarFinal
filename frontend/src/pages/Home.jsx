import React from 'react';
import BannerSlider from '../Components/Banner';
import OnboardingSteps from './Onboarding';
import '../css/MainPage.css';
import { Container, Typography, Card, CardContent, Box } from '@mui/material';
import { motion } from 'framer-motion';
import AboutMahitiSetu from '../Components/AboutMahitiSetu';
import img from "../assets/4020769.jpg"

export default function Home() {
  
  return (
    <div>
      {/* Banner Slider */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <BannerSlider />
      </motion.div>

      {/* Dashboard Overview Text */}
      <Container
  maxWidth="lg"
  sx={{
    my: 5,
    backgroundImage:{img}, // put your image path here
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: 3,
    p: 3,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <motion.div
    initial={{ x: -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.6 }}
  >
    <Card
      elevation={6}
      sx={{
        borderRadius: 3,
        p: 2,
        backgroundColor: "rgba(255, 255, 255, 0.9)", // white transparency for readability
        backdropFilter: "blur(6px)",
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom color="#003366">
           <span style={{ color: "#1976d2" }}>Overview</span>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The Visitor App lets you seamlessly schedule an appointment with the officer of the required department.
Choose your service, select an available time slot, and submit your request.
Once approved, simply arrive at the scheduled time to complete your work.
After the visit, provide quick feedback and a rating to help improve services—
a smooth, professional way to manage government appointments end to end.
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
</Container>



      {/* Onboarding Steps */}
      <Box sx={{ mt: 5 }}>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <OnboardingSteps />
        </motion.div>
      </Box>
      <AboutMahitiSetu/>
    </div>
  );
}
