import React from 'react';
import { Box, Typography, Paper, Collapse, Fab } from '@mui/material';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { FilterPlatform } from '../types/Problem';

interface PlatformCounts {
  all: number;
  LeetCode: number;
  Codeforces: number;
  CSES: number;
}

interface PlatformFilterProps {
  selectedPlatform: FilterPlatform;
  onPlatformChange: (platform: FilterPlatform) => void;
  problemCounts: PlatformCounts;
  filterExpanded: boolean;
  onToggleExpanded: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const PlatformFilter: React.FC<PlatformFilterProps> = ({
  selectedPlatform,
  onPlatformChange,
  problemCounts,
  filterExpanded,
  onToggleExpanded,
  onMouseEnter,
  onMouseLeave,
}) => {
  const platforms: { value: FilterPlatform; label: string; color: string; icon: string }[] = [
    { value: 'all', label: 'All Platforms', color: '#4ECDC4', icon: '🌐' },
    { value: 'LeetCode', label: 'LeetCode', color: '#FFA726', icon: '🔢' },
    { value: 'Codeforces', label: 'Codeforces', color: '#42A5F5', icon: '🏆' },
    { value: 'CSES', label: 'CSES', color: '#66BB6A', icon: '🎯' },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 32,
        left: 32,
        zIndex: 1000,
      }}
    >
      <Box
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Fab
          onClick={onToggleExpanded}
          sx={{
            background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(45deg, #26C6DA 30%, #4ECDC4 90%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            mb: 1,
          }}
        >
          <FilterIcon />
        </Fab>
        
        <Collapse in={filterExpanded} timeout={300}>
          <Paper
            sx={{
              p: 2,
              mt: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              minWidth: '280px',
              maxWidth: '350px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FilterIcon sx={{ color: '#4ECDC4', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold' }}>
                Filter Problems
              </Typography>
            </Box>
            <Box>
              {platforms.map((platform) => (
                <Box
                  key={platform.value}
                  onClick={() => onPlatformChange(platform.value)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    background: selectedPlatform === platform.value
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                    border: selectedPlatform === platform.value
                      ? `1px solid ${platform.color}`
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      transform: 'translateX(5px)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '1.2rem' }}>{platform.icon}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: selectedPlatform === platform.value ? platform.color : '#fff',
                        fontWeight: selectedPlatform === platform.value ? 'bold' : 'normal',
                      }}
                    >
                      {platform.label}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: platform.color,
                      fontWeight: 'bold',
                      px: 1.5,
                      py: 0.5,
                      background: `${platform.color}20`,
                      borderRadius: 1,
                    }}
                  >
                    {problemCounts[platform.value as keyof PlatformCounts] || 0}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Collapse>
      </Box>
    </Box>
  );
};

export default PlatformFilter;