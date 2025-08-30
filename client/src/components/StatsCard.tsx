import React from 'react';
import { Paper, Typography, Grow } from '@mui/material';
import { keyframes } from '@mui/system';

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
  isMobile?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  value, 
  icon, 
  gradient, 
  delay = 0,
  isMobile = false 
}) => {
  return (
    <Grow in timeout={1000 + delay}>
      <Paper
        sx={{
          p: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 4,
          textAlign: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          minWidth: isMobile ? '140px' : '180px',
          '&:hover': {
            transform: 'translateY(-10px) scale(1.05)',
            background: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: `${float} 2s ease-in-out infinite`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: gradient,
          },
        }}
      >
        <Typography variant="h3" sx={{ mb: 1, fontSize: '2rem' }}>
          {icon}
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#fff', 
            fontWeight: 'bold',
            background: gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
          {label}
        </Typography>
      </Paper>
    </Grow>
  );
};

export default StatsCard;