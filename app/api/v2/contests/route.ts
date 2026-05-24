import type { NextRequest } from 'next/server';
import { listContests } from '@/src/controllers/contest.controller';
import { ok, withErrorHandler } from '@/src/utils/apiResponse';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const filter = url.searchParams.get('status') as
    | 'upcoming'
    | 'live'
    | 'ended'
    | null;
  const data = await listContests(filter ?? undefined);
  return ok(data);
});
