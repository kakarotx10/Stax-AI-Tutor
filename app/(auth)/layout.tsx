import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { BrandLogo, BrandMark } from '@/components/BrandLogo';
import { authOptions } from '@/src/lib/auth';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect('/dashboard');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="subtle-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 text-caption font-semibold uppercase text-muted-foreground shadow-soft backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-primary" />
            Interview-ready learning
          </div>
          <div className="mt-6">
            <BrandLogo wordmarkClassName="h-10 w-40" />
          </div>
          <h1 className="mt-6 max-w-xl text-display text-foreground">
            Learn, practice, and track progress in one calm workspace.
          </h1>
          <p className="mt-5 max-w-lg text-body-lg text-muted-foreground">
            Stax combines structured CS paths, AI practice, and competition loops with a focused SaaS interface.
          </p>
          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="surface-panel p-4">
              <BrandMark className="h-5 w-5" />
              <p className="mt-3 text-sm font-semibold text-foreground">Structured curriculum</p>
              <p className="mt-1 text-body-sm text-muted-foreground">Domain-based paths for frontend, backend, DSA, and AI.</p>
            </div>
            <div className="surface-panel p-4">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="mt-3 text-sm font-semibold text-foreground">Progress continuity</p>
              <p className="mt-1 text-body-sm text-muted-foreground">Saved attempts, weak topics, and practice history.</p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="mb-6 text-center lg:hidden">
            <BrandLogo className="justify-center" wordmarkClassName="h-10 w-40" />
            <p className="mt-2 text-body-sm text-muted-foreground">Master CS, the gamified way.</p>
          </div>
          <div className="surface-card p-6 sm:p-8">
          {children}
          </div>
        </div>
      </div>
    </div>
  );
}
