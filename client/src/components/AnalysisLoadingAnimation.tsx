import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { Psychology as PsychologyIcon } from '@mui/icons-material';

const geminiPulse = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 236, 196, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(76, 236, 196, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 236, 196, 0); }
`;

const AnalysisLoadingAnimation: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box sx={{ textAlign: 'center', color: '#fff' }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: `${geminiPulse} 2s infinite`,
          }}
        >
          <PsychologyIcon sx={{ fontSize: 50, color: '#fff' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Analyzing Problems...
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Your personal DSA coach is thinking...
        </Typography>
      </Box>
    </Box>
  );
};

export default AnalysisLoadingAnimation;