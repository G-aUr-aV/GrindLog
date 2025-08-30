import { useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfYear, endOfYear, eachMonthOfInterval, eachWeekOfInterval, isToday, getYear, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { GroupedProblems, FilterPlatform } from '../types/Problem';

export interface ChartDataItem {
  day: string;
  problems: number;
  date: string;
  isToday: boolean;
  fullDate: string;
  longDate: string;
  activeDays?: number;
  averagePerDay?: string;
  averagePerActiveDay?: string;
  year?: number;
  weekStart?: string;
  weekEnd?: string;
  weekDay?: string;
  month?: string;
}

export const useChart = (allProblems: GroupedProblems, selectedPlatform: FilterPlatform) => {
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year' | 'years'>('week');
  const [monthViewType, setMonthViewType] = useState<'day' | 'week'>('day');
  const [currentChartDate, setCurrentChartDate] = useState(new Date());
  const [yearsRange, setYearsRange] = useState(5);

  const getWeeklyData = (): ChartDataItem[] => {
    const startOfCurrentWeek = startOfWeek(currentChartDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
    
    return weekDays.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const problemsForDate = allProblems[dateKey] || [];
      
      const filteredProblems = selectedPlatform !== 'all' 
        ? problemsForDate.filter(problem => problem.platform === selectedPlatform)
        : problemsForDate;
      
      return {
        day: format(date, 'EEE'),
        problems: filteredProblems.length,
        date: dateKey,
        isToday: isToday(date),
        fullDate: format(date, 'MMM d'),
        longDate: format(date, 'EEEE, MMM d')
      };
    });
  };

  const getMonthlyDayData = (): ChartDataItem[] => {
    const start = startOfMonth(currentChartDate);
    const end = endOfMonth(currentChartDate);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const problemsForDate = allProblems[dateKey] || [];
      
      const filteredProblems = selectedPlatform !== 'all' 
        ? problemsForDate.filter(problem => problem.platform === selectedPlatform)
        : problemsForDate;
      
      return {
        day: format(date, 'd'),
        problems: filteredProblems.length,
        date: dateKey,
        isToday: isToday(date),
        fullDate: format(date, 'MMM d'),
        longDate: format(date, 'EEEE, MMM d, yyyy'),
        weekDay: format(date, 'EEE')
      };
    });
  };

  const getMonthlyWeekData = (): ChartDataItem[] => {
    const start = startOfMonth(currentChartDate);
    const end = endOfMonth(currentChartDate);
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
    
    return weeks.map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      let totalProblems = 0;
      let hasToday = false;
      
      weekDays.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const problemsForDate = allProblems[dateKey] || [];
        
        const filteredProblems = selectedPlatform !== 'all' 
          ? problemsForDate.filter(problem => problem.platform === selectedPlatform)
          : problemsForDate;
        
        totalProblems += filteredProblems.length;
        if (isToday(date)) hasToday = true;
      });
      
      return {
        day: `W${index + 1}`,
        problems: totalProblems,
        date: format(weekStart, 'yyyy-MM-dd'),
        isToday: hasToday,
        fullDate: `Week ${index + 1}`,
        longDate: `Week ${index + 1} (${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')})`,
        weekStart: format(weekStart, 'MMM d'),
        weekEnd: format(weekEnd, 'MMM d')
      };
    });
  };

  const getYearlyData = (): ChartDataItem[] => {
    const start = startOfYear(currentChartDate);
    const end = endOfYear(currentChartDate);
    const months = eachMonthOfInterval({ start, end });
    
    return months.map(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      let totalProblems = 0;
      let hasToday = false;
      
      monthDays.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const problemsForDate = allProblems[dateKey] || [];
        
        const filteredProblems = selectedPlatform !== 'all' 
          ? problemsForDate.filter(problem => problem.platform === selectedPlatform)
          : problemsForDate;
        
        totalProblems += filteredProblems.length;
        if (isToday(date)) hasToday = true;
      });
      
      return {
        day: format(monthStart, 'MMM'),
        problems: totalProblems,
        date: format(monthStart, 'yyyy-MM-dd'),
        isToday: hasToday,
        fullDate: format(monthStart, 'MMMM yyyy'),
        longDate: format(monthStart, 'MMMM yyyy'),
        month: format(monthStart, 'MMMM')
      };
    });
  };

  const getMultiYearData = (): ChartDataItem[] => {
    const currentYear = getYear(currentChartDate);
    const startYear = currentYear - Math.floor(yearsRange / 2);
    const endYear = currentYear + Math.floor(yearsRange / 2);
    
    const years = Array.from({ length: yearsRange }, (_, i) => startYear + i);
    
    return years.map(year => {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31);
      const yearDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
      
      let totalProblems = 0;
      let activeDays = 0;
      let hasCurrentYear = false;
      
      yearDays.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const problemsForDate = allProblems[dateKey] || [];
        
        const filteredProblems = selectedPlatform !== 'all' 
          ? problemsForDate.filter(problem => problem.platform === selectedPlatform)
          : problemsForDate;
        
        totalProblems += filteredProblems.length;
        if (filteredProblems.length > 0) activeDays++;
        if (getYear(new Date()) === year) hasCurrentYear = true;
      });
      
      return {
        day: year.toString(),
        problems: totalProblems,
        activeDays,
        date: format(yearStart, 'yyyy-MM-dd'),
        isToday: hasCurrentYear,
        fullDate: `Year ${year}`,
        longDate: `Year ${year}`,
        year: year,
        averagePerDay: totalProblems > 0 ? (totalProblems / 365).toFixed(2) : '0',
        averagePerActiveDay: activeDays > 0 ? (totalProblems / activeDays).toFixed(1) : '0'
      };
    });
  };

  const getChartData = (): ChartDataItem[] => {
    switch (chartPeriod) {
      case 'week':
        return getWeeklyData();
      case 'month':
        return monthViewType === 'day' ? getMonthlyDayData() : getMonthlyWeekData();
      case 'year':
        return getYearlyData();
      case 'years':
        return getMultiYearData();
      default:
        return getWeeklyData();
    }
  };

  const handlePreviousPeriod = () => {
    switch (chartPeriod) {
      case 'week':
        setCurrentChartDate(subWeeks(currentChartDate, 1));
        break;
      case 'month':
        setCurrentChartDate(subMonths(currentChartDate, 1));
        break;
      case 'year':
        setCurrentChartDate(subYears(currentChartDate, 1));
        break;
      case 'years':
        setCurrentChartDate(subYears(currentChartDate, yearsRange));
        break;
    }
  };

  const handleNextPeriod = () => {
    switch (chartPeriod) {
      case 'week':
        setCurrentChartDate(addWeeks(currentChartDate, 1));
        break;
      case 'month':
        setCurrentChartDate(addMonths(currentChartDate, 1));
        break;
      case 'year':
        setCurrentChartDate(addYears(currentChartDate, 1));
        break;
      case 'years':
        setCurrentChartDate(addYears(currentChartDate, yearsRange));
        break;
    }
  };

  const handleToday = () => {
    setCurrentChartDate(new Date());
  };

  const getCurrentPeriodTitle = () => {
    switch (chartPeriod) {
      case 'week':
        const weekStart = startOfWeek(currentChartDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentChartDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentChartDate, 'MMMM yyyy');
      case 'year':
        return format(currentChartDate, 'yyyy');
      case 'years':
        const currentYear = getYear(currentChartDate);
        const startYear = currentYear - Math.floor(yearsRange / 2);
        const endYear = currentYear + Math.floor(yearsRange / 2);
        return `${startYear} - ${endYear}`;
      default:
        return '';
    }
  };

  return {
    chartPeriod,
    setChartPeriod,
    monthViewType,
    setMonthViewType,
    currentChartDate,
    yearsRange,
    setYearsRange,
    getChartData,
    handlePreviousPeriod,
    handleNextPeriod,
    handleToday,
    getCurrentPeriodTitle,
  };
};