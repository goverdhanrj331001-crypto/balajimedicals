'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="admin-login min-h-screen w-full bg-white flex flex-col md:grid md:grid-cols-12 overflow-hidden">
      
      {/* ─── Left Column: Edge-to-Edge Full Height Image (6 of 12 cols) ─── */}
      <div className="hidden md:block md:col-span-6 relative h-full w-full bg-[#006872]/5">
        <img
          src="/promo-fast-delivery.jpg"
          alt="Balaji Medical Store Admin Operations"
          className="h-full w-full object-cover"
        />
      </div>

      {/* ─── Right Column: Full Screen Form (6 of 12 cols) ─── */}
      <div className="flex-1 md:col-span-6 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-10 bg-white min-h-screen">
        <div className="w-full max-w-lg mx-auto">
          
          <div className="mb-6 md:hidden">
            <p className="text-[24px] font-black text-[#006872]">Balaji Medical Store Admin</p>
          </div>

          <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#006872]">Authorized Portal</span>
          <h1 className="mt-1 text-[32px] md:text-[38px] font-black tracking-tight text-[#0f172a]">Admin Login</h1>
          <p className="mt-2 text-[14px] text-[#64748b] leading-relaxed">Sign in with your admin credentials to enter workspace.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[13px] font-bold text-[#334155]">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#cbd5e1] bg-white px-4 py-3.5 text-[14.5px] text-[#0f172a] outline-none focus:border-[#006872] focus:ring-2 focus:ring-[#006872]/15 shadow-2xs placeholder:text-[#94a3b8]"
                placeholder="admin@yourdomain.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-bold text-[#334155]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-[#cbd5e1] bg-white px-4 py-3.5 text-[14.5px] text-[#0f172a] outline-none focus:border-[#006872] focus:ring-2 focus:ring-[#006872]/15 shadow-2xs placeholder:text-[#94a3b8]"
                placeholder="••••••••"
                required
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
                  <span>Sign In to Admin Workspace</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#f1f5f9]">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-[13.5px] font-bold text-[#006872] hover:text-[#00535b] transition"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Balaji Medical Store</span>
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
