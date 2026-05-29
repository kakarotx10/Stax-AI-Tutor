'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error?.message ?? 'Signup failed');
        setLoading(false);
        return;
      }

      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      setLoading(false);

      if (signInRes?.error) {
        toast.error('Signup ok, but auto-signin failed. Please log in.');
        router.push('/login');
        return;
      }

      toast.success('Welcome to Stax AI Tutor!');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Network error. Try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-caption font-semibold uppercase text-primary">Start learning</p>
        <h2 className="mt-2 text-h3 text-foreground">Create your account</h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Set up your workspace for AI-guided CS practice.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            Full name
          </Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="mt-1 text-caption text-muted-foreground">
            Min 8 chars, with uppercase, lowercase, and a number.
          </p>
        </div>
        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Sign up
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-6 text-center text-body-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </>
  );
}
