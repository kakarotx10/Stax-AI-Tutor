import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitError } from '@/src/lib/errors';
import { RATE_LIMITS } from '@/src/lib/constants';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('ratelimit');

type LimiterKey = 'ai' | 'code' | 'evaluation' | 'auth' | 'default';

const limiters = new Map<LimiterKey, Ratelimit>();

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getLimiter(key: LimiterKey): Ratelimit | null {
  if (limiters.has(key)) return limiters.get(key)!;

  const redis = getRedis();
  if (!redis) return null;

  const limitPerMin: Record<LimiterKey, number> = {
    ai: RATE_LIMITS.AI_REQUESTS_PER_MIN,
    code: RATE_LIMITS.CODE_EXEC_PER_MIN,
    evaluation: RATE_LIMITS.EVALUATIONS_PER_MIN,
    auth: RATE_LIMITS.AUTH_PER_MIN,
    default: RATE_LIMITS.DEFAULT_PER_MIN,
  };

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limitPerMin[key], '1 m'),
    prefix: `stax:rl:${key}`,
    analytics: false,
  });
  limiters.set(key, limiter);
  return limiter;
}

export async function checkRateLimit(
  identifier: string,
  key: LimiterKey = 'default'
): Promise<void> {
  const limiter = getLimiter(key);
  if (!limiter) {
    log.warn('Upstash Redis not configured — rate limit disabled');
    return;
  }
  const { success, remaining, reset } = await limiter.limit(identifier);
  if (!success) {
    throw new RateLimitError(
      `Rate limit exceeded. Try again at ${new Date(reset).toISOString()}`
    );
  }
  log.debug({ identifier, key, remaining }, 'rate limit ok');
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}
