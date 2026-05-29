'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

function LoginForm() {
  const router = useRouter();
  const callbackUrl = useSearchParams().get('callbackUrl') ?? '/dashboard';
  const devDefaults = process.env.NODE_ENV === 'development';
  const [email, setEmail] = useState(devDefaults ? 'abc@abc.com' : '');
  const [password, setPassword] = useState(devDefaults ? '12345678' : '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error('Invalid email or password');
      return;
    }
    toast.success('Welcome back!');
    router.push(callbackUrl === '/' ? '/dashboard' : callbackUrl);
    router.refresh();
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-caption font-semibold uppercase text-primary">Welcome back</p>
        <h2 className="mt-2 text-h3 text-foreground">Sign in to Stax</h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Continue your learning dashboard and saved practice sessions.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-6 text-center text-body-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
          Sign up
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-body-sm text-muted-foreground">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
