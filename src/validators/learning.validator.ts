import { z } from 'zod';

export const learningContentSchema = z.object({
  subject: z.string().min(1),
  unit: z.string().min(1),
  concept: z.string().optional(),
});

export type LearningContentDto = z.infer<typeof learningContentSchema>;
