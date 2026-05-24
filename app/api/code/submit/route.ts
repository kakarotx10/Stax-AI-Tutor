import type { NextRequest } from 'next/server';
import { requireAuth } from '@/src/middleware/auth.middleware';
import { checkRateLimit } from '@/src/middleware/rateLimit.middleware';
import { submit } from '@/src/controllers/code.controller';
import { created, withErrorHandler } from '@/src/utils/apiResponse';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await requireAuth();
  await checkRateLimit(user.id, 'code');
  const body = await req.json();
  const result = await submit(user.id, body);
  return created(result);
});
