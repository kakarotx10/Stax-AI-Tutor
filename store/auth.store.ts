import { create } from 'zustand';

export interface AuthUserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  stats?: {
    xp: number;
    streak: number;
    rank: number;
    totalSolved: number;
  };
  subscription?: {
    plan: string;
    expiresAt?: string;
  };
}

interface AuthState {
  profile: AuthUserProfile | null;
  isLoading: boolean;
  setProfile: (profile: AuthUserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: false,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, isLoading: false }),
}));
