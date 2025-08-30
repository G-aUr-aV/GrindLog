import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Problem, GroupedProblems, FilterPlatform, ProblemPlatform } from '../types/Problem';
import { problemsApi } from '../services/api';

interface ProblemCounts {
  all: number;
  LeetCode: number;
  Codeforces: number;
  CSES: number;
}

interface UseProblemsReturn {
  problems: GroupedProblems;
  allProblems: GroupedProblems;
  loading: boolean;
  error: string | null;
  selectedPlatform: FilterPlatform;
  setSelectedPlatform: (platform: FilterPlatform) => void;
  fetchProblems: () => Promise<void>;
  addProblem: (problemData: { platform: ProblemPlatform; title: string; url: string }) => Promise<Problem>;
  deleteProblem: (problemId: string) => Promise<void>;
  calculateProblemCounts: () => ProblemCounts;
  calculateStreak: () => number;
}

export const useProblems = (): UseProblemsReturn => {
  const [allProblems, setAllProblems] = useState<GroupedProblems>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<FilterPlatform>('all');

  // Convert date string format to yyyy-MM-dd format
  const convertDateKeyToStandardFormat = useCallback((dateKey: string): string => {
    try {
      // Handle formats like "Sat Jun 21 2025" or "2025-06-21"
      if (dateKey.includes('-') && dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateKey; // Already in correct format
      }
      
      const date = new Date(dateKey);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date key:', dateKey);
        return format(new Date(), 'yyyy-MM-dd');
      }
      
      return format(date, 'yyyy-MM-dd');
    } catch (err) {
      console.warn('Error converting date key:', dateKey, err);
      return format(new Date(), 'yyyy-MM-dd');
    }
  }, []);

  // Convert API response format to our expected format
  const normalizeProblemsData = useCallback((responseData: any): GroupedProblems => {
    if (!responseData || typeof responseData !== 'object') {
      return {};
    }

    const normalized: GroupedProblems = {};

    Object.entries(responseData).forEach(([dateKey, problems]) => {
      if (Array.isArray(problems)) {
        const standardDateKey = convertDateKeyToStandardFormat(dateKey);
        normalized[standardDateKey] = problems.filter(problem => problem && typeof problem === 'object');
      }
    });

    return normalized;
  }, [convertDateKeyToStandardFormat]);

  // Memoized utility functions
  const groupProblemsByDate = useCallback((problemsList: Problem[]): GroupedProblems => {
    if (!Array.isArray(problemsList)) {
      console.warn('groupProblemsByDate: Expected array, received:', typeof problemsList);
      return {};
    }

    return problemsList.reduce((acc, problem) => {
      if (!problem) return acc;

      const dateKey = problem.timestamp 
        ? problem.timestamp.split('T')[0] 
        : format(new Date(), 'yyyy-MM-dd');
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(problem);
      return acc;
    }, {} as GroupedProblems);
  }, []);

  // Memoized filtered problems
  const problems = useMemo(() => {
    if (selectedPlatform === 'all') {
      return allProblems;
    }

    const filtered: GroupedProblems = {};
    
    Object.entries(allProblems).forEach(([date, problemsForDate]) => {
      const filteredForDate = problemsForDate.filter(
        problem => problem.platform === selectedPlatform
      );
      
      if (filteredForDate.length > 0) {
        filtered[date] = filteredForDate;
      }
    });

    return filtered;
  }, [allProblems, selectedPlatform]);

  // Memoized problem counts (as function)
  const calculateProblemCounts = useCallback((): ProblemCounts => {
    const counts: ProblemCounts = { all: 0, LeetCode: 0, Codeforces: 0, CSES: 0 };
    
    Object.values(allProblems).flat().forEach(problem => {
      if (!problem) return;
      
      counts.all++;
      if (problem.platform && problem.platform in counts) {
        counts[problem.platform as keyof ProblemCounts]++;
      }
    });

    return counts;
  }, [allProblems]);

  // Memoized streak calculation (as function)
  const calculateStreak = useCallback((): number => {
    const dates = Object.keys(allProblems).sort((a, b) => b.localeCompare(a)); // Sort descending
    if (dates.length === 0) return 0;

    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    const yesterdayString = format(new Date(today.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    // Check if we have activity today or yesterday
    let currentDate = dates.includes(todayString) ? todayString : 
                     dates.includes(yesterdayString) ? yesterdayString : null;

    if (!currentDate) return 0;

    let streak = 0;
    let dateToCheck = new Date(currentDate);

    // Count consecutive days backwards
    while (true) {
      const dateString = format(dateToCheck, 'yyyy-MM-dd');
      if (!dates.includes(dateString)) break;
      
      streak++;
      dateToCheck = new Date(dateToCheck.getTime() - 24 * 60 * 60 * 1000);
    }

    return streak;
  }, [allProblems]);

  // Fetch problems from API
  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await problemsApi.getProblems();
      
      // Handle the specific API response structure
      let normalizedProblems: GroupedProblems = {};
      
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          // Handle your API format: { success: true, data: { "Sat Jun 21 2025": [...], ... } }
          normalizedProblems = normalizeProblemsData(response.data);
        } else if ('data' in response && typeof response.data === 'object') {
          // Handle format: { data: { "Sat Jun 21 2025": [...], ... } }
          normalizedProblems = normalizeProblemsData(response.data);
        } else if (Array.isArray(response)) {
          // Handle array format: [problem1, problem2, ...]
          normalizedProblems = groupProblemsByDate(response);
        } else {
          // Try to normalize the response directly
          normalizedProblems = normalizeProblemsData(response);
        }
      } else if (Array.isArray(response)) {
        normalizedProblems = groupProblemsByDate(response);
      } else {
        console.warn('Unexpected response format:', response);
        normalizedProblems = {};
      }
      
      setAllProblems(normalizedProblems);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch problems. Please try again.';
      setError(errorMessage);
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  }, [normalizeProblemsData, groupProblemsByDate]);

  // Add new problem
  const addProblem = useCallback(async (problemData: { 
    platform: ProblemPlatform; 
    title: string; 
    url: string; 
  }): Promise<Problem> => {
    try {
      const problemWithTimestamp = {
        ...problemData,
        timestamp: new Date().toISOString()
      };
      
      const newProblem = await problemsApi.addProblem(problemWithTimestamp);
      
      const dateKey = newProblem.timestamp 
        ? newProblem.timestamp.split('T')[0] 
        : format(new Date(), 'yyyy-MM-dd');
      
      setAllProblems(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newProblem]
      }));
      
      return newProblem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add problem';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Delete problem
  const deleteProblem = useCallback(async (problemId: string): Promise<void> => {
    try {
      await problemsApi.deleteProblem(problemId);
      
      setAllProblems(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(date => {
          updated[date] = updated[date].filter(p => p._id !== problemId);
          if (updated[date].length === 0) {
            delete updated[date];
          }
        });
        
        return updated;
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete problem';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return {
    problems,
    allProblems,
    loading,
    error,
    selectedPlatform,
    setSelectedPlatform,
    fetchProblems,
    addProblem,
    deleteProblem,
    calculateProblemCounts,
    calculateStreak,
  };
};