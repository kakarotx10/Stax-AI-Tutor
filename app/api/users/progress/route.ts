import type { NextRequest } from 'next/server';
import { requireAuth } from '@/src/middleware/auth.middleware';
import { upsertProgress } from '@/src/controllers/user.controller';
import { ok, withErrorHandler } from '@/src/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await requireAuth();
  const body = await req.json();
  const progress = await upsertProgress(user.id, body);
  return ok(progress);
});
