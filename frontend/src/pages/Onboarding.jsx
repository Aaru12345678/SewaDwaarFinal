import React from 'react';
import '../css/OnboardingSteps.css';
import { Card, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

// Material UI Icons
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DashboardIcon from '@mui/icons-material/Dashboard';

const steps = [
  { id: 1, title: "Visitor Registration", step: "STEP 1", icon: <HowToRegIcon fontSize="large" color="primary" /> },
  { id: 2, title: "Appointment Request", step: "STEP 2", icon: <PersonAddIcon fontSize="large" color="primary" /> },
  { id: 3, title: "Verification", step: "STEP 3", icon: <AssignmentTurnedInIcon fontSize="large" color="primary" /> },
  { id: 4, title: "Visit Status", step: "STEP 4", icon: <DashboardIcon fontSize="large" color="primary" /> }
];

const OnboardingSteps = () => {
  return (
    <Box className="onboarding-container" sx={{ textAlign: 'center', py: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        On-Boarding <span style={{ color: 'black' }}>Procedure</span>
      </Typography>

      <Box
        className="steps-wrapper"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 3,
          mt: 4
        }}
      >
        {steps.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <Card
              sx={{
                width: 200,
                borderRadius: 3,
                textAlign: 'center',
                p: 2,
                boxShadow: 4,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#888' }}>
                {item.step}
              </Typography>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  my: 2
                }}
              >
                {item.icon}
              </Box>
              <Typography variant="h6">{item.title}</Typography>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default OnboardingSteps;
