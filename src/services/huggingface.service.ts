import {
  verifyQuestionWithDeepSeek as _verify,
  isHuggingFaceConfigured,
} from '@/lib/huggingface';
import { ExternalServiceError } from '@/src/lib/errors';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('huggingface');

export const huggingfaceService = {
  isConfigured: isHuggingFaceConfigured,

  verifyQuestion: async (
    ...args: Parameters<typeof _verify>
  ): Promise<ReturnType<typeof _verify>> => {
    if (!isHuggingFaceConfigured()) {
      throw new ExternalServiceError(
        'HuggingFace',
        'HUGGINGFACE_API_KEY not configured'
      );
    }
    try {
      return await _verify(...args);
    } catch (err) {
      log.error({ err }, 'huggingface verify failed');
      throw new ExternalServiceError(
        'HuggingFace',
        err instanceof Error ? err.message : 'verification failed'
      );
    }
  },
};

export type HuggingFaceService = typeof huggingfaceService;
