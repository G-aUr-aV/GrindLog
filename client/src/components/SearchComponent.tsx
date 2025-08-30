import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  Chip,
  Fade,
  Grow,
  Slide,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { format } from 'date-fns';

// Import the correct Problem type from your types file
import { Problem } from '../types/Problem';

// Use the imported Problem type
interface SearchComponentProps {
  allProblems: { [key: string]: Problem[] };
  onSearchResults: (results: { [key: string]: Problem[] } | null) => void;
  selectedPlatform: string;
  onPlatformChange?: (platform: string) => void; // Added optional platform change handler
}

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SearchComponent: React.FC<SearchComponentProps> = ({
  allProblems,
  onSearchResults,
  selectedPlatform,
  onPlatformChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    platformCounts: {} as { [key: string]: number },
  });

  // Search logic
  const performSearch = (query: string) => {
    if (!query.trim()) {
      onSearchResults(null);
      setIsSearchActive(false);
      setSearchStats({ totalResults: 0, platformCounts: {} });
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const results: { [key: string]: Problem[] } = {};
    let totalResults = 0;
    const platformCounts: { [key: string]: number } = {};

    // Search through all problems
    Object.entries(allProblems).forEach(([date, problems]) => {
      const matchingProblems = problems.filter(problem => {
        const titleMatch = problem.title.toLowerCase().includes(searchTerm);
        const platformMatch = selectedPlatform === 'all' || problem.platform === selectedPlatform;
        return titleMatch && platformMatch;
      });

      if (matchingProblems.length > 0) {
        results[date] = matchingProblems;
        totalResults += matchingProblems.length;

        // Count by platform
        matchingProblems.forEach(problem => {
          platformCounts[problem.platform] = (platformCounts[problem.platform] || 0) + 1;
        });
      }
    });

    setSearchStats({ totalResults, platformCounts });
    setIsSearchActive(true);
    onSearchResults(results);
  };

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    setSearchStats({ totalResults: 0, platformCounts: {} });
    onSearchResults(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle platform chip click
  const handlePlatformChipClick = (platform: string) => {
    if (onPlatformChange) {
      onPlatformChange(platform);
      // Re-run search with new platform filter
      performSearch(searchQuery);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      // Escape to clear search
      if (event.key === 'Escape' && isSearchActive) {
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchActive]);

  // Get platform emoji
  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case 'LeetCode': return '🟡';
      case 'Codeforces': return '🔵';
      case 'CSES': return '🟢';
      default: return '⚡';
    }
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 16,
        zIndex: 100,
        mb: 4,
      }}
    >
      <Slide direction="down" in timeout={800}>
        <Paper
          sx={{
            p: 3,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 4,
            transition: 'all 0.4s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #4ECDC4, #667eea, #764ba2)',
              opacity: isSearchActive ? 1 : 0.5,
              transition: 'opacity 0.3s ease',
            },
          }}
        >
          {/* Search Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                animation: searchQuery ? `${pulse} 2s ease-in-out infinite` : 'none',
              }}
            >
              <SearchIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                flex: 1,
              }}
            >
              Search Problems
            </Typography>
            {!isMobile && (
              <Tooltip title="Press Ctrl+K to focus search">
                <Chip
                  label="⌘K"
                  size="small"
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}
                />
              </Tooltip>
            )}
          </Box>

          {/* Search Input */}
          <TextField
            ref={searchInputRef}
            fullWidth
            variant="outlined"
            placeholder="Search problems by title..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <Tooltip title="Clear search (Esc)">
                    <IconButton
                      onClick={clearSearch}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        '&:hover': {
                          color: '#fff',
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 3,
                color: '#fff',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid #4ECDC4',
                  boxShadow: '0 0 20px rgba(76, 236, 196, 0.2)',
                },
              },
              '& .MuiInputBase-input': {
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 1,
                },
              },
            }}
          />

          {/* Search Results Summary */}
          {isSearchActive && (
            <Fade in>
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                
                {searchStats.totalResults > 0 ? (
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#4ECDC4',
                        fontWeight: 'bold',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      🎯 Found {searchStats.totalResults} problem{searchStats.totalResults !== 1 ? 's' : ''} 
                      matching "{searchQuery}"
                    </Typography>

                    {/* Platform breakdown */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }}
                      >
                        Platforms:
                      </Typography>
                      {Object.entries(searchStats.platformCounts).map(([platform, count]) => (
                        <Grow in timeout={300} key={platform}>
                          <Chip
                            label={`${getPlatformEmoji(platform)} ${platform} (${count})`}
                            size="small"
                            clickable={!!onPlatformChange}
                            onClick={() => {
                                        const platformUrls: Record<'LeetCode' | 'CSES' | 'Codeforces', string> = {
                                            'LeetCode': 'https://leetcode.com',
                                            'CSES': 'https://cses.fi',
                                            'Codeforces': 'https://codeforces.com',
                                        };

                                        const url = (platform in platformUrls)
                                            ? platformUrls[platform as 'LeetCode' | 'CSES' | 'Codeforces']
                                            : `https://google.com/search?q=${platform}`;
                                        window.open(url, '_blank');
                                    }}
                            sx={{
                              background: platform === 'LeetCode' 
                                ? 'rgba(255, 161, 22, 0.2)'
                                : platform === 'Codeforces'
                                ? 'rgba(25, 118, 210, 0.2)'
                                : 'rgba(76, 175, 80, 0.2)',
                              color: '#fff',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              fontWeight: 'bold',
                              cursor: onPlatformChange ? 'pointer' : 'default',
                              '&:hover': onPlatformChange ? {
                                background: platform === 'LeetCode' 
                                  ? 'rgba(255, 161, 22, 0.3)'
                                  : platform === 'Codeforces'
                                  ? 'rgba(25, 118, 210, 0.3)'
                                  : 'rgba(76, 175, 80, 0.3)',
                                transform: 'scale(1.05)',
                              } : {},
                              transition: 'all 0.2s ease',
                            }}
                          />
                        </Grow>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 2,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontStyle: 'italic',
                        mb: 1,
                      }}
                    >
                      No problems found matching "{searchQuery}"
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.85rem',
                      }}
                    >
                      Try adjusting your search terms or platform filter
                    </Typography>
                  </Box>
                )}
              </Box>
            </Fade>
          )}

          {/* Search tips */}
          {!isSearchActive && !searchQuery && (
            <Fade in timeout={1000}>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  💡 Quick tip: Use keyboard shortcut {isMobile ? 'to' : 'Ctrl+K to'} focus search
                  {onPlatformChange && (
                    <>
                      <br />
                      🎯 Click on platform chips to filter results
                    </>
                  )}
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Loading shimmer effect */}
          {searchQuery && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: `
                  linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(76, 236, 196, 0.05) 50%, 
                    transparent 100%
                  )
                `,
                backgroundSize: '200px 100%',
                animation: `${shimmer} 2s linear infinite`,
                pointerEvents: 'none',
                opacity: 0.3,
              }}
            />
          )}
        </Paper>
      </Slide>
    </Box>
  );
};

export default SearchComponent;