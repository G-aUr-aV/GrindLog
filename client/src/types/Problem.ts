export interface Problem {
  _id: string;
  platform: 'LeetCode' | 'Codeforces' | 'CSES' | 'CodeChef' | 'Toph' | 'AtCoder';
  title: string;
  url: string;
  timestamp: string;
}

export interface GroupedProblems {
  [date: string]: Problem[];
}

// Separate types for different use cases
export type ProblemPlatform = 'LeetCode' | 'Codeforces' | 'CSES' | 'CodeChef' | 'Toph' | 'AtCoder';
export type FilterPlatform = 'all' | ProblemPlatform;