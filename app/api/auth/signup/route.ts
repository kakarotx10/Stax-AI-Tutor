import type { NextRequest } from 'next/server';
import { signup } from '@/src/controllers/auth.controller';
import { created, withErrorHandler } from '@/src/utils/apiResponse';
import { checkRateLimit, getClientIp } from '@/src/middleware/rateLimit.middleware';

export const POST = withErrorHandler(async (req: NextRequest) => {
  await checkRateLimit(getClientIp(req), 'auth');
  const body = await req.json();
  const user = await signup(body);
  return created(user);
});
