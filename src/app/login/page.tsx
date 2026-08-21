'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = params.get('redirect') ?? '/';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(email, password);
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        if (!name.trim()) throw new Error('Please enter your name');
        const user = await signup(email, password, name);
        toast.success(`Welcome to Balaji Medical Store, ${user.name}!`);
      }
      router.push(redirect);
    } catch (e: any) {
      setError(e.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-6">
        <div className="mx-auto max-w-md">
          <div className="soft-card rounded-2xl p-6">
            {/* Toggle */}
            <div className="mb-6 flex rounded-lg bg-[#f0eded] p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 rounded-md py-2 text-[12px] font-bold transition ${
                  mode === 'login' ? 'bg-white text-[#006872] shadow' : 'text-[#6e797b]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-md py-2 text-[12px] font-bold transition ${
                  mode === 'signup' ? 'bg-white text-[#006872] shadow' : 'text-[#6e797b]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <h1 className="text-[20px] font-extrabold tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="mt-1 text-[13px] text-[#3e494a]">
              {mode === 'login'
                ? 'Login to track orders, upload prescriptions, and check out faster.'
                : 'Join Balaji Medical Store to order medicines and book lab tests.'}
            </p>

            <form className="mt-5 space-y-3" onSubmit={onSubmit}>
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Full Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                />
              </label>

              {error && (
                <p className="rounded-lg bg-[#fff4f2] p-3 text-[11px] font-semibold text-[#910816]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#006872] py-3 text-[13px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    {mode === 'login' ? 'Login' : 'Create Account'}
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-5 rounded-lg bg-[#f5f3f3] p-3 text-[11px] text-[#6e797b]">
              <p className="font-bold text-[#3e494a]">Demo customer account:</p>
              <p className="mt-1">Email: <code className="rounded bg-white px-1">user@medidemo.com</code></p>
              <p>Password: <code className="rounded bg-white px-1">user123</code></p>
            </div>

            <Link
              href="/admin/login"
              className="mt-4 flex items-center justify-center gap-1 text-[11px] font-bold text-[#006872]"
            >
              <Icon name="admin_panel_settings" className="text-[14px]" /> Admin login
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}


export default function LoginPage(props: any) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" /></div>}>
      <LoginPageInner {...props} />
    </Suspense>
  );
}
