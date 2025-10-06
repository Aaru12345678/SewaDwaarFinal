import { Box, Typography } from "@mui/material";
import { Insights } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function WelcomeBanner() {
  return (
    <Box
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        background: "linear-gradient(90deg, #1976d2, #42a5f5)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
      component={motion.div}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Insights sx={{ fontSize: 50 }} />
      <Box>
        <Typography variant="h4" fontWeight="bold">
          MahitiSetu Dashboard
        </Typography>
        <Typography variant="subtitle1">
          Your bridge to transparent and accessible scheme insights.
        </Typography>
      </Box>
    </Box>
  );
}
