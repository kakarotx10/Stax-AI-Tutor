import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { AuthError, ForbiddenError } from '@/src/lib/errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name,
    role: session.user.role,
  };
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError('Authentication required');
  return user;
}

export async function requireRole(role: string): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new ForbiddenError(`Requires role: ${role}`);
  }
  return user;
}
