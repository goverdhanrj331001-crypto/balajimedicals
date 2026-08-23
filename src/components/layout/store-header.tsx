'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth/auth-context';

interface StoreHeaderProps {
  search?: boolean;
  /** Show the Medicine/Lab Test toggle switch below the search bar */
  showToggle?: boolean;
}

export function StoreHeader({ search = true, showToggle = false }: StoreHeaderProps) {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');

  const activeTab: 'medicine' | 'lab' = pathname.startsWith('/lab-tests') ? 'lab' : 'medicine';

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      const target = activeTab === 'lab' ? '/lab-tests' : '/products';
      router.push(`${target}?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const switchTab = (tab: 'medicine' | 'lab') => {
    if (tab === 'lab') {
      router.push('/lab-tests');
    } else {
      router.push('/products');
    }
  };

  return (
    <>
      {/* ─── 1. STICKY Search Bar (Clean & seamless, no dividing line) ─── */}
      {search && (
        <header className="sticky top-0 z-50 w-full bg-white px-3.5 pt-2.5 pb-1 md:hidden">
          <form
            onSubmit={onSearch}
            className="flex items-center rounded-full border border-[#cbd5e1] bg-white px-3.5 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all focus-within:border-[#006872] focus-within:ring-2 focus-within:ring-[#006872]/15"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-[13.5px] font-medium text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
              placeholder={
                activeTab === 'lab'
                  ? 'Search for Lab Tests and Health Packages...'
                  : 'Search for Medicine and Health Products...'
              }
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ('')}
                className="mr-1 text-[#94a3b8] hover:text-[#0f172a] text-[13px]"
              >
                ✕
              </button>
            ) : null}
            <button
              type="submit"
              aria-label="Search"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#006872] hover:bg-[#f0fdfa] transition cursor-pointer"
            >
              <Icon name="search" className="text-[20px]" />
            </button>
          </form>
        </header>
      )}

      {/* ─── 2. NON-STICKY Medicine / Lab Test Toggle (Seamless continuation) ─── */}
      {showToggle && (
        <div className="w-full bg-white px-3.5 pt-1.5 pb-3 md:hidden">
          <div className="flex rounded-full bg-[#f1f5f9] p-1 border border-[#e2e8f0] shadow-2xs">
            <button
              type="button"
              onClick={() => switchTab('medicine')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-[12.5px] font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'medicine'
                  ? 'bg-white text-[#006872] shadow-xs border border-[#e2e8f0]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Icon
                name="medication"
                className={`text-[17px] ${activeTab === 'medicine' ? 'text-[#006872]' : 'text-[#64748b]'}`}
              />
              <span>Medicine</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('lab')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-[12.5px] font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'lab'
                  ? 'bg-white text-[#006872] shadow-xs border border-[#e2e8f0]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Icon
                name="science"
                className={`text-[17px] ${activeTab === 'lab' ? 'text-[#006872]' : 'text-[#64748b]'}`}
              />
              <span>Lab Test</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
