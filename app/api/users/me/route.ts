import { requireAuth } from '@/src/middleware/auth.middleware';
import { getProfile } from '@/src/controllers/user.controller';
import { ok, withErrorHandler } from '@/src/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  return ok(profile);
});
