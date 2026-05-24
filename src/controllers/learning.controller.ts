import { geminiService } from '@/src/services/gemini.service';
import { learningContentSchema } from '@/src/validators/learning.validator';
import { ValidationError } from '@/src/lib/errors';

export async function getTheory(input: unknown) {
  const parsed = learningContentSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid theory request', parsed.error.flatten());
  }
  const { subject, unit } = parsed.data;
  return geminiService.generateTheory(subject, unit);
}

export async function getMCQs(input: unknown) {
  const parsed = learningContentSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid MCQ request', parsed.error.flatten());
  }
  const { subject, unit, concept } = parsed.data;
  if (!concept) throw new ValidationError('concept is required for MCQs');
  return geminiService.generateMCQs(subject, unit, concept);
}

export async function reinforce(concept: string, subject: string) {
  if (!concept || !subject) {
    throw new ValidationError('concept and subject required');
  }
  return geminiService.generateReinforcementMCQ(concept, subject);
}
