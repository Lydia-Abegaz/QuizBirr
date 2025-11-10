export interface User {
  id: string;
  phoneNumber: string;
  balance: number;
  points: number;
  referralCode: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Quiz {
  id: string;
  question: string;
  difficulty: string;
  points: number;
  isActive: boolean;
  createdAt: string;
}

export interface QuizResult {
  isCorrect: boolean;
  pointsEarned: number;
  balanceChange: number;
  newBalance: number;
  newPoints: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  description?: string;
  createdAt: string;
  processedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  reward: number;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  status: string;
  proof?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
  task: Task;
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
