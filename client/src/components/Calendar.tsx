import React from 'react';
import {
  Popover,
  Paper,
  Typography,
  Box,
  IconButton,
  Badge,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { keyframes } from '@mui/system';
import { GroupedProblems } from '../types/Problem';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
`;

interface CalendarProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  allProblems: GroupedProblems;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  open,
  anchorEl,
  onClose,
  currentMonth,
  setCurrentMonth,
  allProblems,
  selectedDate,
  onDateClick,
}) => {
  // Add safety check for allProblems
  const safeAllProblems = allProblems || {};

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateClick(today);
  };

  const getProblemsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const problems = safeAllProblems[dateKey];
    return Array.isArray(problems) ? problems : [];
  };

  const getProblemCountColor = (count: number) => {
    if (count === 0) return 'transparent';
    if (count <= 2) return 'rgba(76, 236, 196, 0.3)';
    if (count <= 4) return 'rgba(76, 236, 196, 0.6)';
    if (count <= 6) return 'rgba(76, 236, 196, 0.8)';
    return '#4ECDC4';
  };

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks.map((week, weekIndex) => (
      <Box key={weekIndex} sx={{ display: 'flex', mb: 1 }}>
        {week.map((day, dayIndex) => {
          const problems = getProblemsForDate(day);
          const problemCount = Array.isArray(problems) ? problems.length : 0; 
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <Tooltip
              key={dayIndex}
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {format(day, 'EEEE, MMMM d, yyyy')}
                  </Typography>
                  {problemCount > 0 ? (
                    <>
                      <Typography variant="caption" sx={{ color: '#4ECDC4' }}>
                        {problemCount} problem{problemCount !== 1 ? 's' : ''} solved
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {Array.isArray(problems) && problems.slice(0, 3).map((problem, index) => (
                          <Typography
                            key={index}
                            variant="caption"
                            sx={{ 
                              display: 'block', 
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '0.7rem',
                              mb: 0.5,
                            }}
                          >
                            • {problem?.title ? (problem.title.length > 30 ? `${problem.title.substring(0, 30)}...` : problem.title) : 'Unknown Problem'}
                          </Typography>
                        ))}
                        {Array.isArray(problems) && problems.length > 3 && (
                          <Typography variant="caption" sx={{ color: '#4ECDC4', fontStyle: 'italic' }}>
                            +{problems.length - 3} more...
                          </Typography>
                        )}
                      </Box>
                    </>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      No problems solved
                    </Typography>
                  )}
                </Box>
              }
              arrow
              placement="top"
              PopperProps={{
                sx: {
                  '& .MuiTooltip-tooltip': {
                    background: 'rgba(26, 26, 46, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                    maxWidth: '300px',
                  },
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(26, 26, 46, 0.95)',
                  },
                },
              }}
            >
              <Box
                onClick={() => onDateClick(day)}
                sx={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 2,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  background: getProblemCountColor(problemCount),
                  color: isCurrentMonth ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                  fontWeight: isDayToday ? 'bold' : 'normal',
                  border: isDayToday ? '2px solid #FF6B6B' : isSelected ? '2px solid #4ECDC4' : 'none',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  animation: isDayToday ? `${pulse} 2s ease-in-out infinite` : 'none',
                  '&:hover': {
                    background: isCurrentMonth 
                      ? problemCount > 0 
                        ? 'rgba(76, 236, 196, 0.8)' 
                        : 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)',
                    transform: 'scale(1.1)',
                    animation: `${float} 0.5s ease-in-out`,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: isDayToday ? 'bold' : 'normal',
                    color: isDayToday ? '#FF6B6B' : 'inherit',
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                
                {problemCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: '#fff',
                      animation: `${pulse} 2s ease-in-out infinite`,
                    }}
                  >
                    {problemCount > 9 ? '9+' : problemCount}
                  </Box>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    ));
  };

  // Early return if allProblems is not properly initialized
  if (!safeAllProblems || typeof safeAllProblems !== 'object') {
    return null;
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          p: 3,
          mt: 1,
          minWidth: '350px',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton
            onClick={handlePreviousMonth}
            sx={{
              color: '#4ECDC4',
              '&:hover': {
                background: 'rgba(76, 236, 196, 0.1)',
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
              background: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 50%, #764ba2 70%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          
          <IconButton
            onClick={handleNextMonth}
            sx={{
              color: '#4ECDC4',
              '&:hover': {
                background: 'rgba(76, 236, 196, 0.1)',
                transform: 'scale(1.1)',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Tooltip title="Go to today">
            <IconButton
              onClick={handleToday}
              sx={{
                color: '#FF6B6B',
                background: 'rgba(255, 107, 107, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 107, 107, 0.2)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <TodayIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Day headers */}
        <Box sx={{ display: 'flex', mb: 2 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <Box
              key={day}
              sx={{
                width: 40,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Calendar grid */}
      <Box sx={{ mb: 3 }}>
        {renderCalendarDays()}
      </Box>

      {/* Legend */}
      <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', pt: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, display: 'block' }}>
          Problem Intensity
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem' }}>
            Less
          </Typography>
          {[0, 1, 3, 5, 7].map((count, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: 1,
                background: getProblemCountColor(count),
                border: count === 0 ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
              }}
            />
          ))}
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem' }}>
            More
          </Typography>
        </Box>
      </Box>

      {/* Quick stats */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
              {Object.keys(safeAllProblems).filter(date => {
                const d = new Date(date);
                return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
              }).length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Active Days
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
              {Object.keys(safeAllProblems).filter(date => {
                const d = new Date(date);
                return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
              }).reduce((sum, date) => {
                const problems = safeAllProblems[date];
                return sum + (Array.isArray(problems) ? problems.length : 0);
              }, 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Total Problems
            </Typography>
          </Box>
        </Box>
      </Box>
    </Popover>
  );
};

export default Calendar;