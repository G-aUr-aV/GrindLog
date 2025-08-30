import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Button,
  ButtonGroup,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Grow,
  Slide,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  Grid,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Whatshot as FireIcon,
  Stars as StarsIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Insights as InsightsIcon,
  LocalFireDepartment as StreakIcon,
  DateRange as DateRangeIcon,
  AutoGraph as AutoGraphIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  WorkspacePremium as PremiumIcon,
  Rocket as RocketIcon,
  FlashOn as BoltIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  TimerOutlined as TimerIcon,
  WbSunny as MorningIcon,
  Brightness3 as NightIcon,
  Weekend as WeekendIcon,
  BusinessCenter as WeekdayIcon,
} from '@mui/icons-material';
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subWeeks,
  subMonths,
  subYears,
  isToday,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  getHours,
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  isWeekend,
  getDay,
  min,
} from 'date-fns';
import { keyframes } from '@mui/system';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ComposedChart,
  Legend,
  RadialBarChart,
  RadialBar,
  Scatter,
  ScatterChart,
} from 'recharts';

// Custom hooks
import { useProblems } from '../hooks/useProblems';

// Components
import SendDigestButton from '../components/SendDigestButton';

// Types
import { Problem } from '../types/Problem';

// Enhanced Types
type ViewMode = 'day' | 'week' | 'month' | 'year';
type TimeRange = '3m' | '6m' | '1y' | 'all';
type ChartType = 'line' | 'area' | 'bar';

interface EnhancedAnalyticsMetrics {
  totalProblems: number;
  currentStreak: number;
  bestStreak: number;
  averagePerDay: number;
  thisMonth: number;
  lastMonth: number;
  activeWeeks: number;
  totalDays: number;
  // Period-specific metrics
  currentPeriodProblems: number;
  previousPeriodProblems: number;
  periodChange: number;
  peakProductivityHour?: number;
  peakProductivityDay?: string;
  weekdayAverage: number;
  weekendAverage: number;
  morningProblems: number;
  afternoonProblems: number;
  eveningProblems: number;
  nightProblems: number;
}

interface PeriodData {
  label: string;
  problems: number;
  date: string;
  cumulative?: number;
  hour?: number;
  dayOfWeek?: number;
  isToday?: boolean;
  isWeekend?: boolean;
}

interface ProductivityPattern {
  bestHour: number;
  bestDay: string;
  bestDayOfWeek: number;
  worstHour: number;
  worstDay: string;
  consistencyScore: number;
  weekdayVsWeekend: 'weekday' | 'weekend' | 'balanced';
  morningVsEvening: 'morning' | 'evening' | 'balanced';
}

interface SmartInsight {
  type: 'success' | 'warning' | 'info' | 'tip' | 'achievement' | 'pattern';
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  priority: number;
  category: 'performance' | 'streak' | 'productivity' | 'goal' | 'pattern' | 'achievement';
  timeframe: ViewMode;
}

// Animations (keeping your existing ones)
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 236, 196, 0.3); }
  50% { box-shadow: 0 0 30px rgba(76, 236, 196, 0.5), 0 0 40px rgba(102, 126, 234, 0.3); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const gradientMove = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -15px, 0); }
  70% { transform: translate3d(0, -7px, 0); }
  90% { transform: translate3d(0, -2px, 0); }
`;

// Platform colors (keeping your existing ones)
const PLATFORM_COLORS = {
  LeetCode: '#FFA116',
  Codeforces: '#FF6B6B',
  HackerRank: '#00EA64',
  CodeChef: '#8B4513',
  AtCoder: '#3F51B5',
  TopCoder: '#FF9800',
  SPOJ: '#9C27B0',
  GeeksforGeeks: '#4CAF50',
  InterviewBit: '#2196F3',
  CSES: '#3F51B5',
  Other: '#9E9E9E',
};

// Time period colors
const PERIOD_COLORS = {
  day: '#4ECDC4',
  week: '#667eea',
  month: '#764ba2',
  year: '#FF8A80',
};

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Custom hooks
  const {
    allProblems,
    loading,
    calculateStreak,
    fetchProblems,
  } = useProblems();

  // Enhanced State Management
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentPeriod, setCurrentPeriod] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [showPatterns, setShowPatterns] = useState(false);
  const [animatedMetrics, setAnimatedMetrics] = useState<EnhancedAnalyticsMetrics>({
    totalProblems: 0,
    currentStreak: 0,
    bestStreak: 0,
    averagePerDay: 0,
    thisMonth: 0,
    lastMonth: 0,
    activeWeeks: 0,
    totalDays: 0,
    currentPeriodProblems: 0,
    previousPeriodProblems: 0,
    periodChange: 0,
    weekdayAverage: 0,
    weekendAverage: 0,
    morningProblems: 0,
    afternoonProblems: 0,
    eveningProblems: 0,
    nightProblems: 0,
  });

  // Navigation Handlers
  const handlePreviousPeriod = () => {
    setCurrentPeriod(prev => {
      switch (viewMode) {
        case 'day': return subDays(prev, 1);
        case 'week': return subWeeks(prev, 1);
        case 'month': return subMonths(prev, 1);
        case 'year': return subYears(prev, 1);
        default: return prev;
      }
    });
  };

  const handleNextPeriod = () => {
    setCurrentPeriod(prev => {
      switch (viewMode) {
        case 'day': return addDays(prev, 1);
        case 'week': return addWeeks(prev, 1);
        case 'month': return addMonths(prev, 1);
        case 'year': return addYears(prev, 1);
        default: return prev;
      }
    });
  };

  const handleJumpToToday = () => {
    setCurrentPeriod(new Date());
  };

  const getCurrentPeriodLabel = () => {
    switch (viewMode) {
      case 'day': return format(currentPeriod, 'EEEE, MMM dd, yyyy');
      case 'week': return `Week of ${format(startOfWeek(currentPeriod), 'MMM dd')} - ${format(endOfWeek(currentPeriod), 'MMM dd, yyyy')}`;
      case 'month': return format(currentPeriod, 'MMMM yyyy');
      case 'year': return format(currentPeriod, 'yyyy');
      default: return '';
    }
  };

  const isCurrentPeriod = () => {
    const now = new Date();
    switch (viewMode) {
      case 'day': return isSameDay(currentPeriod, now);
      case 'week': return isSameWeek(currentPeriod, now);
      case 'month': return isSameMonth(currentPeriod, now);
      case 'year': return isSameYear(currentPeriod, now);
      default: return false;
    }
  };

  // Safe navigation function
  const handleBackToHome = () => {
    try {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.log('Navigating to home page...');
      window.location.href = '/';
    }
  };

  // Enhanced export function
  const handleExportData = () => {
    try {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          viewMode,
          currentPeriod: currentPeriod.toISOString(),
          periodLabel: getCurrentPeriodLabel(),
        },
        metrics: enhancedAnalytics.metrics,
        periodData: enhancedAnalytics.periodData,
        platformData: enhancedAnalytics.platformData,
        insights: enhancedAnalytics.insights.map(insight => ({
          type: insight.type,
          title: insight.title,
          description: insight.description,
          action: insight.action,
          category: insight.category,
          timeframe: insight.timeframe,
        })),
        patterns: enhancedAnalytics.patterns,
        totalProblems: Object.keys(allProblems).reduce((total, date) => total + allProblems[date].length, 0),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `grindlog-analytics-${viewMode}-${format(currentPeriod, 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Enhanced Analytics Calculator
  const enhancedAnalytics = useMemo(() => {
    const allProblemsFlat = Object.values(allProblems).flat();
    const dates = Object.keys(allProblems).sort();

    if (dates.length === 0) {
      return {
        metrics: {
          totalProblems: 0,
          currentStreak: 0,
          bestStreak: 0,
          averagePerDay: 0,
          thisMonth: 0,
          lastMonth: 0,
          activeWeeks: 0,
          totalDays: 0,
          currentPeriodProblems: 0,
          previousPeriodProblems: 0,
          periodChange: 0,
          weekdayAverage: 0,
          weekendAverage: 0,
          morningProblems: 0,
          afternoonProblems: 0,
          eveningProblems: 0,
          nightProblems: 0,
        },
        periodData: [],
        platformData: [],
        heatmapData: [],
        insights: [],
        patterns: null,
      };
    }

    // Basic metrics calculation (keeping your existing logic)
    const totalProblems = allProblemsFlat.length;
    const currentStreak = calculateStreak();

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    const sortedDates = dates.sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currentDate = new Date(sortedDates[i]);
        const daysDiff = differenceInDays(currentDate, prevDate);

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    // Time-based metrics
    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subDays(startOfThisMonth, 1));
    const endOfLastMonth = endOfMonth(subDays(startOfThisMonth, 1));

    const thisMonth = Object.entries(allProblems)
      .filter(([date]) => new Date(date) >= startOfThisMonth)
      .reduce((sum, [, problems]) => sum + problems.length, 0);

    const lastMonth = Object.entries(allProblems)
      .filter(([date]) => {
        const d = new Date(date);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      })
      .reduce((sum, [, problems]) => sum + problems.length, 0);

    const getPeriodBounds = () => {
      switch (viewMode) {
        case 'day':
          return {
            start: startOfDay(currentPeriod),
            end: endOfDay(currentPeriod),
            prevStart: startOfDay(subDays(currentPeriod, 1)),
            prevEnd: endOfDay(subDays(currentPeriod, 1)),
          };
        case 'week':
          const weekStart = startOfWeek(currentPeriod);
          const weekEnd = endOfWeek(currentPeriod);
          return {
            start: weekStart,
            end: weekEnd,
            prevStart: startOfWeek(subWeeks(currentPeriod, 1)),
            prevEnd: endOfWeek(subWeeks(currentPeriod, 1)),
          };
        case 'month':
          return {
            start: startOfMonth(currentPeriod),
            end: endOfMonth(currentPeriod),
            prevStart: startOfMonth(subMonths(currentPeriod, 1)),
            prevEnd: endOfMonth(subMonths(currentPeriod, 1)),
          };
        case 'year':
          return {
            start: startOfYear(currentPeriod),
            end: endOfYear(currentPeriod),
            prevStart: startOfYear(subYears(currentPeriod, 1)),
            prevEnd: endOfYear(subYears(currentPeriod, 1)),
          };
        default:
          return { start: now, end: now, prevStart: now, prevEnd: now };
      }
    };


    const { start, end, prevStart, prevEnd } = getPeriodBounds();

    const currentPeriodProblems = Object.entries(allProblems)
      .filter(([date]) => {
        const d = new Date(date);
        return d >= start && d <= end;
      })
      .reduce((sum, [, problems]) => sum + problems.length, 0);

    const previousPeriodProblems = Object.entries(allProblems)
      .filter(([date]) => {
        const d = new Date(date);
        return d >= prevStart && d <= prevEnd;
      })
      .reduce((sum, [, problems]) => sum + problems.length, 0);

    const periodChange = previousPeriodProblems > 0
      ? ((currentPeriodProblems - previousPeriodProblems) / previousPeriodProblems) * 100
      : 0;

    const firstDate = new Date(sortedDates[0]);
    const daysSinceStart = differenceInDays(now, firstDate) + 1;
    const effectiveStart = start > firstDate ? start : firstDate;
    const effectiveEnd = now < end ? now : end;
    const daysInPeriod = differenceInDays(effectiveEnd, effectiveStart) + 1;
    const averagePerDay = currentPeriodProblems / daysInPeriod;

    const activeWeeks = Math.ceil(dates.length / 7);
    const totalDays = dates.length;

    // Enhanced Period-Specific Calculations

    // Productivity Pattern Analysis
    const timePatterns = allProblemsFlat.reduce((acc, problem) => {
      if (problem.timestamp) {
        const hour = getHours(new Date(problem.timestamp));
        const dayOfWeek = getDay(new Date(problem.timestamp));
        const isWeekendDay = isWeekend(new Date(problem.timestamp));

        acc.hourly[hour] = (acc.hourly[hour] || 0) + 1;
        acc.daily[dayOfWeek] = (acc.daily[dayOfWeek] || 0) + 1;

        if (isWeekendDay) {
          acc.weekend += 1;
        } else {
          acc.weekday += 1;
        }

        // Time of day categorization
        if (hour >= 6 && hour < 12) acc.morning += 1;
        else if (hour >= 12 && hour < 18) acc.afternoon += 1;
        else if (hour >= 18 && hour < 24) acc.evening += 1;
        else acc.night += 1;
      }
      return acc;
    }, {
      hourly: {} as { [key: number]: number },
      daily: {} as { [key: number]: number },
      weekday: 0,
      weekend: 0,
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    });

    const weekdayAverage = timePatterns.weekday / Math.max(1, dates.filter(date => !isWeekend(new Date(date))).length);
    const weekendAverage = timePatterns.weekend / Math.max(1, dates.filter(date => isWeekend(new Date(date))).length);

    // Find peak productivity patterns
    const peakProductivityHour = Object.entries(timePatterns.hourly)
      .reduce((max, [hour, count]) =>
        count > (timePatterns.hourly[max] || 0) ? parseInt(hour) : max, 0);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakProductivityDay = dayNames[
      Object.entries(timePatterns.daily)
        .reduce((max, [day, count]) =>
          count > (timePatterns.daily[max] || 0) ? parseInt(day) : max, 0)
    ];

    // Generate period-specific data
    const generatePeriodData = (): PeriodData[] => {
      const data: PeriodData[] = [];

      switch (viewMode) {
        case 'day':
          // Hourly breakdown for the selected day
          const dayHours = eachHourOfInterval({ start, end });
          dayHours.forEach(hour => {
            const hourKey = format(hour, 'yyyy-MM-dd HH');
            const problemsInHour = allProblemsFlat.filter(problem =>
              problem.timestamp && format(new Date(problem.timestamp), 'yyyy-MM-dd HH') === hourKey
            ).length;

            data.push({
              label: format(hour, 'ha'),
              problems: problemsInHour,
              date: format(hour, 'yyyy-MM-dd HH:mm'),
              hour: getHours(hour),
              isToday: isSameDay(hour, now),
            });
          });
          break;

        case 'week':
          // Daily breakdown for the selected week
          const weekDays = eachDayOfInterval({ start, end });
          weekDays.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const problemsInDay = allProblems[dayKey]?.length || 0;

            data.push({
              label: format(day, 'EEE dd'),
              problems: problemsInDay,
              date: dayKey,
              dayOfWeek: getDay(day),
              isToday: isSameDay(day, now),
              isWeekend: isWeekend(day),
            });
          });
          break;

        case 'month':
          // Daily breakdown for the selected month
          const monthDays = eachDayOfInterval({ start, end });
          monthDays.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const problemsInDay = allProblems[dayKey]?.length || 0;

            data.push({
              label: format(day, 'dd'),
              problems: problemsInDay,
              date: dayKey,
              isToday: isSameDay(day, now),
              isWeekend: isWeekend(day),
            });
          });
          break;

        case 'year':
          // Monthly breakdown for the selected year
          const yearMonths = eachMonthOfInterval({ start, end });
          let cumulative = 0;
          yearMonths.forEach(month => {
            const monthKey = format(month, 'yyyy-MM');
            const problemsInMonth = Object.entries(allProblems)
              .filter(([date]) => date.startsWith(monthKey))
              .reduce((sum, [, problems]) => sum + problems.length, 0);

            cumulative += problemsInMonth;
            data.push({
              label: format(month, 'MMM'),
              problems: problemsInMonth,
              date: format(month, 'yyyy-MM-dd'),
              cumulative,
            });
          });
          break;
      }

      return data;
    };

    const periodData = generatePeriodData();

    // Platform distribution (keeping your existing logic)
    const platformCounts: { [key: string]: number } = {};
    allProblemsFlat.forEach(problem => {
      const platform = problem.platform || 'Other';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    const platformData = Object.entries(platformCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / totalProblems) * 100,
        color: PLATFORM_COLORS[name as keyof typeof PLATFORM_COLORS] || '#9E9E9E',
      }))
      .sort((a, b) => b.value - a.value);

    // Heatmap data (keeping your existing logic but enhanced)
    const heatmapData: { date: string; count: number; level: number }[] = [];
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const allDaysThisYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

    allDaysThisYear.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const count = allProblems[dateKey]?.length || 0;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 8 ? 3 : 4;

      heatmapData.push({
        date: dateKey,
        count,
        level,
      });
    });

    // Enhanced AI-Powered Insights
    const generateSmartInsights = (): SmartInsight[] => {
      const insights: SmartInsight[] = [];

      // Period-specific insights
      if (viewMode === 'day') {
        if (currentPeriodProblems > 0) {
          const todayHour = getHours(now);
          const currentHourProblems = periodData.find(d => d.hour === todayHour)?.problems || 0;

          if (isCurrentPeriod() && currentHourProblems > 0) {
            insights.push({
              type: 'success',
              title: 'Active Right Now! 🚀',
              description: `Great work! You've solved ${currentHourProblems} problem${currentHourProblems > 1 ? 's' : ''} this hour. Keep the momentum going!`,
              icon: <BoltIcon />,
              action: 'Continue Coding',
              priority: 10,
              category: 'performance',
              timeframe: 'day',
            });
          }

          if (peakProductivityHour && peakProductivityHour === todayHour) {
            insights.push({
              type: 'pattern',
              title: 'Peak Performance Time! ⏰',
              description: `This is historically your most productive hour (${format(new Date().setHours(peakProductivityHour), 'ha')}). You typically solve ${Math.round(timePatterns.hourly[peakProductivityHour] / dates.length * 7)} problems per week at this time.`,
              icon: <ScheduleIcon />,
              action: 'Maximize Focus',
              priority: 8,
              category: 'pattern',
              timeframe: 'day',
            });
          }
        }

        if (periodChange > 0) {
          insights.push({
            type: 'success',
            title: 'Daily Improvement! 📈',
            description: `Amazing! You solved ${periodChange.toFixed(0)}% more problems than yesterday. This kind of consistent growth leads to mastery.`,
            icon: <TrendingUpIcon />,
            action: 'Maintain Pace',
            priority: 7,
            category: 'performance',
            timeframe: 'day',
          });
        }
      }

      if (viewMode === 'week') {
        const weekdayProblems = periodData.filter(d => !d.isWeekend).reduce((sum, d) => sum + d.problems, 0);
        const weekendProblems = periodData.filter(d => d.isWeekend).reduce((sum, d) => sum + d.problems, 0);

        if (weekdayProblems > weekendProblems * 2) {
          insights.push({
            type: 'pattern',
            title: 'Weekday Warrior! 💼',
            description: `You're ${Math.round((weekdayProblems / (weekendProblems || 1)) * 100)}% more productive on weekdays. Consider maintaining light practice on weekends to keep momentum.`,
            icon: <WeekdayIcon />,
            action: 'Weekend Planning',
            priority: 6,
            category: 'pattern',
            timeframe: 'week',
          });
        } else if (weekendProblems > weekdayProblems) {
          insights.push({
            type: 'pattern',
            title: 'Weekend Focus! 🏖️',
            description: `Interesting! You solve more problems on weekends. This suggests you have focused weekend coding sessions. Great dedication!`,
            icon: <WeekendIcon />,
            action: 'Weekday Boost',
            priority: 6,
            category: 'pattern',
            timeframe: 'week',
          });
        }

        if (periodChange > 20) {
          insights.push({
            type: 'achievement',
            title: 'Weekly Surge! 🎯',
            description: `Incredible ${periodChange.toFixed(0)}% improvement from last week! You're building serious momentum. This rate puts you in the top 10% of consistent learners.`,
            icon: <RocketIcon />,
            action: 'Set Higher Goals',
            priority: 9,
            category: 'performance',
            timeframe: 'week',
          });
        }
      }

      if (viewMode === 'month') {
        const monthProgress = (new Date().getDate() / new Date(currentPeriod.getFullYear(), currentPeriod.getMonth() + 1, 0).getDate()) * 100;
        const projectedMonthlyTotal = currentPeriodProblems / (monthProgress / 100);

        if (projectedMonthlyTotal > previousPeriodProblems * 1.2) {
          insights.push({
            type: 'success',
            title: 'Monthly Projection Excellent! 📊',
            description: `At your current pace, you'll solve ~${Math.round(projectedMonthlyTotal)} problems this month, which is ${Math.round(((projectedMonthlyTotal - previousPeriodProblems) / previousPeriodProblems) * 100)}% better than last month!`,
            icon: <TrendingUpIcon />,
            action: 'Maintain Velocity',
            priority: 8,
            category: 'goal',
            timeframe: 'month',
          });
        }

        // Mid-month motivation
        if (monthProgress > 40 && monthProgress < 60 && currentPeriodProblems < previousPeriodProblems * 0.5) {
          insights.push({
            type: 'warning',
            title: 'Mid-Month Push Needed! 💪',
            description: `You're halfway through the month but at ${Math.round((currentPeriodProblems / previousPeriodProblems) * 100)}% of last month's pace. The second half is crucial for monthly goals!`,
            icon: <TimerIcon />,
            action: 'Accelerate Now',
            priority: 7,
            category: 'goal',
            timeframe: 'month',
          });
        }
      }

      if (viewMode === 'year') {
        const yearProgress = (differenceInDays(new Date(), startOfYear(new Date())) + 1) / (differenceInDays(endOfYear(new Date()), startOfYear(new Date())) + 1) * 100;
        const projectedYearlyTotal = currentPeriodProblems / (yearProgress / 100);

        if (projectedYearlyTotal >= 365) {
          insights.push({
            type: 'achievement',
            title: 'Yearly Goal Excellence! 🏆',
            description: `Outstanding! You're on track to solve ${Math.round(projectedYearlyTotal)} problems this year - that's more than one per day! This puts you in elite territory.`,
            icon: <TrophyIcon />,
            action: 'Aim for 500+',
            priority: 10,
            category: 'achievement',
            timeframe: 'year',
          });
        }

        const bestQuarter = Math.max(
          periodData.slice(0, 3).reduce((sum, d) => sum + d.problems, 0),
          periodData.slice(3, 6).reduce((sum, d) => sum + d.problems, 0),
          periodData.slice(6, 9).reduce((sum, d) => sum + d.problems, 0),
          periodData.slice(9, 12).reduce((sum, d) => sum + d.problems, 0)
        );

        insights.push({
          type: 'pattern',
          title: 'Seasonal Performance Pattern! 📅',
          description: `Your strongest quarter shows ${bestQuarter} problems solved. Identifying your peak seasons helps with goal planning and expectation setting.`,
          icon: <AssessmentIcon />,
          action: 'Plan Seasonally',
          priority: 5,
          category: 'pattern',
          timeframe: 'year',
        });
      }

      // Universal insights (adapted to timeframe)
      if (currentStreak >= 7) {
        insights.push({
          type: 'success',
          title: `${currentStreak}-Day Streak Fire! 🔥`,
          description: `Your consistency is remarkable! A ${currentStreak}-day streak shows true dedication. Research shows it takes 21 days to form a habit - you're ${Math.round((currentStreak / 21) * 100)}% there!`,
          icon: <StreakIcon />,
          action: 'Protect Streak',
          priority: 9,
          category: 'streak',
          timeframe: viewMode,
        });
      }

      // Productivity pattern insights
      if (timePatterns.morning > timePatterns.evening * 1.5) {
        insights.push({
          type: 'pattern',
          title: 'Morning Productivity Champion! 🌅',
          description: `You solve ${Math.round((timePatterns.morning / (timePatterns.morning + timePatterns.evening)) * 100)}% more problems in the morning. Your brain is freshest early - leverage this!`,
          icon: <MorningIcon />,
          action: 'Morning Scheduling',
          priority: 6,
          category: 'pattern',
          timeframe: viewMode,
        });
      } else if (timePatterns.evening > timePatterns.morning * 1.5) {
        insights.push({
          type: 'pattern',
          title: 'Night Owl Excellence! 🌙',
          description: `You're ${Math.round((timePatterns.evening / (timePatterns.morning + timePatterns.evening)) * 100)}% more productive in the evening. Night sessions seem to work well for you!`,
          icon: <NightIcon />,
          action: 'Evening Optimization',
          priority: 6,
          category: 'pattern',
          timeframe: viewMode,
        });
      }

      // Platform diversity insights
      const dominantPlatform = platformData[0];
      if (dominantPlatform && dominantPlatform.percentage > 80) {
        insights.push({
          type: 'tip',
          title: 'Platform Diversification Opportunity! 🌐',
          description: `${dominantPlatform.percentage.toFixed(0)}% of your problems are from ${dominantPlatform.name}. While specialization is great, exploring other platforms can broaden your problem-solving toolkit.`,
          icon: <SchoolIcon />,
          action: 'Try New Platform',
          priority: 4,
          category: 'goal',
          timeframe: viewMode,
        });
      }

      // Sort by priority and limit based on timeframe
      return insights
        .sort((a, b) => b.priority - a.priority)
        .slice(0, viewMode === 'day' ? 4 : viewMode === 'week' ? 5 : 6);
    };

    const insights = generateSmartInsights();

    // Productivity patterns analysis
    const patterns: ProductivityPattern = {
      bestHour: peakProductivityHour,
      bestDay: peakProductivityDay,
      bestDayOfWeek: Object.entries(timePatterns.daily)
        .reduce((max, [day, count]) =>
          count > (timePatterns.daily[max] || 0) ? parseInt(day) : max, 0),
      worstHour: Object.entries(timePatterns.hourly)
        .reduce((min, [hour, count]) =>
          count < (timePatterns.hourly[min] || Infinity) ? parseInt(hour) : min, 23),
      worstDay: 'Sunday', // Placeholder
      consistencyScore: Math.min(100, (dates.length / daysSinceStart) * 100),
      weekdayVsWeekend: weekdayAverage > weekendAverage * 1.2 ? 'weekday' :
        weekendAverage > weekdayAverage * 1.2 ? 'weekend' : 'balanced',
      morningVsEvening: timePatterns.morning > timePatterns.evening * 1.2 ? 'morning' :
        timePatterns.evening > timePatterns.morning * 1.2 ? 'evening' : 'balanced',
    };

    const metrics: EnhancedAnalyticsMetrics = {
      totalProblems,
      currentStreak,
      bestStreak,
      averagePerDay,
      thisMonth,
      lastMonth,
      activeWeeks,
      totalDays,
      currentPeriodProblems,
      previousPeriodProblems,
      periodChange,
      peakProductivityHour,
      peakProductivityDay,
      weekdayAverage,
      weekendAverage,
      morningProblems: timePatterns.morning,
      afternoonProblems: timePatterns.afternoon,
      eveningProblems: timePatterns.evening,
      nightProblems: timePatterns.night,
    };

    return {
      metrics,
      periodData,
      platformData,
      heatmapData,
      insights,
      patterns,
    };
  }, [allProblems, viewMode, currentPeriod, calculateStreak]);

  // Animate metrics on change
  useEffect(() => {
    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = start + (end - start) * progress;
        callback(typeof end === 'number' && end % 1 !== 0 ? parseFloat(value.toFixed(1)) : Math.floor(value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    };

    const metrics = enhancedAnalytics.metrics;
    const delays = [300, 500, 700, 900, 1100, 1300, 1500, 1700];

    Object.entries(metrics).forEach(([key, value], index) => {
      if (typeof value === 'number') {
        setTimeout(() => {
          animateValue(0, value, 1000 + index * 100, (animatedValue) =>
            setAnimatedMetrics(prev => ({ ...prev, [key]: animatedValue }))
          );
        }, delays[index % delays.length]);
      }
    });
  }, [enhancedAnalytics.metrics, viewMode, currentPeriod]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Typography variant="body2" sx={{ color: '#fff', mb: 1, fontWeight: 'bold' }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color, fontWeight: 'bold' }}
            >
              {entry.name}: {entry.value} {entry.name.toLowerCase().includes('problem') ? 'problems' : ''}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
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
          }}
        />

        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 4,
            maxWidth: '400px',
            animation: `${scaleIn} 0.8s ease-out`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ fontSize: '4rem', mb: 3, animation: `${pulse} 1.5s infinite` }}>
            📊
          </Box>
          <Typography variant="h4" sx={{ color: '#4ECDC4', fontWeight: 'bold', mb: 2 }}>
            Analyzing Your Journey...
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
            Crunching numbers and generating insights from your coding achievements
          </Typography>
          <LinearProgress
            sx={{
              height: 8,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 90%)',
                borderRadius: 4,
              }
            }}
          />
        </Paper>
      </Box>
    );
  }

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

      {/* Enhanced Navigation Bar */}
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
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                animation: `${float} 3s ease-in-out infinite`,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 70%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: -0.5,
                }}
              >
                Advanced Analytics
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
                {getCurrentPeriodLabel()} • {viewMode.toUpperCase()} VIEW
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Back to Dashboard">
              <Button
                onClick={handleBackToHome}
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderColor: 'rgba(76, 236, 196, 0.3)',
                  color: '#4ECDC4',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(76, 236, 196, 0.3)',
                  '&:hover': {
                    borderColor: '#4ECDC4',
                    background: 'rgba(76, 236, 196, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                Dashboard
              </Button>
            </Tooltip>

            <Tooltip title="Refresh Analytics">
              <IconButton
                onClick={fetchProblems}
                sx={{
                  width: 48,
                  height: 48,
                  background: 'rgba(76, 236, 196, 0.1)',
                  border: '1px solid rgba(76, 236, 196, 0.3)',
                  color: '#4ECDC4',
                  '&:hover': {
                    background: 'rgba(76, 236, 196, 0.2)',
                    transform: 'rotate(180deg) scale(1.05)',
                  },
                  transition: 'all 0.5s ease',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Analytics Data">
              <IconButton
                onClick={handleExportData}
                sx={{
                  width: 48,
                  height: 48,
                  background: 'rgba(255, 138, 128, 0.1)',
                  border: '1px solid rgba(255, 138, 128, 0.3)',
                  color: '#FF8A80',
                  '&:hover': {
                    background: 'rgba(255, 138, 128, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <SendDigestButton />
            </Box>
              
            {isMobile && (
              <Tooltip title="Back">
                <IconButton
                  onClick={handleBackToHome}
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
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: 4, pb: 8, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Breadcrumb */}
        <Fade in timeout={500}>
          <Paper
            sx={{
              p: 2,
              mb: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
            }}
          >
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.4)' }} />}
              sx={{ color: 'rgba(255,255,255,0.8)' }}
            >
              <Link
                onClick={handleBackToHome}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#4ECDC4',
                    transform: 'translateX(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <HomeIcon fontSize="small" />
                GrindLog Dashboard
              </Link>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon fontSize="small" sx={{ color: '#667eea' }} />
                <Typography sx={{ color: '#667eea', fontWeight: 'bold' }}>
                  Advanced Analytics
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: PERIOD_COLORS[viewMode],
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }}
                />
                <Typography sx={{ color: PERIOD_COLORS[viewMode], fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {viewMode} View
                </Typography>
              </Box>
            </Breadcrumbs>
          </Paper>
        </Fade>

        {/* Enhanced Header with Period Navigation */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 50%, #4ECDC4 70%)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientMove} 4s ease infinite`,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              📊 {getCurrentPeriodLabel()}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.8,
                fontWeight: 400,
                letterSpacing: '0.5px',
                mb: 4,
              }}
            >
              Deep dive into your {viewMode}ly performance with AI-powered insights
              and advanced analytics to optimize your coding journey. 🚀
            </Typography>

            {/* Enhanced Period Navigation Controls */}
            <Paper
              sx={{
                p: 3,
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Time Period Selection */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>
                    VIEW:
                  </Typography>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        color: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        px: 2,
                        py: 1,
                        fontWeight: 'bold',
                        '&.Mui-selected': {
                          background: `${PERIOD_COLORS[viewMode]}30`,
                          color: PERIOD_COLORS[viewMode],
                          border: `1px solid ${PERIOD_COLORS[viewMode]}50`,
                        },
                        '&:hover': {
                          background: 'rgba(255,255,255,0.1)',
                        }
                      }
                    }}
                  >
                    <ToggleButton value="day">
                      <TimeIcon sx={{ mr: 1, fontSize: 16 }} />
                      Day
                    </ToggleButton>
                    <ToggleButton value="week">
                      <DateRangeIcon sx={{ mr: 1, fontSize: 16 }} />
                      Week
                    </ToggleButton>
                    <ToggleButton value="month">
                      <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                      Month
                    </ToggleButton>
                    <ToggleButton value="year">
                      <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                      Year
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ background: 'rgba(255,255,255,0.2)' }} />

                {/* Period Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Tooltip title={`Previous ${viewMode}`}>
                    <IconButton
                      onClick={handlePreviousPeriod}
                      sx={{
                        width: 40,
                        height: 40,
                        background: 'rgba(76, 236, 196, 0.1)',
                        border: '1px solid rgba(76, 236, 196, 0.3)',
                        color: '#4ECDC4',
                        '&:hover': {
                          background: 'rgba(76, 236, 196, 0.2)',
                          transform: 'translateX(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ minWidth: { xs: '200px', md: '300px' }, textAlign: 'center' }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                      }}
                    >
                      {getCurrentPeriodLabel()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      {animatedMetrics.currentPeriodProblems} problems solved
                    </Typography>
                  </Box>

                  <Tooltip title={`Next ${viewMode}`}>
                    <IconButton
                      onClick={handleNextPeriod}
                      disabled={isCurrentPeriod()}
                      sx={{
                        width: 40,
                        height: 40,
                        background: isCurrentPeriod()
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(76, 236, 196, 0.1)',
                        border: isCurrentPeriod()
                          ? '1px solid rgba(255,255,255,0.1)'
                          : '1px solid rgba(76, 236, 196, 0.3)',
                        color: isCurrentPeriod()
                          ? 'rgba(255,255,255,0.3)'
                          : '#4ECDC4',
                        '&:hover': {
                          background: isCurrentPeriod()
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(76, 236, 196, 0.2)',
                          transform: isCurrentPeriod() ? 'none' : 'translateX(2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ background: 'rgba(255,255,255,0.2)' }} />

                {/* Jump to Today */}
                <Tooltip title="Jump to current period">
                  <Button
                    onClick={handleJumpToToday}
                    disabled={isCurrentPeriod()}
                    startIcon={<TodayIcon />}
                    sx={{
                      borderColor: isCurrentPeriod()
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(102, 126, 234, 0.3)',
                      color: isCurrentPeriod()
                        ? 'rgba(255,255,255,0.3)'
                        : '#667eea',
                      fontWeight: 'bold',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      border: isCurrentPeriod()
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        borderColor: isCurrentPeriod()
                          ? 'rgba(255,255,255,0.1)'
                          : '#667eea',
                        background: isCurrentPeriod()
                          ? 'transparent'
                          : 'rgba(102, 126, 234, 0.1)',
                        transform: isCurrentPeriod() ? 'none' : 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      fontSize: '0.8rem',
                    }}
                  >
                    Today
                  </Button>
                </Tooltip>
              </Box>
            </Paper>
          </Box>
        </Fade>

        {/* Enhanced Key Metrics */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 6 }}>
          {[
            {
              title: 'Current Period',
              value: animatedMetrics.currentPeriodProblems,
              subtitle: `This ${viewMode}`,
              icon: <AutoGraphIcon sx={{ fontSize: 32 }} />,
              color: PERIOD_COLORS[viewMode],
              bgGradient: `linear-gradient(135deg, ${PERIOD_COLORS[viewMode]}20, ${PERIOD_COLORS[viewMode]}05)`,
              borderColor: `${PERIOD_COLORS[viewMode]}40`,
              avatarGradient: `linear-gradient(45deg, ${PERIOD_COLORS[viewMode]} 30%, ${PERIOD_COLORS[viewMode]}CC 90%)`,
              delay: 1000,
              emoji: viewMode === 'day' ? '📅' : viewMode === 'week' ? '📊' : viewMode === 'month' ? '📈' : '🎯',
              change: animatedMetrics.periodChange,
              showChange: true,
            },
            {
              title: 'Total Problems',
              value: animatedMetrics.totalProblems,
              subtitle: 'Lifetime Achievement',
              icon: <TrophyIcon sx={{ fontSize: 32 }} />,
              color: '#4ECDC4',
              bgGradient: 'linear-gradient(135deg, rgba(76, 236, 196, 0.1), rgba(76, 236, 196, 0.05))',
              borderColor: 'rgba(76, 236, 196, 0.2)',
              avatarGradient: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
              delay: 1200,
              emoji: '🏆',
              showChange: false,
            },
            {
              title: 'Current Streak',
              value: animatedMetrics.currentStreak,
              subtitle: 'Days in a row',
              icon: <FireIcon sx={{ fontSize: 32 }} />,
              color: '#FF8A80',
              bgGradient: 'linear-gradient(135deg, rgba(255, 138, 128, 0.1), rgba(255, 87, 34, 0.05))',
              borderColor: 'rgba(255, 138, 128, 0.2)',
              avatarGradient: 'linear-gradient(45deg, #FF8A80 30%, #FF5722 90%)',
              delay: 1400,
              emoji: '🔥',
              showChange: false,
            },
            {
              title: 'Daily Average',
              value: animatedMetrics.averagePerDay.toFixed(1),
              subtitle: 'Problems per day',
              icon: <SpeedIcon sx={{ fontSize: 32 }} />,
              color: '#8BC34A',
              bgGradient: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1), rgba(76, 175, 80, 0.05))',
              borderColor: 'rgba(139, 195, 74, 0.2)',
              avatarGradient: 'linear-gradient(45deg, #8BC34A 30%, #4CAF50 90%)',
              delay: 1600,
              emoji: '⚡',
              showChange: false,
            },
          ].map((metric) => (
            <Grow key={metric.title} in timeout={metric.delay}>
              <Card
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 45%', lg: '1 1 22%' },
                  minWidth: '280px',
                  background: metric.bgGradient,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${metric.borderColor}`,
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 20px 50px ${metric.borderColor}`,
                    border: `2px solid ${metric.color}`,
                  },
                  '&::before': {
                    content: `"${metric.emoji}"`,
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    fontSize: '3rem',
                    opacity: 0.1,
                    transform: 'rotate(15deg)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: metric.avatarGradient,
                      mx: 'auto',
                      mb: 2,
                      animation: `${pulse} 3s ease-in-out infinite`,
                      boxShadow: `0 8px 25px ${metric.borderColor}`,
                    }}
                  >
                    {metric.icon}
                  </Avatar>
                  <Typography variant="h3" sx={{ color: metric.color, fontWeight: 'bold', mb: 1 }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', mb: 0.5 }}>
                    {metric.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                    {metric.subtitle}
                  </Typography>
                  {metric.showChange && metric.change !== undefined && metric.change !== 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        icon={metric.change > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                        label={`${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%`}
                        size="small"
                        sx={{
                          background: metric.change > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                          color: metric.change > 0 ? '#4CAF50' : '#f44336',
                          border: `1px solid ${metric.change > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                          fontWeight: 'bold',
                          animation: metric.change > 10 ? `${bounce} 2s ease-in-out infinite` : 'none',
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grow>
          ))}
        </Box>

        {/* Enhanced Chart Controls */}
        <Fade in timeout={1800}>
          <Paper
            sx={{
              p: 3,
              mb: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${PERIOD_COLORS[viewMode]} 30%, ${PERIOD_COLORS[viewMode]}CC 90%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: `${pulse} 3s ease-in-out infinite`,
                }}
              >
                <ShowChartIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  📈 {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}ly Progress
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {viewMode === 'day' ? 'Hourly breakdown' :
                    viewMode === 'week' ? 'Daily breakdown' :
                      viewMode === 'month' ? 'Daily breakdown' :
                        'Monthly breakdown'} • {enhancedAnalytics.periodData.length} data points
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_, newType) => newType && setChartType(newType)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&.Mui-selected': {
                      background: `${PERIOD_COLORS[viewMode]}30`,
                      color: PERIOD_COLORS[viewMode],
                      border: `1px solid ${PERIOD_COLORS[viewMode]}50`,
                    },
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                    }
                  }
                }}
              >
                <ToggleButton value="line">
                  <ShowChartIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="area">
                  <TimelineIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="bar">
                  <BarChartIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                startIcon={<InsightsIcon />}
                onClick={() => setShowPatterns(!showPatterns)}
                sx={{
                  color: showPatterns ? PERIOD_COLORS[viewMode] : 'rgba(255,255,255,0.7)',
                  border: showPatterns
                    ? `1px solid ${PERIOD_COLORS[viewMode]}50`
                    : '1px solid rgba(255,255,255,0.2)',
                  background: showPatterns ? `${PERIOD_COLORS[viewMode]}20` : 'transparent',
                  '&:hover': {
                    background: `${PERIOD_COLORS[viewMode]}30`,
                    color: PERIOD_COLORS[viewMode],
                  },
                  transition: 'all 0.3s ease',
                  fontSize: '0.8rem',
                  px: 2,
                }}
              >
                Patterns
              </Button>
            </Box>
          </Paper>
        </Fade>

        {/* Enhanced Charts Section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 6 }}>
          {/* Main Progress Chart */}
          <Slide direction="up" in timeout={2000}>
            <Paper
              sx={{
                flex: { xs: '1 1 100%', lg: '1 1 68%' },
                minWidth: '300px',
                p: 4,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                height: '450px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                  border: `1px solid ${PERIOD_COLORS[viewMode]}30`,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  📊 {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}ly Progress
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${(enhancedAnalytics.periodData as any[]).reduce((sum: number, d: any) => sum + (d?.problems ?? 0), 0)} total`}
                    size="small"
                    sx={{
                      background: `${PERIOD_COLORS[viewMode]}20`,
                      color: PERIOD_COLORS[viewMode],
                      border: `1px solid ${PERIOD_COLORS[viewMode]}30`,
                    }}
                  />
                  {animatedMetrics.periodChange !== 0 && (
                    <Chip
                      icon={animatedMetrics.periodChange > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                      label={`${animatedMetrics.periodChange > 0 ? '+' : ''}${animatedMetrics.periodChange.toFixed(1)}%`}
                      size="small"
                      sx={{
                        background: animatedMetrics.periodChange > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                        color: animatedMetrics.periodChange > 0 ? '#4CAF50' : '#f44336',
                        border: `1px solid ${animatedMetrics.periodChange > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                      }}
                    />
                  )}
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="85%">
                {chartType === 'area' ? (
                  <AreaChart data={enhancedAnalytics.periodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="label"
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="problems"
                      stroke={PERIOD_COLORS[viewMode]}
                      fill="url(#colorGradient)"
                      strokeWidth={3}
                      dot={(props: any) => {
                        const { payload } = props;
                        return (
                          <circle
                            {...props}
                            fill={payload?.isToday ? '#FFD700' : PERIOD_COLORS[viewMode]}
                            stroke={payload?.isToday ? '#FFD700' : PERIOD_COLORS[viewMode]}
                            strokeWidth={payload?.isToday ? 3 : 2}
                            r={payload?.isToday ? 8 : 6}
                          />
                        );
                      }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PERIOD_COLORS[viewMode]} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={PERIOD_COLORS[viewMode]} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                ) : chartType === 'line' ? (
                  <LineChart data={enhancedAnalytics.periodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="label"
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="problems"
                      stroke={PERIOD_COLORS[viewMode]}
                      strokeWidth={3}
                      dot={(props: any) => {
                        const { payload } = props;
                        return (
                          <circle
                            {...props}
                            fill={payload?.isToday ? '#FFD700' : PERIOD_COLORS[viewMode]}
                            stroke={payload?.isToday ? '#FFD700' : PERIOD_COLORS[viewMode]}
                            strokeWidth={payload?.isToday ? 3 : 2}
                            r={payload?.isToday ? 8 : 6}
                          />
                        );
                      }}
                      activeDot={{ r: 8, stroke: PERIOD_COLORS[viewMode], strokeWidth: 2 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={enhancedAnalytics.periodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="label"
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="problems"
                      fill={PERIOD_COLORS[viewMode]}
                      radius={[4, 4, 0, 0]}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Paper>
          </Slide>

          {/* Enhanced Platform Distribution */}
          <Slide direction="up" in timeout={2200}>
            <Paper
              sx={{
                flex: { xs: '1 1 100%', lg: '1 1 28%' },
                minWidth: '300px',
                p: 4,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                height: '450px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  🏆 Platform Distribution
                </Typography>
                <Chip
                  label={`${enhancedAnalytics.platformData.length} platforms`}
                  size="small"
                  sx={{
                    background: 'rgba(102, 126, 234, 0.2)',
                    color: '#667eea',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                  }}
                />
              </Box>
              {enhancedAnalytics.platformData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="55%">
                    <PieChart>
                      <Pie
                        data={enhancedAnalytics.platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {enhancedAnalytics.platformData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 3, maxHeight: '140px'}}>
                    {enhancedAnalytics.platformData.map((platform, index) => (
                      <Box
                        key={platform.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1.5,
                          p: 1,
                          borderRadius: 2,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.08)',
                            transform: 'translateX(5px)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: platform.color,
                              boxShadow: `0 0 10px ${platform.color}50`,
                            }}
                          />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                            {platform.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="caption" sx={{ color: platform.color, fontWeight: 'bold' }}>
                            {platform.percentage.toFixed(0)}%
                          </Typography>
                          <Chip
                            label={platform.value}
                            size="small"
                            sx={{
                              background: `${platform.color}20`,
                              color: platform.color,
                              border: `1px solid ${platform.color}40`,
                              minWidth: '45px',
                              height: '20px',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ fontSize: '3rem', mb: 2, opacity: 0.5 }}>📊</Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    No platform data available yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    Start solving problems to see distribution
                  </Typography>
                </Box>
              )}
            </Paper>
          </Slide>
        </Box>

        {/* Enhanced Productivity Patterns */}
        {showPatterns && enhancedAnalytics.patterns && (
          <Slide direction="up" in timeout={2600}>
            <Paper
              sx={{
                p: 4,
                mb: 6,
                background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(233, 30, 99, 0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(156, 39, 176, 0.2)',
                borderRadius: 3,
                animation: `${glow} 4s ease-in-out infinite`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                      animation: `${pulse} 3s ease-in-out infinite`,
                    }}
                  >
                    <PsychologyIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#E91E63', fontWeight: 'bold' }}>
                      🧠 Productivity Patterns
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Data-driven insights about your coding habits
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${enhancedAnalytics.patterns.consistencyScore.toFixed(0)}% consistency`}
                  sx={{
                    background: 'rgba(233, 30, 99, 0.2)',
                    color: '#E91E63',
                    border: '1px solid rgba(233, 30, 99, 0.3)',
                    fontWeight: 'bold',
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card
                    sx={{
                      p: 3,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      ⏰ Time Patterns
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Peak Hour:
                        </Typography>
                        <Chip
                          label={`${enhancedAnalytics.patterns.bestHour}:00 - ${enhancedAnalytics.patterns.bestHour + 1}:00`}
                          size="small"
                          sx={{ background: 'rgba(76, 236, 196, 0.2)', color: '#4ECDC4' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Peak Day:
                        </Typography>
                        <Chip
                          label={enhancedAnalytics.patterns.bestDay}
                          size="small"
                          sx={{ background: 'rgba(102, 126, 234, 0.2)', color: '#667eea' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Preference:
                        </Typography>
                        <Chip
                          label={`${enhancedAnalytics.patterns.morningVsEvening} person`}
                          size="small"
                          sx={{
                            background: enhancedAnalytics.patterns.morningVsEvening === 'morning' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(103, 58, 183, 0.2)',
                            color: enhancedAnalytics.patterns.morningVsEvening === 'morning' ? '#FFC107' : '#673AB7'
                          }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card
                    sx={{
                      p: 3,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      📅 Weekly Patterns
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Weekday Average:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                          {animatedMetrics.weekdayAverage.toFixed(1)} problems
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Weekend Average:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FF8A80', fontWeight: 'bold' }}>
                          {animatedMetrics.weekendAverage.toFixed(1)} problems
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Pattern:
                        </Typography>
                        <Chip
                          label={`${enhancedAnalytics.patterns.weekdayVsWeekend} focused`}
                          size="small"
                          sx={{
                            background: enhancedAnalytics.patterns.weekdayVsWeekend === 'weekday' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                            color: enhancedAnalytics.patterns.weekdayVsWeekend === 'weekday' ? '#4CAF50' : '#FF9800'
                          }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Slide>
        )}

        {/* Enhanced Smart Insights Section */}
        {enhancedAnalytics.insights.length > 0 && (
          <Slide direction="up" in timeout={2400}>
            <Paper
              sx={{
                p: 4,
                mb: 6,
                background: 'linear-gradient(135deg, rgba(76, 236, 196, 0.1), rgba(102, 126, 234, 0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(76, 236, 196, 0.2)',
                borderRadius: 3,
                animation: `${glow} 4s ease-in-out infinite`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #4ECDC4, #667eea, #764ba2)',
                  animation: `${shimmer} 3s linear infinite`,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 90%)',
                      animation: `${pulse} 3s ease-in-out infinite`,
                    }}
                  >
                    <PsychologyIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                      🧠 AI-Powered {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}ly Insights
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Smart recommendations based on your {viewMode}ly performance patterns
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${enhancedAnalytics.insights.length} insights`}
                  sx={{
                    background: 'rgba(76, 236, 196, 0.2)',
                    color: '#4ECDC4',
                    border: '1px solid rgba(76, 236, 196, 0.3)',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {enhancedAnalytics.insights.map((insight, index) => (
                  <Grow key={index} in timeout={2600 + index * 200}>
                    <Card
                      sx={{
                        flex: { xs: '1 1 100%', md: '1 1 45%', lg: '1 1 30%' },
                        minWidth: '300px',
                        background: insight.type === 'success'
                          ? 'rgba(76, 175, 80, 0.1)'
                          : insight.type === 'warning'
                            ? 'rgba(255, 193, 7, 0.1)'
                            : insight.type === 'info'
                              ? 'rgba(33, 150, 243, 0.1)'
                              : insight.type === 'achievement'
                                ? 'rgba(255, 215, 0, 0.1)'
                                : insight.type === 'pattern'
                                  ? 'rgba(156, 39, 176, 0.1)'
                                  : 'rgba(103, 58, 183, 0.1)',
                        border: `1px solid ${insight.type === 'success'
                          ? 'rgba(76, 175, 80, 0.3)'
                          : insight.type === 'warning'
                            ? 'rgba(255, 193, 7, 0.3)'
                            : insight.type === 'info'
                              ? 'rgba(33, 150, 243, 0.3)'
                              : insight.type === 'achievement'
                                ? 'rgba(255, 215, 0, 0.3)'
                                : insight.type === 'pattern'
                                  ? 'rgba(156, 39, 176, 0.3)'
                                  : 'rgba(103, 58, 183, 0.3)'
                          }`,
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                          border: `2px solid ${insight.type === 'success'
                            ? '#4CAF50'
                            : insight.type === 'warning'
                              ? '#FFC107'
                              : insight.type === 'info'
                                ? '#2196F3'
                                : insight.type === 'achievement'
                                  ? '#FFD700'
                                  : insight.type === 'pattern'
                                    ? '#9C27B0'
                                    : '#673AB7'
                            }`,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: insight.type === 'success'
                            ? '#4CAF50'
                            : insight.type === 'warning'
                              ? '#FFC107'
                              : insight.type === 'info'
                                ? '#2196F3'
                                : insight.type === 'achievement'
                                  ? '#FFD700'
                                  : insight.type === 'pattern'
                                    ? '#9C27B0'
                                    : '#673AB7',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: insight.type === 'success'
                                ? 'linear-gradient(45deg, #4CAF50, #8BC34A)'
                                : insight.type === 'warning'
                                  ? 'linear-gradient(45deg, #FFC107, #FF9800)'
                                  : insight.type === 'info'
                                    ? 'linear-gradient(45deg, #2196F3, #03A9F4)'
                                    : insight.type === 'achievement'
                                      ? 'linear-gradient(45deg, #FFD700, #FFC107)'
                                      : insight.type === 'pattern'
                                        ? 'linear-gradient(45deg, #9C27B0, #E91E63)'
                                        : 'linear-gradient(45deg, #673AB7, #9C27B0)',
                              animation: insight.priority >= 8 ? `${bounce} 2s ease-in-out infinite` : `${float} 2s ease-in-out infinite`,
                            }}
                          >
                            {insight.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', lineHeight: 1.2, mb: 0.5 }}>
                              {insight.title}
                            </Typography>
                            <Chip
                              label={insight.category}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: '18px',
                                background: insight.type === 'success'
                                  ? 'rgba(76, 175, 80, 0.2)'
                                  : insight.type === 'warning'
                                    ? 'rgba(255, 193, 7, 0.2)'
                                    : insight.type === 'info'
                                      ? 'rgba(33, 150, 243, 0.2)'
                                      : insight.type === 'achievement'
                                        ? 'rgba(255, 215, 0, 0.2)'
                                        : insight.type === 'pattern'
                                          ? 'rgba(156, 39, 176, 0.2)'
                                          : 'rgba(103, 58, 183, 0.2)',
                                color: insight.type === 'success'
                                  ? '#4CAF50'
                                  : insight.type === 'warning'
                                    ? '#FFC107'
                                    : insight.type === 'info'
                                      ? '#2196F3'
                                      : insight.type === 'achievement'
                                        ? '#FFD700'
                                        : insight.type === 'pattern'
                                          ? '#9C27B0'
                                          : '#673AB7',
                                textTransform: 'capitalize',
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 3, lineHeight: 1.6 }}>
                          {insight.description}
                        </Typography>
                        {insight.action && (
                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{
                              borderColor: insight.type === 'success'
                                ? 'rgba(76, 175, 80, 0.5)'
                                : insight.type === 'warning'
                                  ? 'rgba(255, 193, 7, 0.5)'
                                  : insight.type === 'info'
                                    ? 'rgba(33, 150, 243, 0.5)'
                                    : insight.type === 'achievement'
                                      ? 'rgba(255, 215, 0, 0.5)'
                                      : insight.type === 'pattern'
                                        ? 'rgba(156, 39, 176, 0.5)'
                                        : 'rgba(103, 58, 183, 0.5)',
                              color: insight.type === 'success'
                                ? '#4CAF50'
                                : insight.type === 'warning'
                                  ? '#FFC107'
                                  : insight.type === 'info'
                                    ? '#2196F3'
                                    : insight.type === 'achievement'
                                      ? '#FFD700'
                                      : insight.type === 'pattern'
                                        ? '#9C27B0'
                                        : '#673AB7',
                              fontWeight: 'bold',
                              borderRadius: 2,
                              py: 1,
                              '&:hover': {
                                borderColor: insight.type === 'success'
                                  ? '#4CAF50'
                                  : insight.type === 'warning'
                                    ? '#FFC107'
                                    : insight.type === 'info'
                                      ? '#2196F3'
                                      : insight.type === 'achievement'
                                        ? '#FFD700'
                                        : insight.type === 'pattern'
                                          ? '#9C27B0'
                                          : '#673AB7',
                                background: insight.type === 'success'
                                  ? 'rgba(76, 175, 80, 0.1)'
                                  : insight.type === 'warning'
                                    ? 'rgba(255, 193, 7, 0.1)'
                                    : insight.type === 'info'
                                      ? 'rgba(33, 150, 243, 0.1)'
                                      : insight.type === 'achievement'
                                        ? 'rgba(255, 215, 0, 0.1)'
                                        : insight.type === 'pattern'
                                          ? 'rgba(156, 39, 176, 0.1)'
                                          : 'rgba(103, 58, 183, 0.1)',
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {insight.action}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grow>
                ))}
              </Box>
            </Paper>
          </Slide>
        )}

        {/* Enhanced Quick Stats */}
        <Slide direction="up" in timeout={2800}>
          <Paper
            sx={{
              p: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    animation: `${pulse} 3s ease-in-out infinite`,
                  }}
                >
                  <BoltIcon sx={{ fontSize: 24 }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  ⚡ Performance Metrics & Comparison
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {viewMode} view • Current vs Previous period
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {[
                {
                  label: `This ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`,
                  value: animatedMetrics.currentPeriodProblems,
                  color: PERIOD_COLORS[viewMode],
                  subtitle: 'Current period',
                  change: animatedMetrics.periodChange
                },
                {
                  label: `Previous ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`,
                  value: animatedMetrics.previousPeriodProblems,
                  color: '#FF8A80',
                  subtitle: 'Previous period',
                  change: null
                },
                {
                  label: 'Weekday Avg',
                  value: animatedMetrics.weekdayAverage.toFixed(1),
                  color: '#667eea',
                  subtitle: 'Mon-Fri average',
                  change: null
                },
                {
                  label: 'Weekend Avg',
                  value: animatedMetrics.weekendAverage.toFixed(1),
                  color: '#8BC34A',
                  subtitle: 'Sat-Sun average',
                  change: null
                },
                {
                  label: 'Morning',
                  value: animatedMetrics.morningProblems,
                  color: '#FFC107',
                  subtitle: '6AM - 12PM',
                  change: null
                },
                {
                  label: 'Evening',
                  value: animatedMetrics.eveningProblems,
                  color: '#9C27B0',
                  subtitle: '6PM - 12AM',
                  change: null
                },
              ].map((stat, index) => (
                <Box
                  key={stat.label}
                  sx={{
                    flex: { xs: '1 1 45%', sm: '1 1 30%', lg: '1 1 15%' },
                    textAlign: 'center',
                    minWidth: '140px',
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${stat.color}30`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      background: 'rgba(255,255,255,0.08)',
                      border: `1px solid ${stat.color}60`,
                    }
                  }}
                >
                  <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold', mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', mb: 0.5 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {stat.subtitle}
                  </Typography>
                  {stat.change !== null && stat.change !== 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        icon={stat.change > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                        label={`${stat.change > 0 ? '+' : ''}${stat.change.toFixed(1)}%`}
                        size="small"
                        sx={{
                          background: stat.change > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                          color: stat.change > 0 ? '#4CAF50' : '#f44336',
                          border: `1px solid ${stat.change > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                          fontSize: '0.65rem',
                          animation: Math.abs(stat.change) > 20 ? `${bounce} 2s ease-in-out infinite` : 'none',
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Slide>

        {/* Empty State for No Data */}
        {Object.keys(allProblems).length === 0 && (
          <Fade in timeout={1000}>
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
              }}
            >
              <Box sx={{ fontSize: '4rem', mb: 3, opacity: 0.6 }}>📊</Box>
              <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, fontWeight: 'bold' }}>
                No Data Yet
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, maxWidth: '500px', mx: 'auto' }}>
                Start solving problems to see detailed analytics and insights about your coding journey.
                The more you practice, the more valuable insights you'll unlock!
              </Typography>
              <Button
                onClick={handleBackToHome}
                variant="outlined"
                size="large"
                startIcon={<RocketIcon />}
                sx={{
                  borderColor: 'rgba(76, 236, 196, 0.5)',
                  color: '#4ECDC4',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': {
                    borderColor: '#4ECDC4',
                    background: 'rgba(76, 236, 196, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Start Your Journey
              </Button>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default AnalyticsPage;