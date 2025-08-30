import { format, isToday, isYesterday, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

export const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) return `Today, ${format(date, 'MMMM d, yyyy')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'MMMM d, yyyy')}`;
  return format(date, 'EEEE, MMMM d, yyyy');
};

export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const daysDiff = differenceInDays(now, date);
  
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff < 7) return `${daysDiff} days ago`;
  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
  if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months ago`;
  return `${Math.floor(daysDiff / 365)} years ago`;
};

export const getWeekDateRange = (date: Date): { start: Date; end: Date } => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

export const formatWeekRange = (date: Date): string => {
  const { start, end } = getWeekDateRange(date);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
};

export const createDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const parseDateKey = (dateKey: string): Date => {
  return new Date(dateKey);
};

export const getDateRangeArray = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const getWeekdayName = (date: Date): string => {
  return format(date, 'EEEE');
};

export const getMonthName = (date: Date): string => {
  return format(date, 'MMMM');
};