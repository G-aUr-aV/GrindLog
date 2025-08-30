import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, IconButton, Stack, Divider } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import EmailIcon from '@mui/icons-material/Email';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isWithinInterval, subDays } from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SendDigestButton = () => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'info' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
    setCurrentMonth(startOfMonth(new Date()));
  };

  const handleDateClick = (day) => {
    if (!startDate || endDate) {
      setStartDate(day);
      setEndDate(null);
    } else if (day < startDate) {
      setEndDate(startDate);
      setStartDate(day);
    } else {
      setEndDate(day);
    }
  };

  const setPresetRange = (preset) => {
    const today = new Date();
    let start = today;
    let end = today;

    switch (preset) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'yesterday':
        start = subDays(today, 1);
        end = subDays(today, 1);
        break;
      case 'last7days':
        start = subDays(today, 6);
        end = today;
        break;
      case 'last30days':
        start = subDays(today, 29);
        end = today;
        break;
      case 'thismonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
    }
    setStartDate(start);
    setEndDate(end);
    setCurrentMonth(startOfMonth(end));
  };

  const handleSend = async () => {
    setLoading(true);
    handleCloseDialog();
    try {
      const response = await fetch('http://localhost:5000/api/digest/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An unknown error occurred.');
      }

      setFeedback({
        open: true,
        message: data.message,
        severity: 'success',
      });
    } catch (error) {
      setFeedback({
        open: true,
        message: error.message || 'Failed to trigger digest.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setFeedback({ ...feedback, open: false });
  };

  const renderSingleCalendar = (monthToRender) => {
    const monthStart = startOfMonth(monthToRender);
    const monthEnd = endOfMonth(monthToRender);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <Box sx={{ userSelect: 'none', width: 320 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton size="small" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} sx={{ color: '#c5c9d3' }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#e1e4ea' }}>{format(monthToRender, 'MMMM yyyy')}</Typography>
          <IconButton size="small" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} sx={{ color: '#c5c9d3' }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 1 }}>
          {weekDays.map(day => (
            <Typography key={day} variant="caption" sx={{ color: '#8a94a6' }}>{day}</Typography>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {days.map((day) => {
            const isDayInMonth = isSameMonth(day, monthToRender);
            const isStart = startDate && isSameDay(day, startDate);
            const isEnd = endDate && isSameDay(day, endDate);
            const isHovering = hoverDate && !isEnd;
            const inRange = startDate && isWithinInterval(day, { start: startDate, end: endDate || (isHovering ? hoverDate : startDate) });

            const getBackgroundColor = () => {
              if (isStart || isEnd) return 'rgba(102, 126, 234, 0.8)';
              if (inRange) return 'rgba(102, 126, 234, 0.1)';
              return 'transparent';
            };

            const getTextColor = () => {
              if (isStart || isEnd) return '#fff';
              if (inRange) return '#a3bffa';
              if (isDayInMonth) return '#c5c9d3';
              return '#6c788b';
            };

            return (
              <IconButton
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: getBackgroundColor(),
                  color: getTextColor(),
                  opacity: isDayInMonth ? 1 : 0.4,
                  borderRadius: isStart && isEnd ? '50%' : isStart ? '50% 0 0 50%' : isEnd ? '0 50% 50% 0' : inRange ? 0 : '50%',
                  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                  '&:hover': {
                    backgroundColor: isStart || isEnd ? 'rgba(102, 126, 234, 1)' : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <Typography variant="body2">{format(day, 'd')}</Typography>
              </IconButton>
            );
          })}
        </Box>
      </Box>
    );
  };

  const selectedRangeText = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    if (startDate && !endDate) {
      return `${format(startDate, 'MMM d, yyyy')} - (Select end date)`;
    }
    return 'Select a date range';
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
        sx={{
          borderColor: loading ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.5)',
          color: loading ? 'rgba(255,255,255,0.5)' : '#667eea',
          fontWeight: 'bold',
          px: 3,
          py: 1,
          borderRadius: 2,
          border: '1px solid',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#667eea',
            background: 'rgba(102, 126, 234, 0.1)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        {loading ? 'Sending...' : 'Send Digest'}
      </Button>
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#c5c9d3',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            overflow: 'visible' // Allow popovers/tooltips to overflow
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Panel: Presets */}
          <Box sx={{ p: 3, borderRight: { xs: 'none', md: '1px solid rgba(255, 255, 255, 0.1)' }, borderBottom: { xs: '1px solid rgba(255, 255, 255, 0.1)', md: 'none' } }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#e1e4ea' }}>Quick Ranges</Typography>
            <Stack spacing={1}>
              {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'].map(text => (
                <Button
                  key={text}
                  onClick={() => setPresetRange(text.toLowerCase().replace(/\s/g, ''))}
                  sx={{ justifyContent: 'flex-start', color: '#c5c9d3', '&:hover': { color: '#a3bffa', background: 'rgba(102, 126, 234, 0.1)' } }}
                >
                  {text}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Right Panel: Calendars & Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#e1e4ea' }}>
              Select Custom Date Range
              <Typography variant="body2" sx={{ color: '#8a94a6' }}>{selectedRangeText()}</Typography>
            </DialogTitle>
            <DialogContent sx={{ display: { xs: 'block', md: 'flex' }, gap: 4, p: 3 }}>
              {renderSingleCalendar(currentMonth)}
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', display: { xs: 'none', md: 'block' } }} />
              {renderSingleCalendar(addMonths(currentMonth, 1))}
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
              <Button onClick={handleCloseDialog} sx={{ color: '#8a94a6' }}>Cancel</Button>
              <Button
                onClick={handleSend}
                disabled={loading || !startDate || !endDate}
                variant="contained"
                sx={{
                  color: '#fff',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.25)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? 'Sending...' : 'Generate Report'}
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
      <Snackbar open={feedback.open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={feedback.severity} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SendDigestButton;