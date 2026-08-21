'use client';

import { useState, type ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Auth gate: kick non-admins to /admin/login
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/admin/login');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'manager') {
      router.replace('/');
    }
  }, [user, loading, router]);

  const onLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  // While loading or no user → show loading screen (content NOT rendered)
  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f3f3]">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#006872]/30 border-t-[#006872]" />
          <p className="text-[12px] text-[#6e797b]">
            {loading ? 'Loading admin workspace…' : 'Redirecting to login…'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-[100dvh] bg-[#f5f3f3] text-[#1b1c1c]">
      <AdminSidebar />

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#001f23]/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="flex h-full w-[280px] flex-col bg-[#006872] text-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-5">
              <span className="text-[18px] font-bold">Balaji Medical Store Admin</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                <Icon name="close" />
              </button>
            </div>
            <div className="overflow-y-auto px-3">
              <AdminSidebar />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-[248px]">
        {/* Topbar */}
        <header className="admin-topbar sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#e4e2e1] bg-[#fbf9f8] px-4 md:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-[#3e494a] hover:bg-[#f0eded] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin navigation"
            >
              <Icon name="menu" />
            </button>
            <div>
              <p className="text-[11px] uppercase tracking-[0.13em] text-[#6e797b]">Balaji Medical Store Admin</p>
              <h1 className="text-[18px] font-bold text-[#1b1c1c]">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="hidden items-center gap-2 rounded-full bg-[#f0eded] py-1.5 pl-1.5 pr-3 sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d9eeee] text-[11px] font-bold text-[#006872]">
                {(user.name ?? 'AD').slice(0, 2).toUpperCase()}
              </span>
              <span className="text-[12px] font-semibold">{user.name}</span>
              <Icon name="expand_more" className="text-[17px]" />
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg p-2 text-[#3e494a] hover:bg-[#f0eded]"
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <main className="admin-content mx-auto max-w-[1500px] p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}
