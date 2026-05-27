import { getOrCreateUser } from '@/lib/database/userManagement';
import { requireAuth } from '@/src/middleware/auth.middleware';

export async function requireSessionUserId() {
  const user = await requireAuth();
  return user.id;
}

export async function requireSessionDatabaseUserId() {
  const user = await requireAuth();
  return getOrCreateUser(user.id);
}
