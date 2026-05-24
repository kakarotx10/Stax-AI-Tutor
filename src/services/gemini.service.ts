import {
  generateTheory as _generateTheory,
  generateMCQs as _generateMCQs,
  generateCodingProblem as _generateCodingProblem,
  generateHint as _generateHint,
  reTeachConcept as _reTeachConcept,
  generatePersonalizedAssignment as _generatePersonalizedAssignment,
  generateGeminiResponse as _generateGeminiResponse,
  generateReinforcementMCQ as _generateReinforcementMCQ,
  getGeminiModel,
  getModelName,
} from '@/lib/gemini';
import { ExternalServiceError } from '@/src/lib/errors';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('gemini');

async function wrap<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const startedAt = Date.now();
  try {
    const result = await fn();
    log.info({ label, latencyMs: Date.now() - startedAt }, 'gemini call ok');
    return result;
  } catch (err) {
    log.error(
      { label, latencyMs: Date.now() - startedAt, err },
      'gemini call failed'
    );
    if (err instanceof Error && err.message.toLowerCase().includes('quota')) {
      throw new ExternalServiceError('Gemini', 'API quota exceeded');
    }
    throw new ExternalServiceError(
      'Gemini',
      err instanceof Error ? err.message : 'Unknown Gemini error'
    );
  }
}

export const geminiService = {
  generateTheory: (subject: string, unit: string) =>
    wrap('theory', () => _generateTheory(subject, unit)),

  generateMCQs: (subject: string, unit: string, concept: string) =>
    wrap('mcq', () => _generateMCQs(subject, unit, concept)),

  generateCodingProblem: (
    ...args: Parameters<typeof _generateCodingProblem>
  ) => wrap('coding', () => _generateCodingProblem(...args)),

  generateHint: (...args: Parameters<typeof _generateHint>) =>
    wrap('hint', () => _generateHint(...args)),

  reTeachConcept: (...args: Parameters<typeof _reTeachConcept>) =>
    wrap('reteach', () => _reTeachConcept(...args)),

  generatePersonalizedAssignment: (
    ...args: Parameters<typeof _generatePersonalizedAssignment>
  ) => wrap('assignment', () => _generatePersonalizedAssignment(...args)),

  generateReinforcementMCQ: (concept: string, subject: string) =>
    wrap('reinforcement-mcq', () => _generateReinforcementMCQ(concept, subject)),

  generateResponse: (prompt: string) =>
    wrap('raw', () => _generateGeminiResponse(prompt)),

  getModel: getGeminiModel,
  getModelName,
};

export type GeminiService = typeof geminiService;
