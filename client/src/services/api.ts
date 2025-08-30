import axios from 'axios';
import { Problem, GroupedProblems, FilterPlatform, ProblemPlatform } from '../types/Problem';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const problemsApi = {
    addProblem: async (problemData: { platform: ProblemPlatform; title: string; url: string }) => {
        const response = await api.post('/problems', problemData);
        return response.data;
    },

    getProblems: async (platform?: FilterPlatform): Promise<{ success: boolean; data: GroupedProblems }> => {
        const response = await api.get('/problems', {
            params: platform && platform !== 'all' ? { platform } : {}
        });
        return response.data;
    },

    deleteProblem: async (id: string) => {
        const response = await api.delete(`/problems/${id}`);
        return response.data;
    }
};