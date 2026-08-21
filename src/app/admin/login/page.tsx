'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@medidemo.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin' && user.role !== 'manager') {
        setError('Access denied. Admin privileges required.');
        return;
      }
      router.push('/admin/dashboard');
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login flex min-h-[100dvh] items-center justify-center bg-[#f5f3f3] p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden min-h-[560px] flex-col justify-between bg-[#006872] p-10 text-white md:flex">
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo.webp" alt="Balaji Medical Store" className="h-12 w-auto" />
            </div>
            <h1 className="mt-24 max-w-xs text-[34px] font-extrabold leading-tight">
              Care operations, clearly in view.
            </h1>
            <p className="mt-4 max-w-sm text-[14px] leading-6 text-white/75">
              A trusted admin workspace for teams managing medicines, lab testing, and patient support.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 text-[11px] text-white/80">
            <p className="font-bold text-white">Demo credentials</p>
            <p className="mt-1">Email: <code className="rounded bg-white/10 px-1">admin@medidemo.com</code></p>
            <p>Password: <code className="rounded bg-white/10 px-1">admin123</code></p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-10 md:hidden">
            <p className="text-[20px] font-extrabold text-[#006872]">Balaji Medical Store Admin</p>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#6e797b]">Secure workspace</p>
          <h2 className="mt-2 text-[26px] font-extrabold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-[13px] text-[#3e494a]">Sign in to continue to the admin portal.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                placeholder="admin@medidemo.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                placeholder="••••••••"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-[#fff4f2] p-3 text-[12px] font-semibold text-[#910816]">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#006872] py-3 text-[12px] font-bold text-white shadow-sm hover:bg-[#00535b] disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Sign In <Icon name="arrow_forward" className="text-[17px]" />
                </>
              )}
            </button>
          </form>

          <Link
            href="/"
            className="mt-7 flex w-full items-center justify-center gap-2 text-[12px] font-bold text-[#006872]"
          >
            <Icon name="arrow_back" className="text-[17px]" /> Back to Balaji Medical Store store
          </Link>
        </div>
      </div>
    </div>
  );
}
