'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const { data: session, status } = useSession();
  const profile = useAuthStore((s) => s.profile);

  return {
    user: session?.user ?? null,
    profile,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    signIn,
    signOut: () => signOut({ callbackUrl: '/login' }),
  };
}
