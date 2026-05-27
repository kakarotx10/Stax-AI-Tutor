import { z } from 'zod';
import { MAX_CODE_LENGTH } from '@/src/lib/constants';

export const executeSchema = z.object({
  code: z.string().min(1).max(MAX_CODE_LENGTH),
  language: z.enum(['python', 'cpp', 'java']),
  stdin: z.string().optional(),
});

export const submitSchema = z.object({
  problemId: z.string().min(1),
  code: z.string().min(1).max(MAX_CODE_LENGTH),
  language: z.enum(['python', 'cpp', 'java']),
  contestId: z.string().optional(),
  subjectId: z.string().min(1).optional(),
  unitId: z.string().min(1).optional(),
  subtopicId: z.string().min(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'Basic', 'Medium', 'Advanced']).optional(),
});

export type ExecuteDto = z.infer<typeof executeSchema>;
export type SubmitDto = z.infer<typeof submitSchema>;
