
import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Fab,
  Box,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Grow,
  Slide,
  Fade,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
  Tooltip,
  Badge,
  Card,
  CardContent,
  LinearProgress,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  TextField,
  InputAdornment,
  ButtonGroup,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Drawer,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Insights as InsightsIcon,
  EventAvailable as EventAvailableIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Tune as TuneIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Whatshot as FireIcon,
  Stars as StarsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  FlashOn as BoltIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  PersonPin as PersonPinIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Launch as LaunchIcon,
  ArrowForward as ArrowForwardIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  AutoGraph as AutoGraphIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Bolt as LightningIcon,
  Leaderboard as LeaderboardIcon,
} from '@mui/icons-material';
import { format, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isSameDay, getDay } from 'date-fns';
import { keyframes } from '@mui/system';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Custom hooks
import { useProblems } from '../hooks/useProblems';

// Types
import { Problem } from '../types/Problem';

// Components
import AddProblemForm from '../components/AddProblemForm';
import ProblemCard from '../components/ProblemCard';
import StatsCard from '../components/StatsCard';
import ProgressChart from '../components/ProgressChart';

type GroupedProblems = { [key: string]: Problem[] };

// Enhanced animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const gradientMove = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 236, 196, 0.3); }
  50% { box-shadow: 0 0 30px rgba(76, 236, 196, 0.5), 0 0 40px rgba(102, 126, 234, 0.3); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const slideInRight = keyframes`
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
`;

// Platform configurations
const PLATFORMS = [
  { id: 'all', name: 'All Platforms', icon: '🌐', color: '#4ECDC4' },
  { id: 'LeetCode', name: 'LeetCode', icon: '🟡', color: '#FFA116' },
  { id: 'Codeforces', name: 'Codeforces', icon: '🔴', color: '#FF6B6B' },
  { id: 'CSES', name: 'CSES', icon: '🔵', color: '#3F51B5' },
] as const;

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const problemsRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const {
    problems,
    allProblems,
    loading,
    error,
    selectedPlatform,
    setSelectedPlatform,
    addProblem,
    deleteProblem,
    calculateProblemCounts,
    calculateStreak,
    fetchProblems,
  } = useProblems();

  // Enhanced state management
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GroupedProblems | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'platform' | 'title'>('date');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    streak: 0,
    thisWeek: 0,
    activeDays: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filteredProblems: GroupedProblems = {};

    Object.entries(allProblems).forEach(([date, problems]) => {
      const matchingProblems = problems.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm) ||
        problem.platform.toLowerCase().includes(searchTerm) ||
        problem.url.toLowerCase().includes(searchTerm)
      );

      if (matchingProblems.length > 0) {
        filteredProblems[date] = selectedPlatform !== 'all'
          ? matchingProblems.filter(p => p.platform === selectedPlatform)
          : matchingProblems;
      }
    });

    setSearchResults(filteredProblems);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Analytics data
  const analyticsData = React.useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateKey = format(date, 'yyyy-MM-dd');
      const problemsCount = allProblems[dateKey]?.length || 0;
      return {
        date: format(date, 'MMM dd'),
        problems: problemsCount,
        dateKey,
      };
    });

    const platformData = Object.entries(calculateProblemCounts())
      .filter(([platform]) => platform !== 'all')
      .map(([platform, count]) => ({
        name: platform,
        value: count,
        color: PLATFORMS.find(p => p.id === platform)?.color || '#9E9E9E',
      }))
      .sort((a, b) => b.value - a.value);

    return { last30Days, platformData };
  }, [allProblems, calculateProblemCounts]);

  // Safe navigation function without React Router dependency
  const handleAnalyticsClick = () => {
    try {
      const currentPath = window.location.pathname;
      if (currentPath.includes('analytics')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', '/analytics');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        window.location.href = '/analytics';
      }
    } catch (error) {
      console.log('Navigating to analytics page...');
      setSnackbar({
        open: true,
        message: '📊 Analytics feature coming soon! Building comprehensive dashboard...',
        severity: 'info'
      });
    }
  };

  // Compact Calendar component
  const CompactCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const weeks = [];
    for (let i = 0; i < dateRange.length; i += 7) {
      weeks.push(dateRange.slice(i, i + 7));
    }

    const getProblemCountForDate = (date: Date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return allProblems[dateKey]?.length || 0;
    };

    const getIntensityColor = (count: number) => {
      if (count === 0) return 'rgba(255, 255, 255, 0.08)';
      if (count <= 2) return 'rgba(76, 236, 196, 0.4)';
      if (count <= 4) return 'rgba(76, 236, 196, 0.7)';
      if (count <= 6) return 'rgba(76, 236, 196, 0.9)';
      return '#4ECDC4';
    };

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Month Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4ECDC4' } }}
            >
              <ArrowLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4ECDC4' } }}
            >
              <ArrowRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Weekday headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                py: 0.5,
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Calendar grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
          {weeks.map((week, weekIndex) => (
            <Box key={weekIndex} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {week.map((date) => {
                const problemCount = getProblemCountForDate(date);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isCurrentDay = isToday(date);

                return (
                  <Tooltip
                    key={date.toString()}
                    title={`${format(date, 'MMM d')}: ${problemCount} problem${problemCount !== 1 ? 's' : ''}`}
                    arrow
                  >
                    <Box
                      onClick={() => {
                        setSelectedDate(date);
                        setTimeout(() => {
                          if (problemsRef.current) {
                            problemsRef.current.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      sx={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: getIntensityColor(problemCount),
                        border: isSelected ? '2px solid #4ECDC4' : isCurrentDay ? '2px solid #FF8A80' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 1,
                        cursor: 'pointer',
                        opacity: isCurrentMonth ? 1 : 0.3,
                        transition: 'all 0.2s ease',
                        minHeight: '28px',
                        fontSize: '0.75rem',
                        fontWeight: isCurrentDay || isSelected || problemCount > 0 ? 'bold' : 'normal',
                        color: problemCount > 0 || isCurrentDay ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          background: isCurrentMonth ? 'rgba(76, 236, 196, 0.6)' : 'rgba(255, 255, 255, 0.1)',
                          zIndex: 1,
                        },
                      }}
                    >
                      {format(date, 'd')}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Compact Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem' }}>
            Less
          </Typography>
          {[0, 1, 3, 5, 7].map((count) => (
            <Box
              key={count}
              sx={{
                width: 8,
                height: 8,
                background: getIntensityColor(count),
                borderRadius: 0.5,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem' }}>
            More
          </Typography>
        </Box>
      </Box>
    );
  };

  // Animated counter effect
  useEffect(() => {
    const problemCounts = calculateProblemCounts();
    const streak = calculateStreak();
    const activeDays = Object.keys(allProblems).length;
    const thisWeek = Object.keys(allProblems).filter(date => {
      const d = new Date(date);
      const today = new Date();

      // Get the current week's Sunday (start of week)
      const currentWeekStart = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      currentWeekStart.setDate(today.getDate() - dayOfWeek);
      currentWeekStart.setHours(0, 0, 0, 0);

      // Get the current week's Saturday (end of week)
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
      currentWeekEnd.setHours(23, 59, 59, 999);

      // Reset problem date to start of day
      d.setHours(0, 0, 0, 0);

      return d >= currentWeekStart && d <= currentWeekEnd;
    }).reduce((count, date) => {
      return count + (allProblems[date]?.length || 0);
    }, 0);

    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(start + (end - start) * progress);
        callback(value);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    };

    setTimeout(() => {
      animateValue(0, problemCounts.all, 1500, (value) =>
        setAnimatedStats(prev => ({ ...prev, total: value }))
      );
      animateValue(0, streak, 1200, (value) =>
        setAnimatedStats(prev => ({ ...prev, streak: value }))
      );
      animateValue(0, thisWeek, 1000, (value) =>
        setAnimatedStats(prev => ({ ...prev, thisWeek: value }))
      );
      animateValue(0, activeDays, 1800, (value) =>
        setAnimatedStats(prev => ({ ...prev, activeDays: value }))
      );
    }, 500);
  }, [allProblems, calculateProblemCounts, calculateStreak]);

  // Event handlers
  const handleAddProblem = async (problemData: { platform: any; title: string; url: string; }) => {
    try {
      setIsSaving(true);
      const newProblem = await addProblem(problemData);

      if (fetchProblems) {
        await fetchProblems();
      }

      setAddFormOpen(false);
      setSnackbar({
        open: true,
        message: '🎉 Problem added successfully! Keep grinding!',
        severity: 'success'
      });

      setTimeout(() => {
        if (problemsRef.current) {
          problemsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add problem. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    try {
      await deleteProblem(problemId);

      if (fetchProblems) {
        await fetchProblems();
      }

      setSnackbar({
        open: true,
        message: '✅ Problem deleted successfully!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete problem. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Utility functions
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return `Today, ${format(date, 'MMMM d, yyyy')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'MMMM d, yyyy')}`;
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getProblemsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const problemsForDate = allProblems[dateKey] || [];

    return selectedPlatform !== 'all'
      ? problemsForDate.filter(problem => problem.platform === selectedPlatform)
      : problemsForDate;
  };

  const getDisplayProblems = (): GroupedProblems => {
    if (searchResults) {
      if (selectedDate) {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const problemsForDate = searchResults[dateKey] || [];

        if (problemsForDate.length > 0) {
          return { [dateKey]: problemsForDate };
        } else {
          return {};
        }
      }
      return searchResults;
    }

    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const problemsForDate = getProblemsForDate(selectedDate);

      if (problemsForDate.length > 0) {
        return { [dateKey]: problemsForDate };
      } else {
        return {};
      }
    }

    const last7DaysProblems: GroupedProblems = {};
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const dateRange = eachDayOfInterval({ start: sevenDaysAgo, end: today });

    dateRange.reverse().forEach(date => {
      const problemsForDate = getProblemsForDate(date);
      if (problemsForDate.length > 0) {
        const dateKey = format(date, 'yyyy-MM-dd');
        last7DaysProblems[dateKey] = problemsForDate;
      }
    });

    return last7DaysProblems;
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const startWeek = startOfWeek(today);
    const endWeek = endOfWeek(today);
    const weekDays = eachDayOfInterval({ start: startWeek, end: endWeek });

    return weekDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const problems = allProblems[dateKey] || [];
      return {
        date: format(day, 'EEE'),
        count: problems.length,
        isToday: isToday(day),
      };
    });
  };

  const getRecentActivity = () => {
    const recent = Object.entries(allProblems)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 5);

    return recent.map(([date, problems]) => ({
      date,
      problems: problems.slice(0, 3),
      totalCount: problems.length,
    }));
  };

  // Loading state with enhanced skeleton
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `
            radial-gradient(ellipse at top, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width="40%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <Skeleton
                  variant="rectangular"
                  height={120}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}
                />
              </Box>
            ))}
          </Box>

          <Skeleton
            variant="rectangular"
            height={300}
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, mb: 3 }}
          />

          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={200}
              sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, mb: 2 }}
            />
          ))}
        </Container>
      </Box>
    );
  }

  // Get display data
  const displayProblems = getDisplayProblems();
  const displayDates = Object.keys(displayProblems).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );
  const problemCounts = calculateProblemCounts();
  const isSearchActive = searchResults !== null;
  const weeklyProgress = getWeeklyProgress();
  const recentActivity = getRecentActivity();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at top, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at bottom, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Professional Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(30px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                animation: `${float} 3s ease-in-out infinite`,
                boxShadow: '0 8px 25px rgba(76, 236, 196, 0.3)',
              }}
            >
              <CodeIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 70%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: -0.5,
                }}
              >
                GrindLog
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 500,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Performance Dashboard
              </Typography>
            </Box>
          </Box>

          {/* Advanced Search Bar */}
          <Box sx={{ flex: 2, maxWidth: 600, mx: 3, display: { xs: 'none', md: 'block' } }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search problems, platforms, or keywords..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '30px',
                  height: '48px',
                  '& fieldset': {
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '30px',
                  },
                  '&:hover fieldset': {
                    border: '1px solid rgba(76, 236, 196, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    border: '2px solid #4ECDC4',
                    boxShadow: '0 0 20px rgba(76, 236, 196, 0.3)',
                  },
                  '& input': {
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      opacity: 1,
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Analytics Button */}
            <Tooltip title="View Analytics Dashboard">
              <Button
                onClick={handleAnalyticsClick}
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                sx={{
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#667eea',
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                Analytics
              </Button>
            </Tooltip>

            {/* Filter Drawer Toggle */}
            <Tooltip title="Advanced Filters">
              <IconButton
                onClick={() => setFilterDrawerOpen(true)}
                sx={{
                  width: 48,
                  height: 48,
                  background: 'rgba(255, 138, 128, 0.1)',
                  border: '1px solid rgba(255, 138, 128, 0.3)',
                  color: '#FF8A80',
                  '&:hover': {
                    background: 'rgba(255, 138, 128, 0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>

            {/* Mobile Analytics */}
            {isMobile && (
              <Tooltip title="Analytics">
                <IconButton
                  onClick={handleAnalyticsClick}
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    color: '#667eea',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <AnalyticsIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Mobile Search */}
            {isMobile && (
              <Tooltip title="Search">
                <IconButton
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'rgba(76, 236, 196, 0.1)',
                    border: '1px solid rgba(76, 236, 196, 0.3)',
                    color: '#4ECDC4',
                    '&:hover': {
                      background: 'rgba(76, 236, 196, 0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Advanced Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: 400 },
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
            backdropFilter: 'blur(30px)',
            border: 'none',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
              🎛️ Smart Filters
            </Typography>
            <IconButton
              onClick={() => setFilterDrawerOpen(false)}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <ClearIcon />
            </IconButton>
          </Box>

          {/* Platform Filter Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 3, fontWeight: 'bold' }}>
              🌐 Platforms
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {PLATFORMS.map((platform) => {
                const count = platform.id === 'all'
                  ? problemCounts.all
                  : problemCounts[platform.id as keyof typeof problemCounts] || 0;

                return (
                  <Button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    sx={{
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 3,
                      background: selectedPlatform === platform.id
                        ? `linear-gradient(45deg, ${platform.color}20, ${platform.color}10)`
                        : 'rgba(255, 255, 255, 0.03)',
                      border: selectedPlatform === platform.id
                        ? `2px solid ${platform.color}60`
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      color: selectedPlatform === platform.id ? platform.color : '#fff',
                      textTransform: 'none',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${platform.color}30, ${platform.color}15)`,
                        border: `2px solid ${platform.color}80`,
                        transform: 'translateX(5px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ fontSize: '1.2rem' }}>{platform.icon}</Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {platform.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={count}
                      size="small"
                      sx={{
                        background: selectedPlatform === platform.id ? platform.color : 'rgba(255,255,255,0.1)',
                        color: selectedPlatform === platform.id ? '#fff' : 'rgba(255,255,255,0.8)',
                        fontWeight: 'bold',
                        minWidth: '40px',
                      }}
                    />
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* View Options */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 3, fontWeight: 'bold' }}>
              🎯 View Options
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              sx={{ width: '100%', mb: 3 }}
            >
              <ToggleButton
                value="list"
                sx={{
                  flex: 1,
                  color: '#fff',
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                    color: '#fff'
                  }
                }}
              >
                <ViewListIcon sx={{ mr: 1 }} />
                List
              </ToggleButton>
              <ToggleButton
                value="grid"
                sx={{
                  flex: 1,
                  color: '#fff',
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                    color: '#fff'
                  }
                }}
              >
                <ViewModuleIcon sx={{ mr: 1 }} />
                Grid
              </ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={(_, newSort) => newSort && setSortBy(newSort)}
              sx={{ width: '100%' }}
            >
              <ToggleButton
                value="date"
                sx={{
                  flex: 1,
                  fontSize: '0.8rem',
                  color: '#fff',
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    color: '#fff'
                  }
                }}
              >
                Date
              </ToggleButton>
              <ToggleButton
                value="platform"
                sx={{
                  flex: 1,
                  fontSize: '0.8rem',
                  color: '#fff',
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    color: '#fff'
                  }
                }}
              >
                Platform
              </ToggleButton>
              <ToggleButton
                value="title"
                sx={{
                  flex: 1,
                  fontSize: '0.8rem',
                  color: '#fff',
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    color: '#fff'
                  }
                }}
              >
                Title
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Quick Actions */}
          <Box>
            <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 3, fontWeight: 'bold' }}>
              ⚡ Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                onClick={() => setSelectedDate(new Date())}
                startIcon={<TodayIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(76, 236, 196, 0.1)',
                  border: '1px solid rgba(76, 236, 196, 0.3)',
                  color: '#4ECDC4',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'rgba(76, 236, 196, 0.2)',
                    transform: 'translateX(5px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Show Today's Problems
              </Button>

              <Button
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedPlatform('all');
                  clearSearch();
                }}
                startIcon={<ClearIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(255, 138, 128, 0.1)',
                  border: '1px solid rgba(255, 138, 128, 0.3)',
                  color: '#FF8A80',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'rgba(255, 138, 128, 0.2)',
                    transform: 'translateX(5px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Mobile Search Bar */}
      {isMobile && (
        <Box sx={{ p: 2, background: 'rgba(26, 26, 46, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '25px',
                height: '44px',
                '& fieldset': {
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '25px',
                },
                '&:hover fieldset': {
                  border: '1px solid rgba(76, 236, 196, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  border: '2px solid #4ECDC4',
                },
                '& input': {
                  color: '#fff',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    opacity: 1,
                  },
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={clearSearch} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {/* Floating particles background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          background: `
            repeating-linear-gradient(90deg, transparent, transparent 98px, rgba(255,255,255,0.1) 100px),
            repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(255,255,255,0.1) 100px)
          `,
          animation: `${shimmer} 20s linear infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Saving Animation */}
      {isSaving && (
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
            animation: `${fadeInUp} 0.5s ease-out`,
          }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              maxWidth: '400px',
              animation: `${scaleIn} 0.5s ease-out`,
            }}
          >
            <Box sx={{ fontSize: '4rem', mb: 2, animation: `${bounceIn} 1s ease-out` }}>
              🎯
            </Box>
            <Typography variant="h5" sx={{ color: '#4ECDC4', fontWeight: 'bold', mb: 2 }}>
              Saving Achievement...
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
              Every problem solved makes you stronger! 💪
            </Typography>
            <CircularProgress sx={{ color: '#4ECDC4' }} />
          </Paper>
        </Box>
      )}

      <Container maxWidth="xl" sx={{ pt: 3, pb: 0, position: 'relative', zIndex: 1 }}>
        {/* Welcome Banner */}
        {showWelcome && Object.keys(allProblems).length === 0 && (
          <Slide direction="down" in timeout={1000}>
            <Paper
              sx={{
                p: 4,
                mb: 4,
                background: 'linear-gradient(135deg, rgba(76, 236, 196, 0.1), rgba(102, 126, 234, 0.1))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 236, 196, 0.3)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#4ECDC4', fontWeight: 'bold', mb: 1 }}>
                    Welcome to GrindLog Professional! 🚀
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    Your premium coding journey tracker. Start by adding your first solved problem and unlock
                    powerful analytics, streaks, and insights to accelerate your growth.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<AddIcon />}
                      label="Add First Problem"
                      onClick={() => setAddFormOpen(true)}
                      sx={{
                        background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                        color: '#fff',
                        fontWeight: 'bold',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                  </Box>
                </Box>
                <IconButton
                  onClick={() => setShowWelcome(false)}
                  sx={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  ✕
                </IconButton>
              </Box>
            </Paper>
          </Slide>
        )}

        {/* Enhanced Stats Dashboard */}
        <Box sx={{ display: 'flex', gap: 3, mb: 6, flexWrap: 'wrap' }}>
          <Grow in timeout={800}>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(76, 236, 196, 0.1), rgba(76, 236, 196, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(76, 236, 196, 0.2)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(76, 236, 196, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      animation: `${pulse} 3s ease-in-out infinite`,
                    }}
                  >
                    <TrophyIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#4ECDC4', fontWeight: 'bold', mb: 1 }}>
                    {animatedStats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Total Solved
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grow>

          <Grow in timeout={1200}>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      animation: `${pulse} 3s ease-in-out infinite 0.4s`,
                    }}
                  >
                    <BoltIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#667eea', fontWeight: 'bold', mb: 1 }}>
                    {animatedStats.thisWeek}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    This Week Solved
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grow>

          <Grow in timeout={1000}>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 138, 128, 0.1), rgba(255, 87, 34, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 138, 128, 0.2)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(255, 138, 128, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #FF8A80 30%, #FF5722 90%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      animation: `${pulse} 3s ease-in-out infinite 0.2s`,
                    }}
                  >
                    <FireIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#FF8A80', fontWeight: 'bold', mb: 1 }}>
                    {animatedStats.streak}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Day Streak
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grow>

          <Grow in timeout={1400}>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1), rgba(76, 175, 80, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 195, 74, 0.2)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(139, 195, 74, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #8BC34A 30%, #4CAF50 90%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      animation: `${pulse} 3s ease-in-out infinite 0.6s`,
                    }}
                  >
                    <EventAvailableIcon sx={{ fontSize: 30, color: '#fff' }} />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#8BC34A', fontWeight: 'bold', mb: 1 }}>
                    {animatedStats.activeDays}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Active Days
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grow>
        </Box>

        {/* Unified Dashboard Layout - BOTH SECTIONS SAME HEIGHT */}
        <Box sx={{
          display: 'flex',
          gap: 3,
          mb: 4,
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { lg: 'stretch' }  // This makes both sections same height
        }}>
          {/* Calendar Section */}
          <Box sx={{ flex: { lg: '0 0 350px' }, width: { xs: '100%', lg: '350px' } }}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                height: '100%',  // Fill container height
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CalendarIcon sx={{ color: '#4ECDC4', fontSize: 24 }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Activity Calendar
                </Typography>
              </Box>
              <CompactCalendar />
            </Paper>
          </Box>

          {/* Analytics Section */}
          <Box sx={{ flex: 1 }}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                height: '100%',  // Fill container height
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShowChartIcon sx={{ color: '#4ECDC4', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Analytics Overview
                  </Typography>
                </Box>
                <Button
                  onClick={handleAnalyticsClick}
                  endIcon={<ArrowForwardIcon />}
                  size="small"
                  sx={{
                    color: '#4ECDC4',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'rgba(76, 236, 196, 0.1)',
                    },
                  }}
                >
                  View Full Analytics
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', xl: 'row' }, flex: 1 }}>
                {/* 30-Day Trend */}
                <Box sx={{ flex: { xl: '2 1 0' } }}>
                  <Typography variant="subtitle1" sx={{ color: '#4ECDC4', mb: 2, fontWeight: 'bold' }}>
                    📈 30-Day Activity Trend
                  </Typography>
                  <Box sx={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.last30Days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                          dataKey="date"
                          stroke="rgba(255,255,255,0.7)"
                          fontSize={10}
                        />
                        <YAxis stroke="rgba(255,255,255,0.7)" fontSize={10} />
                        <RechartsTooltip
                          contentStyle={{
                            background: 'rgba(26, 26, 46, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="problems"
                          stroke="#4ECDC4"
                          fill="url(#gradient)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                {/* Platform Distribution */}
                <Box sx={{ flex: { xl: '1 1 0' }, minWidth: { xl: '250px' } }}>
                  <Typography variant="subtitle1" sx={{ color: '#4ECDC4', mb: 2, fontWeight: 'bold' }}>
                    🎯 Platform Split
                  </Typography>
                  {analyticsData.platformData.length > 0 ? (
                    <Box>
                      <Box sx={{ height: '150px', mb: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.platformData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={60}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {analyticsData.platformData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                background: 'rgba(26, 26, 46, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#fff'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <Stack spacing={1}>
                        {analyticsData.platformData.slice(0, 3).map((platform) => (
                          <Box key={platform.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: platform.color,
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#fff', flex: 1, fontSize: '0.87rem' }}>
                              {platform.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: platform.color, fontWeight: 'bold', fontSize: '0.85rem' }}>
                              {platform.value}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        No data yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Recent Activity Section */}
        <Box sx={{ mb: 4 }}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FireIcon sx={{ color: '#4ECDC4', fontSize: 24 }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                Recent Activity
              </Typography>
            </Box>

            {recentActivity.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {recentActivity.map((activity, index) => (
                  <Box key={activity.date} sx={{ flex: '1 1 200px', minWidth: '180px', maxWidth: '240px' }}>
                    <Fade in timeout={1000 + index * 200}>
                      <Card
                        sx={{
                          p: 2,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.08)',
                            transform: 'translateY(-3px)',
                            border: '1px solid rgba(76, 236, 196, 0.3)',
                          },
                        }}
                        onClick={() => {
                          setSelectedDate(new Date(activity.date));
                          setTimeout(() => {
                            if (problemsRef.current) {
                              problemsRef.current.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: isToday(new Date(activity.date))
                                ? 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)'
                                : 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#4ECDC4', fontWeight: 'bold', display: 'block' }}>
                              {format(new Date(activity.date), 'MMM d')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                              {activity.totalCount} problem{activity.totalCount !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (activity.totalCount / 5) * 100)}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(45deg, #4ECDC4, #667eea)',
                            },
                          }}
                        />
                      </Card>
                    </Fade>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PsychologyIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Start solving problems to see your activity here
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Active Filters Status */}
        {(isSearchActive || selectedDate || selectedPlatform !== 'all') && (
          <Fade in>
            <Paper
              sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, rgba(76, 236, 196, 0.1), rgba(102, 126, 234, 0.05))',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(76, 236, 196, 0.3)',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                animation: `${glow} 3s ease-in-out infinite`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#4ECDC4',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  🎛️ Active Filters
                </Typography>

                {isSearchActive && (
                  <Chip
                    icon={<SearchIcon />}
                    label={`Search: ${Object.values(searchResults || {}).reduce((total, problems) => total + problems.length, 0)} results`}
                    sx={{
                      background: 'rgba(255, 138, 128, 0.2)',
                      color: '#FF8A80',
                      border: '1px solid rgba(255, 138, 128, 0.3)',
                      fontWeight: 'bold',
                    }}
                  />
                )}

                {selectedPlatform !== 'all' && (
                  <Chip
                    label={`Platform: ${selectedPlatform}`}
                    sx={{
                      background: 'rgba(102, 126, 234, 0.2)',
                      color: '#667eea',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      fontWeight: 'bold',
                    }}
                  />
                )}

                {selectedDate && (
                  <Chip
                    icon={<CalendarIcon />}
                    label={`Date: ${format(selectedDate, 'MMM d, yyyy')}`}
                    sx={{
                      background: 'rgba(139, 195, 74, 0.2)',
                      color: '#8BC34A',
                      border: '1px solid rgba(139, 195, 74, 0.3)',
                      fontWeight: 'bold',
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {isSearchActive && (
                  <Tooltip title="Clear Search">
                    <IconButton
                      onClick={clearSearch}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          color: '#fff',
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {selectedDate && (
                  <Tooltip title="Clear Date Filter">
                    <IconButton
                      onClick={() => setSelectedDate(null)}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          color: '#fff',
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <CalendarIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          </Fade>
        )}

        {/* Error display */}
        {error && (
          <Fade in>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                color: '#fff',
                '& .MuiAlert-icon': { color: '#f44336' }
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Problems list */}
        <Box ref={problemsRef}>
          {displayDates.length === 0 ? (
            <Grow in timeout={1500}>
              <Paper
                sx={{
                  p: 8,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  animation: `${float} 4s ease-in-out infinite`,
                }}
              >
                <Box sx={{ fontSize: '5rem', mb: 3 }}>
                  {isSearchActive ? '🔍' : selectedDate ? '📅' : '🚀'}
                </Box>
                <Typography variant="h3" sx={{ color: '#fff', mb: 2, fontWeight: 'bold' }}>
                  {isSearchActive
                    ? 'No problems found'
                    : selectedDate
                      ? 'No problems for this date'
                      : 'Ready to start grinding?'
                  }
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
                  {isSearchActive
                    ? 'Try adjusting your search terms or platform filter'
                    : selectedDate
                      ? 'Add a new problem or select a different date'
                      : 'Add your first solved problem and begin your professional coding journey!'
                  }
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Chip
                    icon={<AddIcon />}
                    label="Add Problem"
                    onClick={() => setAddFormOpen(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      px: 3,
                      py: 1,
                      fontSize: '1rem',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 5px 15px rgba(76, 236, 196, 0.4)'
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grow>
          ) : (
            displayDates.map((date, index) => (
              <Slide direction="up" in timeout={500 + index * 100} key={date}>
                <Paper
                  sx={{
                    mb: 4,
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 4,
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: isSearchActive
                        ? 'linear-gradient(90deg, #FF8A80, #4ECDC4, #667eea)'
                        : 'linear-gradient(90deg, #4ECDC4, #667eea, #764ba2)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 'bold',
                          color: '#fff',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          mb: 1,
                        }}
                      >
                        {formatDateHeader(date)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<TrophyIcon />}
                          label={`${displayProblems[date].length} problem${displayProblems[date].length !== 1 ? 's' : ''} ${isSearchActive ? 'found' : 'conquered'}`}
                          sx={{
                            background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                            color: '#fff',
                            fontWeight: 'bold',
                          }}
                        />

                        {selectedPlatform !== 'all' && (
                          <Chip
                            label={selectedPlatform}
                            size="small"
                            sx={{
                              background: 'rgba(102, 126, 234, 0.2)',
                              color: '#667eea',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                            }}
                          />
                        )}

                        {isSearchActive && (
                          <Chip
                            icon={<SearchIcon />}
                            label="Search Results"
                            size="small"
                            sx={{
                              background: 'rgba(255, 138, 128, 0.2)',
                              color: '#FF8A80',
                              border: '1px solid rgba(255, 138, 128, 0.3)',
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        px: 3,
                        py: 1,
                        background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                        borderRadius: 20,
                        fontWeight: 'bold',
                        color: '#fff',
                        animation: `${pulse} 3s ease-in-out infinite`,
                      }}
                    >
                      +{displayProblems[date].length * 10} XP
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                  {/* Grid/List View Toggle */}
                  {viewMode === 'grid' ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 2 }}>
                      {displayProblems[date].map((problem, problemIndex) => (
                        <Grow in timeout={800 + problemIndex * 100} key={problem._id}>
                          <Box>
                            <ProblemCard
                              problem={problem}
                              onDelete={handleDeleteProblem}
                            />
                          </Box>
                        </Grow>
                      ))}
                    </Box>
                  ) : (
                    displayProblems[date].map((problem, problemIndex) => (
                      <Grow in timeout={800 + problemIndex * 100} key={problem._id}>
                        <Box sx={{ mb: problemIndex < displayProblems[date].length - 1 ? 2 : 0 }}>
                          <ProblemCard
                            problem={problem}
                            onDelete={handleDeleteProblem}
                          />
                        </Box>
                      </Grow>
                    ))
                  )}
                </Paper>
              </Slide>
            ))
          )}
        </Box>

        {/* Enhanced Add Problem FAB */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: isMobile ? 16 : 32,
            width: 70,
            height: 70,
            background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
            boxShadow: '0 8px 32px rgba(76, 236, 196, 0.4)',
            border: '2px solid rgba(76, 236, 196, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #26C6DA 30%, #4ECDC4 90%)',
              transform: 'scale(1.15)',
              boxShadow: '0 12px 40px rgba(76, 236, 196, 0.6)',
              border: '2px solid rgba(76, 236, 196, 0.5)',
            },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: `${pulse} 4s ease-in-out infinite`,
            zIndex: 999,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: 'linear-gradient(45deg, #4ECDC4, #667eea, #764ba2)',
              borderRadius: '50%',
              zIndex: -1,
              animation: `${rotate} 3s linear infinite`,
            },
          }}
          onClick={() => setAddFormOpen(true)}
        >
          <AddIcon sx={{ fontSize: 36 }} />
        </Fab>

        {/* Forms and Dialogs */}
        <AddProblemForm
          open={addFormOpen}
          onClose={() => setAddFormOpen(false)}
          onSubmit={handleAddProblem}
        />

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              borderRadius: 3,
              backdropFilter: 'blur(20px)',
              background: snackbar.severity === 'success'
                ? 'linear-gradient(45deg, rgba(76, 175, 80, 0.9), rgba(139, 195, 74, 0.9))'
                : snackbar.severity === 'info'
                  ? 'linear-gradient(45deg, rgba(33, 150, 243, 0.9), rgba(63, 81, 181, 0.9))'
                  : 'linear-gradient(45deg, rgba(244, 67, 54, 0.9), rgba(255, 87, 34, 0.9))',
              color: '#fff',
              fontWeight: 'bold',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>

      {/* Enhanced Footer */}
      <Box
        component="footer"
        sx={{
          position: 'relative',
          mt: 8,
          py: 8,
          background: `
            linear-gradient(135deg, 
              rgba(26, 26, 46, 0.9) 0%, 
              rgba(22, 33, 62, 0.9) 25%, 
              rgba(15, 52, 96, 0.9) 50%, 
              rgba(26, 26, 46, 0.9) 100%
            )
          `,
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                    boxShadow: '0 8px 32px rgba(76, 236, 196, 0.3)',
                    border: '2px solid rgba(76, 236, 196, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(10deg)',
                      boxShadow: '0 12px 40px rgba(76, 236, 196, 0.4)',
                    }
                  }}
                >
                  <CodeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 50%, #764ba2 70%)',
                      backgroundSize: '200% 200%',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${gradientMove} 4s ease infinite`,
                      mb: 1,
                    }}
                  >
                    GrindLog Pro
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontStyle: 'italic',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Professional Coding Journey Tracker
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Chip
                      label={`${problemCounts.all} Problems Solved`}
                      size="small"
                      sx={{
                        background: 'rgba(76, 236, 196, 0.2)',
                        color: '#4ECDC4',
                        border: '1px solid rgba(76, 236, 196, 0.3)',
                      }}
                    />
                    <Chip
                      label={`${calculateStreak()} Day Streak`}
                      size="small"
                      sx={{
                        background: 'rgba(255, 138, 128, 0.2)',
                        color: '#FF8A80',
                        border: '1px solid rgba(255, 138, 128, 0.3)',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '300px', textAlign: isMobile ? 'center' : 'right' }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#4ECDC4',
                  fontWeight: 'bold',
                  mb: 2,
                  animation: `${fadeInUp} 1s ease-out`,
                }}
              >
                Excellence Through Consistency ✨
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
                  maxWidth: '400px',
                  ml: isMobile ? 0 : 'auto',
                  animation: `${fadeInUp} 1s ease-out 0.2s both`,
                }}
              >
                "The journey of a thousand miles begins with a single step."
                Every problem solved is a step toward mastery. 🎯
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  justifyContent: isMobile ? 'center' : 'flex-end',
                  px: 3,
                  py: 1.5,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  animation: `${fadeInUp} 1s ease-out 0.4s both`,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '500',
                  }}
                >
                  Crafted with
                </Typography>
                <Box
                  sx={{
                    fontSize: 20,
                    animation: `${pulse} 2s ease-in-out infinite`,
                    filter: 'drop-shadow(0 0 8px rgba(255, 105, 180, 0.6))'
                  }}
                >
                  ❤️
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '500',
                  }}
                >
                  for elite developers
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 3,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: '600',
                background: 'linear-gradient(45deg, rgba(76, 236, 196, 0.6), rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6))',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientMove} 5s ease infinite`,
              }}
            >
              Professional • Efficient • Results-Driven • Excellence
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontStyle: 'italic',
                fontWeight: '300',
                maxWidth: '400px',
                lineHeight: 1.5
              }}
            >
              © 2024 GrindLog Professional. Empowering developers to achieve coding excellence. 🚀
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;