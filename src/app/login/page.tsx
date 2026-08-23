'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
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
    <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
      <DesktopHeader />
      <StoreHeader search={false} />

      <main className="mx-auto max-w-7xl px-4 md:px-8 py-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
        {/* Extra large container: max-w-6xl, min-h-[640px] */}
        <div className="w-full max-w-md md:max-w-6xl overflow-hidden rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl md:grid md:grid-cols-12 min-h-[640px]">
          
          {/* ─── Left Column (ONLY Image, NO text) — 6 of 12 cols ─── */}
          <div className="hidden md:block md:col-span-6 relative h-full w-full overflow-hidden bg-[#006872]/5 min-h-[640px]">
            <img
              src="/promo-trust.jpg"
              alt="Balaji Medical Store Healthcare Trust"
              className="h-full w-full object-cover"
            />
          </div>

          {/* ─── Right Form Column — 6 of 12 cols ─── */}
          <div className="p-8 sm:p-12 lg:p-16 md:col-span-6 flex flex-col justify-center min-h-[640px]">
            {/* Toggle Switch */}
            <div className="mb-8 flex rounded-2xl bg-[#f1f5f9] p-1.5 border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 rounded-xl py-3.5 text-[15px] font-bold transition-all duration-200 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#006872] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-xl py-3.5 text-[15px] font-bold transition-all duration-200 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#006872] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <h1 className="text-[28px] md:text-[32px] font-black tracking-tight text-[#0f172a]">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="mt-2 text-[14px] text-[#64748b] leading-relaxed">
              {mode === 'login'
                ? 'Login to track orders, upload prescriptions, and check out faster.'
                : 'Join Balaji Medical Store to order medicines and book lab tests.'}
            </p>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-2 block text-[13px] font-bold text-[#334155]">Full Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-2xl border border-[#cbd5e1] bg-white px-4 py-3.5 text-[14px] text-[#0f172a] outline-none focus:border-[#006872] focus:ring-2 focus:ring-[#006872]/15 shadow-2xs placeholder:text-[#94a3b8]"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#334155]">Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-[#cbd5e1] bg-white px-4 py-3.5 text-[14px] text-[#0f172a] outline-none focus:border-[#006872] focus:ring-2 focus:ring-[#006872]/15 shadow-2xs placeholder:text-[#94a3b8]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#334155]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-[#cbd5e1] bg-white px-4 py-3.5 text-[14px] text-[#0f172a] outline-none focus:border-[#006872] focus:ring-2 focus:ring-[#006872]/15 shadow-2xs placeholder:text-[#94a3b8]"
                />
              </label>

              {error && (
                <p className="rounded-2xl bg-[#fef2f2] p-4 text-[13px] font-semibold text-[#ef4444] border border-[#fecaca]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#006872] py-4 text-[15px] font-extrabold text-white shadow-md hover:bg-[#00535b] transition cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
                    <Icon name="arrow_forward" className="text-[18px]" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>

      <DesktopFooter />
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
