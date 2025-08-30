export interface Problem {
  _id: string;
  platform: 'LeetCode' | 'Codeforces' | 'CSES';
  title: string;
  url: string;
  timestamp: string;
}

export interface GroupedProblems {
  [date: string]: Problem[];
}

// Separate types for different use cases
export type ProblemPlatform = 'LeetCode' | 'Codeforces' | 'CSES';
export type FilterPlatform = 'all' | ProblemPlatform;