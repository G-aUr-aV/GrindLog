import React from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  ViewWeek as ViewWeekIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  DateRange as DateRangeIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { keyframes } from '@mui/system';
import { GroupedProblems, FilterPlatform } from '../types/Problem';
import { useChart } from '../hooks/useChart';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

interface ProgressChartProps {
  allProblems: GroupedProblems;
  selectedPlatform: FilterPlatform;
  isMobile?: boolean;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  allProblems,
  selectedPlatform,
  isMobile = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const {
    chartPeriod,
    setChartPeriod,
    monthViewType,
    setMonthViewType,
    yearsRange,
    setYearsRange,
    getChartData,
    handlePreviousPeriod,
    handleNextPeriod,
    handleToday,
    getCurrentPeriodTitle,
  } = useChart(allProblems, selectedPlatform);

  const chartData = getChartData();

  const getBarColor = (entry: any, index: number) => {
    if (entry.isToday) {
      return 'url(#todayGradient)';
    }

    const colors = [
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
    ];

    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper
          sx={{
            p: 2,
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            maxWidth: '300px',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
            {data.longDate}
          </Typography>
          <Typography variant="body2" sx={{ color: '#4ECDC4', mb: 1 }}>
            {payload[0].value} problem{payload[0].value !== 1 ? 's' : ''} solved
          </Typography>

          {chartPeriod === 'years' && (
            <>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Active days: {data.activeDays}
              </Typography>
              <br />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Avg per day: {data.averagePerDay}
              </Typography>
              <br />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Avg per active day: {data.averagePerActiveDay}
              </Typography>
            </>
          )}

          {chartPeriod === 'month' && monthViewType === 'week' && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {data.weekStart} - {data.weekEnd}
            </Typography>
          )}

          {selectedPlatform !== 'all' && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Platform: {selectedPlatform}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  const periodOptions = [
    { value: 'week', label: 'Week', icon: <ViewWeekIcon /> },
    { value: 'month', label: 'Month', icon: <CalendarViewMonthIcon /> },
    { value: 'year', label: 'Year', icon: <DateRangeIcon /> },
    { value: 'years', label: 'Years', icon: <TimelineIcon /> },
  ];

  return (
    <Paper
      sx={{
        p: 4,
        mb: 4,
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #4ECDC4, #667eea, #764ba2)',
          animation: `${shimmer} 3s ease-in-out infinite`,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
    }}
  >
    <Box
      sx={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #4ECDC4, #667eea)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(76, 236, 196, 0.4)',
      }}
    >
      <TrendingUpIcon sx={{ color: '#fff', fontSize: 28 }} />
    </Box>
    <Typography
      variant="h3"
      sx={{
        color: '#fff',
        fontWeight: 'bold',
        background: 'linear-gradient(45deg, #4ECDC4, #667eea)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      Progress Chart
    </Typography>
  </Box>
</Box>

        {/* Period selector */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {periodOptions.map((option) => (
            <Chip
              key={option.value}
              icon={option.icon}
              label={option.label}
              clickable
              onClick={() => setChartPeriod(option.value as any)}
              sx={{
                background: chartPeriod === option.value
                  ? 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: chartPeriod === option.value ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                border: chartPeriod === option.value
                  ? '1px solid #4ECDC4'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: chartPeriod === option.value
                    ? 'linear-gradient(45deg, #26C6DA 30%, #4ECDC4 90%)'
                    : 'rgba(255, 255, 255, 0.15)',
                  transform: 'scale(1.05)',
                },
                '& .MuiChip-icon': {
                  color: chartPeriod === option.value ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          ))}
        </Box>

        {/* Month view type selector */}
        {chartPeriod === 'month' && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip
              label="Daily View"
              clickable
              onClick={() => setMonthViewType('day')}
              sx={{
                background: monthViewType === 'day'
                  ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: monthViewType === 'day' ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                border: monthViewType === 'day'
                  ? '1px solid #667eea'
                  : '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
            <Chip
              label="Weekly View"
              clickable
              onClick={() => setMonthViewType('week')}
              sx={{
                background: monthViewType === 'week'
                  ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: monthViewType === 'week' ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                border: monthViewType === 'week'
                  ? '1px solid #667eea'
                  : '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </Box>
        )}

        {/* Years range selector */}
        {chartPeriod === 'years' && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {[3, 5, 7, 10].map((years) => (
              <Chip
                key={years}
                label={`${years} years`}
                clickable
                onClick={() => setYearsRange(years)}
                sx={{
                  background: yearsRange === years
                    ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: yearsRange === years ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                  border: yearsRange === years
                    ? '1px solid #667eea'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
            ))}
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton
            onClick={handlePreviousPeriod}
            sx={{
              color: '#4ECDC4',
              background: 'rgba(76, 236, 196, 0.1)',
              '&:hover': {
                background: 'rgba(76, 236, 196, 0.2)',
                transform: 'scale(1.1)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
              flex: 1,
              background: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 50%, #764ba2 70%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {getCurrentPeriodTitle()}
          </Typography>

          <IconButton
            onClick={handleNextPeriod}
            sx={{
              color: '#4ECDC4',
              background: 'rgba(76, 236, 196, 0.1)',
              '&:hover': {
                background: 'rgba(76, 236, 196, 0.2)',
                transform: 'scale(1.1)',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Tooltip title="Go to current period">
            <IconButton
              onClick={handleToday}
              sx={{
                color: '#667eea',
                background: 'rgba(102, 126, 234, 0.1)',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.2)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <TodayIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ height: isMobile ? 300 : 400, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FF8E53" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}
              interval={0}
              angle={chartPeriod === 'month' && monthViewType === 'day' ? -45 : 0}
              textAnchor={chartPeriod === 'month' && monthViewType === 'day' ? 'end' : 'middle'}
              height={chartPeriod === 'month' && monthViewType === 'day' ? 60 : 30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}
              allowDecimals={false}
            />
            <RechartsTooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Bar
              dataKey="problems"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Stats summary */}
      <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
              {chartData.reduce((sum, item) => sum + item.problems, 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Total Problems
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#667eea', fontWeight: 'bold' }}>
              {chartData.filter(item => item.problems > 0).length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Active {chartPeriod === 'week' ? 'Days' : chartPeriod === 'month' ? (monthViewType === 'day' ? 'Days' : 'Weeks') : chartPeriod === 'year' ? 'Months' : 'Years'}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#764ba2', fontWeight: 'bold' }}>
              {chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.problems, 0) / chartData.length).toFixed(1) : '0'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Average per {chartPeriod === 'week' ? 'Day' : chartPeriod === 'month' ? (monthViewType === 'day' ? 'Day' : 'Week') : chartPeriod === 'year' ? 'Month' : 'Year'}
            </Typography>
          </Box>

          {chartData.some(item => item.isToday) && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                {chartData.find(item => item.isToday)?.problems || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Today
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ProgressChart;