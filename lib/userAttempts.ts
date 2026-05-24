import type { AttemptStatus, AttemptType, LearningPhase } from '@/src/lib/constants';

export interface ClientAttemptPayload {
  type: AttemptType;
  subjectId?: string;
  subjectName?: string;
  unitId?: string;
  unitName?: string;
  subtopicId?: string;
  subtopicName?: string;
  phase?: string;
  difficulty?: string;
  problemId?: string;
  problemTitle: string;
  prompt?: string;
  language?: string;
  code?: string;
  status: AttemptStatus;
  score: number;
  passedCount?: number;
  totalCount?: number;
  testResults?: Array<{
    passed: boolean;
    input?: string;
    expected?: string;
    actual?: string;
    status?: string;
    errorMessage?: string;
    runtimeMs?: number;
  }>;
  mcqResults?: Array<{
    question: string;
    options?: string[];
    selectedAnswer?: number;
    correctAnswer?: number;
    isCorrect: boolean;
    explanation?: string;
  }>;
  sqlResult?: {
    rows?: unknown[];
    rowCount?: number;
    errorMessage?: string;
  };
  metadata?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
}

export async function saveUserAttempt(payload: ClientAttemptPayload): Promise<boolean> {
  try {
    const response = await fetch('/api/users/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status !== 401) {
        const body = await response.json().catch(() => null);
        console.warn('Failed to save user attempt', body ?? response.statusText);
      }
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Failed to save user attempt', error);
    return false;
  }
}

export async function saveUserProgress(payload: {
  subjectId?: string;
  unitId?: string;
  subtopicId?: string;
  phase?: LearningPhase | string;
  mcqScore?: number;
  codingScore?: number;
}): Promise<boolean> {
  if (!payload.subjectId || !payload.unitId || !payload.subtopicId || !payload.phase) {
    return false;
  }

  try {
    const response = await fetch('/api/users/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status !== 401) {
      const body = await response.json().catch(() => null);
      console.warn('Failed to save user progress', body ?? response.statusText);
    }

    return response.ok;
  } catch (error) {
    console.warn('Failed to save user progress', error);
    return false;
  }
}
