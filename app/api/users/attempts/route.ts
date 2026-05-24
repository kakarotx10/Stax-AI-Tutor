import type { NextRequest } from 'next/server';
import { requireAuth } from '@/src/middleware/auth.middleware';
import { createAttempt, listAttempts } from '@/src/controllers/attempt.controller';
import { created, ok, withErrorHandler } from '@/src/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await requireAuth();
  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const data = await listAttempts(user.id, query);
  return ok(data);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await requireAuth();
  const body = await req.json();
  const attempt = await createAttempt(user.id, body);
  return created(attempt);
});
