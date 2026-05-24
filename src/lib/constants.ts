export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
} as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong_answer',
  TIME_LIMIT: 'time_limit',
  RUNTIME_ERROR: 'runtime_error',
  COMPILE_ERROR: 'compile_error',
} as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];

export const ATTEMPT_TYPES = {
  CODING: 'coding',
  MCQ: 'mcq',
  SQL: 'sql',
  ASSIGNMENT: 'assignment',
  CONTEST: 'contest',
} as const;
export type AttemptType = (typeof ATTEMPT_TYPES)[keyof typeof ATTEMPT_TYPES];

export const ATTEMPT_STATUSES = {
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong_answer',
  PARTIAL: 'partial',
  RUNTIME_ERROR: 'runtime_error',
  COMPILE_ERROR: 'compile_error',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[keyof typeof ATTEMPT_STATUSES];

export const INTERVIEW_TYPES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  ML: 'ml',
  DSA: 'dsa',
  HR: 'hr',
} as const;
export type InterviewType = (typeof INTERVIEW_TYPES)[keyof typeof INTERVIEW_TYPES];

export const LEARNING_PHASES = {
  THEORY: 'theory',
  MCQ: 'mcq',
  BASIC: 'basic',
  MEDIUM: 'medium',
  HARD: 'hard',
  ASSIGNMENT: 'assignment',
} as const;
export type LearningPhase = (typeof LEARNING_PHASES)[keyof typeof LEARNING_PHASES];

export const RATE_LIMITS = {
  AI_REQUESTS_PER_MIN: 10,
  CODE_EXEC_PER_MIN: 20,
  AUTH_PER_MIN: 5,
  DEFAULT_PER_MIN: 60,
} as const;

export const MCQ_PASS_THRESHOLD = 70;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_CODE_LENGTH = 50000;
