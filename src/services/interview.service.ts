import { InterviewEngine, type InterviewState } from '@/lib/interviewEngine';
import {
  generateAIFollowUp,
  generateCrossQuestion,
  generateCodeFeedback,
  type AIFollowUpRequest,
  type AIFollowUpResponse,
} from '@/lib/interviewAIHelper';
import { ExternalServiceError } from '@/src/lib/errors';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('interview');

async function wrap<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    log.error({ label, err }, 'interview AI call failed');
    throw new ExternalServiceError(
      'InterviewAI',
      err instanceof Error ? err.message : 'unknown interview AI error'
    );
  }
}

export const interviewService = {
  createEngine: (...args: ConstructorParameters<typeof InterviewEngine>) =>
    new InterviewEngine(...args),

  generateFollowUp: (req: AIFollowUpRequest): Promise<AIFollowUpResponse> =>
    wrap('followup', () => generateAIFollowUp(req)),

  generateCrossQuestion: (...args: Parameters<typeof generateCrossQuestion>) =>
    wrap('cross', () => generateCrossQuestion(...args)),

  generateCodeFeedback: (...args: Parameters<typeof generateCodeFeedback>) =>
    wrap('code-feedback', () => generateCodeFeedback(...args)),
};

export type InterviewService = typeof interviewService;
export type { InterviewState, AIFollowUpRequest, AIFollowUpResponse };
