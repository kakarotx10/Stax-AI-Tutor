import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/src/lib/auth';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-h3 text-foreground">Stax AI Tutor</h1>
          <p className="mt-2 text-body-sm text-muted-foreground">Master CS, the gamified way.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 text-card-foreground shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
