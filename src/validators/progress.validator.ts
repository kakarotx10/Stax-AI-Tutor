import { z } from 'zod';
import { LEARNING_PHASES } from '@/src/lib/constants';

export const updateProgressSchema = z.object({
  subjectId: z.string().min(1),
  unitId: z.string().min(1),
  subtopicId: z.string().min(1),
  phase: z.enum(Object.values(LEARNING_PHASES) as [string, ...string[]]),
  mcqScore: z.number().min(0).max(100).optional(),
  codingScore: z.number().min(0).max(100).optional(),
});

export type UpdateProgressDto = z.infer<typeof updateProgressSchema>;
