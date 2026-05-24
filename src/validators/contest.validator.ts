import { z } from 'zod';

export const joinContestSchema = z.object({
  contestId: z.string().min(1),
});

export const contestSubmitSchema = z.object({
  contestId: z.string().min(1),
  problemId: z.string().min(1),
  code: z.string().min(1),
  language: z.enum(['python', 'cpp', 'java']),
});

export type JoinContestDto = z.infer<typeof joinContestSchema>;
export type ContestSubmitDto = z.infer<typeof contestSubmitSchema>;
