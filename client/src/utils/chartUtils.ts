import { format, isToday } from 'date-fns';
import { GroupedProblems, FilterPlatform } from '../types/Problem';

export interface ChartDataPoint {
  date: string;
  problems: number;
  isToday: boolean;
  label: string;
}

export const filterProblemsByPlatform = (
  problems: GroupedProblems,
  platform: FilterPlatform
): GroupedProblems => {
  if (platform === 'all') return problems;

  const filtered: GroupedProblems = {};
  Object.keys(problems).forEach(date => {
    const filteredProblems = problems[date].filter(
      problem => problem.platform === platform
    );
    if (filteredProblems.length > 0) {
      filtered[date] = filteredProblems;
    }
  });
  return filtered;
};

export const getChartColors = () => ({
  primary: '#4ECDC4',
  secondary: '#667eea',
  accent: '#764ba2',
  today: '#FF6B6B',
  gradient: 'linear-gradient(45deg, #4ECDC4 30%, #667eea 50%, #764ba2 70%)',
});

export const formatChartTooltip = (value: number, name: string, props: any) => {
  const { payload } = props;
  return [
    `${value} problem${value !== 1 ? 's' : ''}`,
    payload?.isToday ? 'Today' : format(new Date(payload.date), 'MMM d, yyyy')
  ];
};

export const getBarFill = (entry: any, index: number) => {
  if (entry.isToday) return '#FF6B6B';
  
  const colors = ['#4ECDC4', '#667eea', '#764ba2', '#FF8E53', '#26C6DA'];
  return colors[index % colors.length];
};