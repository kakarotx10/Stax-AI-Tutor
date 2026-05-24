import { z } from 'zod';
import {
  ATTEMPT_STATUSES,
  ATTEMPT_TYPES,
  MAX_CODE_LENGTH,
} from '@/src/lib/constants';

const attemptTypeValues = Object.values(ATTEMPT_TYPES) as [string, ...string[]];
const attemptStatusValues = Object.values(ATTEMPT_STATUSES) as [string, ...string[]];

const text = (max = 500) => z.string().trim().min(1).max(max);
const optionalText = (max = 500) => z.string().trim().max(max).optional();

export const attemptTestResultSchema = z.object({
  passed: z.boolean(),
  input: optionalText(5000),
  expected: optionalText(5000),
  actual: optionalText(5000),
  status: optionalText(120),
  errorMessage: optionalText(5000),
  runtimeMs: z.number().min(0).optional(),
});

export const attemptMcqResultSchema = z.object({
  question: text(4000),
  options: z.array(z.string().max(2000)).max(10).optional(),
  selectedAnswer: z.number().int().min(0).optional(),
  correctAnswer: z.number().int().min(0).optional(),
  isCorrect: z.boolean(),
  explanation: optionalText(5000),
});

export const attemptSqlResultSchema = z.object({
  rows: z.array(z.unknown()).max(200).optional(),
  rowCount: z.number().int().min(0).optional(),
  errorMessage: optionalText(5000),
});

export const createAttemptSchema = z.object({
  type: z.enum(attemptTypeValues),
  subjectId: optionalText(120),
  subjectName: optionalText(200),
  unitId: optionalText(120),
  unitName: optionalText(200),
  subtopicId: optionalText(120),
  subtopicName: optionalText(200),
  phase: optionalText(80),
  difficulty: optionalText(80),
  problemId: optionalText(200),
  problemTitle: text(300),
  prompt: optionalText(10000),
  language: optionalText(80),
  code: optionalText(MAX_CODE_LENGTH),
  status: z.enum(attemptStatusValues),
  score: z.number().min(0).max(100).default(0),
  passedCount: z.number().int().min(0).optional(),
  totalCount: z.number().int().min(0).optional(),
  testResults: z.array(attemptTestResultSchema).max(100).optional(),
  mcqResults: z.array(attemptMcqResultSchema).max(100).optional(),
  sqlResult: attemptSqlResultSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

export const listAttemptsQuerySchema = z.object({
  type: z.enum(attemptTypeValues).optional(),
  status: z.enum(attemptStatusValues).optional(),
  subjectId: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().datetime().optional(),
});

export type CreateAttemptDto = z.infer<typeof createAttemptSchema>;
export type ListAttemptsQueryDto = z.infer<typeof listAttemptsQuerySchema>;
