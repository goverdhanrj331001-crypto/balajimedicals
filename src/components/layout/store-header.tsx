'use client';

import { useState } from 'react';
import Link from 'next/link';
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
      {/* Sticky search bar only — stays on scroll */}
      {search && (
        <div className="sticky top-0 z-50 w-full bg-white px-3 pt-2 pb-2 shadow-sm md:hidden">
          <form onSubmit={onSearch} className="flex items-center rounded-full border border-[#bdc9ca] bg-[#f5f3f3] focus-within:ring-2 focus-within:ring-[#75d5e2]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent py-2 pl-4 pr-2 text-[14px] text-[#1b1c1c] outline-none placeholder:text-[#6e797b]"
              placeholder={activeTab === 'lab' ? 'Search for Lab Tests and Packages' : 'Search for Medicine and Health Products'}
            />
            <button type="submit" aria-label="Search" className="mr-2 shrink-0 text-[#6e797b]">
              <Icon name="search" />
            </button>
          </form>
        </div>
      )}

      {/* Medicine / Lab Test toggle — NOT sticky, scrolls away */}
      {showToggle && (
        <div className="px-3 pb-3 md:hidden">
          <div className="flex rounded-full bg-[#006872] p-1">
            <button
              type="button"
              onClick={() => switchTab('medicine')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold transition ${
                activeTab === 'medicine'
                  ? 'bg-white text-[#006872] shadow'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              <Icon name="medication" className="text-[16px]" />
              Medicine
            </button>
            <button
              type="button"
              onClick={() => switchTab('lab')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold transition ${
                activeTab === 'lab'
                  ? 'bg-white text-[#006872] shadow'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              <Icon name="science" className="text-[16px]" />
              Lab Test
            </button>
          </div>
        </div>
      )}
    </>
  );
}
