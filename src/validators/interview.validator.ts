import { z } from 'zod';
import { INTERVIEW_TYPES } from '@/src/lib/constants';

export const startInterviewSchema = z.object({
  type: z.enum(Object.values(INTERVIEW_TYPES) as [string, ...string[]]),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const respondInterviewSchema = z.object({
  sessionId: z.string().min(1),
  answer: z.string().min(1),
});

export type StartInterviewDto = z.infer<typeof startInterviewSchema>;
export type RespondInterviewDto = z.infer<typeof respondInterviewSchema>;
