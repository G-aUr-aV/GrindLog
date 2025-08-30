import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Badge,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays, subWeeks, subMonths } from 'date-fns';
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
    transform: translateY(-5px);
  }
`;

const gradientMove = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

interface InsightsDialogProps {
  open: boolean;
  onClose: () => void;
  allProblems: GroupedProblems;
  calculateProblemCounts: () => { all: number; LeetCode: number; Codeforces: number; CSES: number; };
  calculateStreak: () => number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface Recommendation {
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProductiveDay {
  date: string;
  count: number;
}

interface BestWeek {
  start: Date;
  count: number;
}

interface InsightsData {
  totalProblems: number;
  totalDays: number;
  activeDays: number;
  streak: number;
  avgPerDay: number;
  avgPerActiveDay: number;
  mostProductiveDay: ProductiveDay | null;
  bestWeek: BestWeek | null;
  platformBreakdown: { all: number; LeetCode: number; Codeforces: number; CSES: number; };
  recentActivity: Array<{ date: string; count: number; isToday: boolean }>;
  achievements: Achievement[];
  recommendations: Recommendation[];
}

const InsightsDialog: React.FC<InsightsDialogProps> = ({
  open,
  onClose,
  allProblems,
  calculateProblemCounts,
  calculateStreak,
}) => {
  const insights = useMemo((): InsightsData => {
    const problemCounts = calculateProblemCounts();
    const streak = calculateStreak();
    const dates = Object.keys(allProblems).sort();
    
    if (dates.length === 0) {
      return {
        totalProblems: 0,
        totalDays: 0,
        activeDays: 0,
        streak,
        avgPerDay: 0,
        avgPerActiveDay: 0,
        mostProductiveDay: null,
        bestWeek: null,
        platformBreakdown: problemCounts,
        recentActivity: [],
        achievements: [],
        recommendations: [],
      };
    }

    // Basic stats
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);
    const totalDays = differenceInDays(lastDate, firstDate) + 1;
    const activeDays = dates.length;
    const totalProblems = problemCounts.all;
    const avgPerDay = totalDays > 0 ? totalProblems / totalDays : 0;
    const avgPerActiveDay = activeDays > 0 ? totalProblems / activeDays : 0;

    // Most productive day
    let mostProductiveDay: ProductiveDay | null = null;
    let maxProblems = 0;
    
    for (const date of dates) {
      const count = allProblems[date].length;
      if (count > maxProblems) {
        maxProblems = count;
        mostProductiveDay = { date, count };
      }
    }

    // Best week
    let bestWeek: BestWeek | null = null;
    let maxWeekProblems = 0;
    const weeks = new Map<string, { start: Date; count: number }>();
    
    for (const date of dates) {
      const d = new Date(date);
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, { start: weekStart, count: 0 });
      }
      const week = weeks.get(weekKey)!;
      week.count += allProblems[date].length;
    }

    weeks.forEach((week) => {
      if (week.count > maxWeekProblems) {
        maxWeekProblems = week.count;
        bestWeek = { start: week.start, count: week.count };
      }
    });

    // Recent activity (last 30 days) - Create complete 30-day array
    const thirtyDaysAgo = subDays(new Date(), 29); // Include today, so 30 days total
    const recentActivity: Array<{ date: string; count: number; isToday: boolean }> = [];
    
    for (let i = 0; i < 30; i++) {
      const currentDate = subDays(new Date(), 29 - i);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const count = allProblems[dateKey]?.length || 0;
      
      recentActivity.push({
        date: dateKey,
        count,
        isToday: isToday(currentDate),
      });
    }

    // Achievements
    const achievements: Achievement[] = [];
    
    if (totalProblems >= 1) {
      achievements.push({ 
        title: 'First Steps', 
        description: 'Solved your first problem!', 
        icon: '🎯', 
        color: '#4ECDC4' 
      });
    }
    if (totalProblems >= 10) {
      achievements.push({ 
        title: 'Getting Started', 
        description: 'Solved 10 problems!', 
        icon: '🚀', 
        color: '#667eea' 
      });
    }
    if (totalProblems >= 50) {
      achievements.push({ 
        title: 'Problem Solver', 
        description: 'Solved 50 problems!', 
        icon: '💪', 
        color: '#764ba2' 
      });
    }
    if (totalProblems >= 100) {
      achievements.push({ 
        title: 'Century Club', 
        description: 'Solved 100 problems!', 
        icon: '🏆', 
        color: '#FF6B6B' 
      });
    }
    if (totalProblems >= 500) {
      achievements.push({ 
        title: 'Elite Coder', 
        description: 'Solved 500 problems!', 
        icon: '👑', 
        color: '#FFD700' 
      });
    }
    
    if (streak >= 3) {
      achievements.push({ 
        title: 'On Fire', 
        description: `${streak} day streak!`, 
        icon: '🔥', 
        color: '#FF8E53' 
      });
    }
    if (streak >= 7) {
      achievements.push({ 
        title: 'Week Warrior', 
        description: 'Solved problems for 7 consecutive days!', 
        icon: '⚡', 
        color: '#FF6B6B' 
      });
    }
    if (streak >= 30) {
      achievements.push({ 
        title: 'Month Master', 
        description: 'Solved problems for 30 consecutive days!', 
        icon: '🌟', 
        color: '#FFD700' 
      });
    }
    
    if (activeDays >= 30) {
      achievements.push({ 
        title: 'Consistent Coder', 
        description: 'Active for 30 different days!', 
        icon: '📅', 
        color: '#4ECDC4' 
      });
    }
    if (activeDays >= 100) {
      achievements.push({ 
        title: 'Dedication', 
        description: 'Active for 100 different days!', 
        icon: '💎', 
        color: '#667eea' 
      });
    }
    
    // Power Day achievement - Fixed the type issue
    if (mostProductiveDay && mostProductiveDay.count >= 5) {
      achievements.push({ 
        title: 'Power Day', 
        description: `Solved ${mostProductiveDay.count} problems in one day!`, 
        icon: '⚡', 
        color: '#FF8E53' 
      });
    }

    // Recommendations
    const recommendations: Recommendation[] = [];
    
    if (avgPerActiveDay < 2) {
      recommendations.push({ 
        title: 'Increase Daily Volume', 
        description: 'Try to solve at least 2 problems per active day.', 
        icon: '💪', 
        priority: 'medium' 
      });
    }
    
    if (streak === 0) {
      recommendations.push({ 
        title: 'Start a Streak', 
        description: 'Begin solving problems daily to build momentum.', 
        icon: '🔥', 
        priority: 'high' 
      });
    } else if (streak < 7) {
      recommendations.push({ 
        title: 'Build Your Streak', 
        description: 'Try to maintain a 7-day streak for better consistency.', 
        icon: '⚡', 
        priority: 'medium' 
      });
    }
    
    const recentWeekCount = recentActivity.filter(day => new Date(day.date) >= subWeeks(new Date(), 1)).length;
    if (recentWeekCount < 3) {
      recommendations.push({ 
        title: 'Stay Active', 
        description: 'Aim for at least 3 active days per week.', 
        icon: '💪', 
        priority: 'high' 
      });
    }
    
    const platformCounts = Object.entries(problemCounts).filter(([key]) => key !== 'all');
    const dominantPlatform = platformCounts.reduce((max, [platform, count]) => 
      count > max.count ? { platform, count } : max, { platform: '', count: 0 });
    
    if (dominantPlatform.count / totalProblems > 0.8 && totalProblems > 10) {
      recommendations.push({ 
        title: 'Diversify Platforms', 
        description: `Try solving problems on other platforms besides ${dominantPlatform.platform}.`, 
        icon: '🌐', 
        priority: 'low' 
      });
    }

    return {
      totalProblems,
      totalDays,
      activeDays,
      streak,
      avgPerDay,
      avgPerActiveDay,
      mostProductiveDay,
      bestWeek,
      platformBreakdown: problemCounts,
      recentActivity,
      achievements,
      recommendations,
    };
  }, [allProblems, calculateProblemCounts, calculateStreak]);

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
    <Paper
      sx={{
        p: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        textAlign: 'center',
        transition: 'all 0.3s ease',
        flex: 1,
        minWidth: '200px',
        '&:hover': {
          transform: 'translateY(-5px)',
          background: 'rgba(255, 255, 255, 0.08)',
          animation: `${float} 2s ease-in-out infinite`,
        },
      }}
    >
      <Typography sx={{ fontSize: '2rem', mb: 1 }}>{icon}</Typography>
      <Typography
        variant="h4"
        sx={{
          color: color,
          fontWeight: 'bold',
          mb: 1,
        }}
      >
        {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value}
      </Typography>
      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <Paper
      sx={{
        p: 2,
        background: `linear-gradient(45deg, ${achievement.color}20 30%, ${achievement.color}40 90%)`,
        border: `1px solid ${achievement.color}40`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        flex: 1,
        minWidth: '280px',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: `0 8px 25px ${achievement.color}30`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '1.5rem' }}>{achievement.icon}</Typography>
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold' }}>
            {achievement.title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {achievement.description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  const RecommendationCard: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => (
    <Paper
      sx={{
        p: 2,
        background: 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${
          recommendation.priority === 'high' ? 'rgba(255, 107, 107, 0.3)' :
          recommendation.priority === 'medium' ? 'rgba(255, 193, 7, 0.3)' :
          'rgba(76, 236, 196, 0.3)'
        }`,
        borderRadius: 2,
        borderLeft: `4px solid ${
          recommendation.priority === 'high' ? '#FF6B6B' :
          recommendation.priority === 'medium' ? '#FFC107' :
          '#4ECDC4'
        }`,
        flex: 1,
        minWidth: '300px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '1.2rem' }}>{recommendation.icon}</Typography>
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold' }}>
            {recommendation.title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {recommendation.description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 50%, #764ba2 70%)',
          backgroundSize: '400% 400%',
          animation: `${gradientMove} 3s ease infinite`,
          color: '#fff',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InsightsIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Coding Journey Insights
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#fff',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 5 }}>
        {/* Main Stats */}
        <Box sx={{mt: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon sx={{ color: '#4ECDC4' }} />
            Overall Statistics
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            '& > *': {
              flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }
            }
          }}>
            <StatCard
              title="Total Problems"
              value={insights.totalProblems}
              icon="🎯"
              color="#4ECDC4"
            />
            <StatCard
              title="Active Days"
              value={insights.activeDays}
              icon="📅"
              color="#667eea"
            />
            <StatCard
              title="Current Streak"
              value={insights.streak}
              icon="🔥"
              color="#FF6B6B"
              subtitle="consecutive days"
            />
            <StatCard
              title="Avg per Active Day"
              value={insights.avgPerActiveDay}
              icon="⚡"
              color="#FF8E53"
              subtitle="problems/day"
            />
          </Box>
        </Box>

        {/* Platform Breakdown */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <SpeedIcon sx={{ color: '#667eea' }} />
            Platform Breakdown
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {Object.entries(insights.platformBreakdown)
              .filter(([key]) => key !== 'all')
              .map(([platform, count]) => {
                const percentage = insights.totalProblems > 0 ? (count / insights.totalProblems) * 100 : 0;
                const colors = {
                  LeetCode: '#FFA726',
                  Codeforces: '#42A5F5',
                  CSES: '#66BB6A',
                };
                return (
                  <Paper
                    key={platform}
                    sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${colors[platform as keyof typeof colors]}40`,
                      borderRadius: 2,
                      minWidth: '150px',
                      flex: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
                      {platform}
                    </Typography>
                    <Typography variant="h5" sx={{ color: colors[platform as keyof typeof colors], fontWeight: 'bold' }}>
                      {count}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: colors[platform as keyof typeof colors],
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5, display: 'block' }}>
                      {percentage.toFixed(1)}%
                    </Typography>
                  </Paper>
                );
              })}
          </Box>
        </Box>

        {/* Highlights */}
        {(insights.mostProductiveDay || insights.bestWeek) && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrophyIcon sx={{ color: '#FFD700' }} />
              Highlights
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 3,
              '& > *': {
                flexBasis: { xs: '100%', md: 'calc(50% - 12px)' }
              }
            }}>
              {insights.mostProductiveDay && (
                <StatCard
                  title="Most Productive Day"
                  value={insights.mostProductiveDay.count}
                  icon="🌟"
                  color="#FFD700"
                  subtitle={format(new Date(insights.mostProductiveDay.date), 'MMM d, yyyy')}
                />
              )}
              {insights.bestWeek && (
                <StatCard
                  title="Best Week"
                  value={insights.bestWeek.count}
                  icon="🏆"
                  color="#FF6B6B"
                  subtitle={format(insights.bestWeek.start, 'MMM d, yyyy')}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Achievements */}
        {insights.achievements.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrophyIcon sx={{ color: '#FFD700' }} />
              Achievements
              {/* Replace Chip with a custom badge */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  height: 24,
                  px: 1,
                  borderRadius: '12px',
                  background: 'linear-gradient(45deg, #FFD700 30%, #FFA726 90%)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  animation: `${pulse} 2s ease-in-out infinite`,
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                {insights.achievements.length}
              </Box>
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              '& > *': {
                flexBasis: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' }
              }
            }}>
              {insights.achievements.map((achievement, index) => (
                <AchievementCard key={index} achievement={achievement} />
              ))}
            </Box>
          </Box>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TimelineIcon sx={{ color: '#4ECDC4' }} />
              Recommendations
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              '& > *': {
                flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' }
              }
            }}>
              {insights.recommendations.map((recommendation, index) => (
                <RecommendationCard key={index} recommendation={recommendation} />
              ))}
            </Box>
          </Box>
        )}

        {/* Recent Activity */}
        {insights.recentActivity.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarIcon sx={{ color: '#667eea' }} />
              Recent Activity (Last 30 Days)
            </Typography>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
              }}
            >
              {/* Activity Grid */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(14px, 1fr))',
                gap: 1,
                mb: 3,
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
                {insights.recentActivity.map((day) => (
                  <Box
                    key={day.date}
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: 1,
                      background: day.count === 0 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : day.count <= 2 
                          ? 'rgba(76, 236, 196, 0.4)' 
                          : day.count <= 4 
                            ? 'rgba(76, 236, 196, 0.7)' 
                            : '#4ECDC4',
                      border: day.isToday ? '2px solid #FF6B6B' : 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.3)',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      },
                    }}
                    title={`${format(new Date(day.date), 'MMM d, yyyy')}: ${day.count} problems`}
                  />
                ))}
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Less
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, background: 'rgba(76, 236, 196, 0.4)' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, background: 'rgba(76, 236, 196, 0.7)' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, background: '#4ECDC4' }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  More
                </Typography>
              </Box>

              {/* Summary Stats */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-around' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                      {insights.recentActivity.filter(day => day.count > 0).length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Active Days
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                      {insights.recentActivity.reduce((sum, day) => sum + day.count, 0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Total Problems
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                      {Math.max(...insights.recentActivity.map(day => day.count))}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Best Day
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
            color: '#fff',
            fontWeight: 'bold',
            px: 4,
            '&:hover': {
              background: 'linear-gradient(45deg, #26C6DA 30%, #4ECDC4 90%)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InsightsDialog;