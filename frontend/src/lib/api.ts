import axios from 'axios';
import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  sendOTP: (phoneNumber: string) =>
    api.post<ApiResponse>('/auth/send-otp', { phoneNumber }),
  
  verifyOTP: (phoneNumber: string, otp: string) =>
    api.post<ApiResponse>('/auth/verify-otp', { phoneNumber, otp }),
  
  getProfile: () =>
    api.get<ApiResponse>('/auth/profile'),
};

// Quiz API
export const quizApi = {
  getRandomQuiz: () =>
    api.get<ApiResponse>('/quiz/random'),
  
  submitAnswer: (quizId: string, answer: boolean) =>
    api.post<ApiResponse>('/quiz/submit', { quizId, answer }),
  
  getUserStats: () =>
    api.get<ApiResponse>('/quiz/stats'),
};

// Wallet API
export const walletApi = {
  getBalance: () =>
    api.get<ApiResponse>('/wallet/balance'),
  
  getTransactions: (page: number = 1, limit: number = 20) =>
    api.get<ApiResponse>('/wallet/transactions', { params: { page, limit } }),
  
  initiateDeposit: (amount: number, method: 'telebirr' | 'bank') =>
    api.post<ApiResponse>('/wallet/deposit', { amount, method }),
  
  initiateWithdrawal: (amount: number) =>
    api.post<ApiResponse>('/wallet/withdraw', { amount }),
};

// Task API
export const taskApi = {
  getActiveTasks: () =>
    api.get<ApiResponse>('/tasks'),
  
  getTaskById: (taskId: string) =>
    api.get<ApiResponse>(`/tasks/${taskId}`),
  
  submitTask: (taskId: string, proof?: string) =>
    api.post<ApiResponse>('/tasks/submit', { taskId, proof }),
  
  getUserSubmissions: () =>
    api.get<ApiResponse>('/tasks/user/submissions'),
};

// Referral API
export const referralApi = {
  applyReferralCode: (referralCode: string) =>
    api.post<ApiResponse>('/referral/apply', { referralCode }),
  
  getReferralStats: () =>
    api.get<ApiResponse>('/referral/stats'),
  
  getReferredUsers: (page: number = 1, limit: number = 20) =>
    api.get<ApiResponse>('/referral/users', { params: { page, limit } }),
  
  claimDailyBonus: () =>
    api.post<ApiResponse>('/referral/daily-bonus'),
};

// Admin API
export const adminApi = {
  // Quiz management
  createQuiz: (data: any) =>
    api.post<ApiResponse>('/quiz', data),
  
  getAllQuizzes: (page: number = 1, limit: number = 20) =>
    api.get<ApiResponse>('/quiz/all', { params: { page, limit } }),
  
  updateQuiz: (quizId: string, data: any) =>
    api.put<ApiResponse>(`/quiz/${quizId}`, data),
  
  deleteQuiz: (quizId: string) =>
    api.delete<ApiResponse>(`/quiz/${quizId}`),
  
  // Task management
  createTask: (data: any) =>
    api.post<ApiResponse>('/tasks', data),
  
  getAllTasks: (page: number = 1, limit: number = 20) =>
    api.get<ApiResponse>('/tasks/admin/all', { params: { page, limit } }),
  
  updateTask: (taskId: string, data: any) =>
    api.put<ApiResponse>(`/tasks/${taskId}`, data),
  
  deleteTask: (taskId: string) =>
    api.delete<ApiResponse>(`/tasks/${taskId}`),
  
  getPendingSubmissions: (page: number = 1, limit: number = 20) =>
    api.get<ApiResponse>('/tasks/admin/pending', { params: { page, limit } }),
  
  reviewTaskSubmission: (submissionId: string, approved: boolean, rejectionReason?: string) =>
    api.post<ApiResponse>(`/tasks/submissions/${submissionId}/review`, { approved, rejectionReason }),
  
  // Wallet management
  confirmDeposit: (transactionId: string) =>
    api.post<ApiResponse>(`/wallet/deposit/${transactionId}/confirm`),
  
  processWithdrawal: (transactionId: string, approved: boolean, reason?: string) =>
    api.post<ApiResponse>(`/wallet/withdraw/${transactionId}/process`, { approved, reason }),
};
