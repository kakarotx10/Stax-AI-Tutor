import { z } from 'zod';

export const EvaluationRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('mcq'),
    subjectId: z.string(),
    unitId: z.string(),
    subtopicId: z.string(),
    questionId: z.string(),
    selectedOptionId: z.string(),
    correctOptionId: z.string(),
    timeTakenMs: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal('coding'),
    subjectId: z.string(),
    unitId: z.string(),
    subtopicId: z.string(),
    problemId: z.string(),
    language: z.enum(['python', 'javascript', 'java', 'cpp']),
    code: z.string().min(1).max(20_000),
    testResults: z.array(
      z.object({
        passed: z.boolean(),
        input: z.string(),
        expected: z.string(),
        actual: z.string(),
        runtimeMs: z.number().optional(),
        memoryKb: z.number().optional(),
        edge: z.boolean().optional(),
        status: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    ),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  }),
  z.object({
    type: z.literal('sql'),
    problemId: z.string(),
    query: z.string().min(1).max(5_000),
    expectedRows: z.array(z.record(z.unknown())),
    actualRows: z.array(z.record(z.unknown())),
    orderSensitive: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('written'),
    prompt: z.string(),
    answer: z.string().min(1).max(10_000),
    referenceAnswer: z.string().optional(),
    rubricHints: z.array(z.string()).optional(),
    context: z.object({
      subjectId: z.string(),
      phase: z.enum(['theory', 'assignment', 'interview']),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    }),
  }),
]);

export const WrittenGradeSchema = z.object({
  accuracy: z.number().int().min(0).max(100),
  completeness: z.number().int().min(0).max(100),
  clarity: z.number().int().min(0).max(100),
  structure: z.number().int().min(0).max(100),
  examples: z.number().int().min(0).max(100),
  strengths: z.array(z.string()).max(3).default([]),
  improvements: z.array(z.string()).max(3).default([]),
  summaryHinglish: z.string(),
});

export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;
export type WrittenGrade = z.infer<typeof WrittenGradeSchema>;

export type EvaluationLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type EvaluationStatus = 'accepted' | 'partial' | 'failed' | 'completed';

export type EvaluationNextStep =
  | { action: 'retry'; reason: string }
  | { action: 'advance'; toPhase: string }
  | { action: 'review_theory'; subtopicId: string }
  | { action: 'practice_similar'; problemIds: string[] }
  | { action: 'interview_ready'; topic: string };

export type RubricScore = {
  criterion: string;
  weight: number;
  score: number;
  comment: string;
};

export type EvaluationResult = {
  score: number;
  level: EvaluationLevel;
  status: EvaluationStatus;
  rubric: RubricScore[];
  feedback: {
    summary: string;
    strengths: string[];
    improvements: string[];
    nextStep: EvaluationNextStep;
  };
  meta: {
    evaluatedAt: string;
    evaluatorVersion: string;
    deterministic: boolean;
    latencyMs: number;
    degraded?: boolean;
  };
};

export type DegradedEvaluationResult = Omit<EvaluationResult, 'score' | 'level'> & {
  score: null;
  level: EvaluationLevel;
};
