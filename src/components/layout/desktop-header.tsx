'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth/auth-context';

interface DesktopHeaderProps {
  categories?: { id: string; name: string; icon: string; tint: string; imageUrl?: string }[];
}

export function DesktopHeader({ categories = [] }: DesktopHeaderProps) {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTab: 'medicine' | 'lab' = pathname.startsWith('/lab-tests') ? 'lab' : 'medicine';

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      const target = activeTab === 'lab' ? '/lab-tests' : '/products';
      router.push(`${target}?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const navItems = [
    { label: 'All Medicines', href: '/products' },
    { label: 'Lab Tests', href: '/lab-tests' },
    { label: 'Covid Essentials', href: '/products?category=cat-healthcare' },
    { label: 'Winter Care', href: '/products?category=cat-winter-care' },
    { label: 'Personal Care', href: '/products?category=cat-skin-care' },
    { label: 'Diabetes', href: '/products?category=cat-diabetes' },
    { label: 'Fitness & Supplements', href: '/products?category=cat-supplements' },
    { label: 'Healthcare Devices', href: '/products?category=cat-healthcare' },
    { label: 'Ayurveda', href: '/products?category=cat-ayurveda' },
    { label: 'Homeopathy', href: '/products?category=cat-homeopathy' },
  ];

  return (
    <header className="hidden w-full md:block">
      {/* ─── Main header bar ─── */}
      <div className="border-b border-[#e4e2e1] bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo.webp" alt="Balaji Medical Store" className="h-10 w-auto" loading="eager" />
          </Link>

          {/* Search bar — hidden on mobile, shown on tablet+ */}
          <form onSubmit={onSearch} className="hidden flex-1 md:block">
            <div className="flex items-center rounded-lg border border-[#bdc9ca] bg-[#f5f3f3] focus-within:border-[#006872] focus-within:bg-white">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-transparent py-2 pl-4 pr-2 text-[13px] outline-none"
                placeholder={activeTab === 'lab' ? 'Search for Lab Tests and Packages' : 'Search for Medicine and Health Products'}
              />
              <button
                type="submit"
                className="m-1 flex shrink-0 items-center justify-center rounded-md bg-[#006872] p-2 text-white hover:bg-[#00535b]"
                aria-label="Search"
              >
                <Icon name="search" className="text-[16px]" />
              </button>
            </div>
          </form>

          {/* Spacer for mobile to push login/cart to right */}
          <div className="flex-1 md:hidden" />

          {/* Login/Cart */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={user ? '/profile' : '/login'}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-bold text-[#3e494a] hover:bg-[#f5f3f3] md:px-3"
            >
              <Icon name="person" className="text-[20px]" />
              <span className="hidden md:inline">{user ? user.name?.split(' ')[0] : 'Login'}</span>
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-bold text-[#3e494a] hover:bg-[#f5f3f3] md:px-3"
            >
              <Icon name="shopping_cart" className="text-[20px]" />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#fc5d59] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar — below the logo row */}
        <form onSubmit={onSearch} className="mt-2 md:hidden">
          <div className="flex items-center rounded-lg border border-[#bdc9ca] bg-[#f5f3f3] focus-within:border-[#006872] focus-within:bg-white">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent py-2 pl-4 pr-2 text-[13px] outline-none"
              placeholder={activeTab === 'lab' ? 'Search Lab Tests...' : 'Search Medicine...'}
            />
            <button
              type="submit"
              className="m-1 flex shrink-0 items-center justify-center rounded-md bg-[#006872] p-1.5 text-white"
              aria-label="Search"
            >
              <Icon name="search" className="text-[16px]" />
            </button>
          </div>
        </form>
      </div>

      {/* ─── Navigation menu ─── */}
      <div className="border-b border-[#e4e2e1] bg-white">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className="flex shrink-0 items-center gap-1.5 bg-[#006872] px-3 py-2.5 text-[11px] font-bold text-white md:px-4 md:text-[12px]"
          >
            <Icon name="menu" className="text-[18px]" />
            <span className="hidden sm:inline">All Categories</span>
            <Icon name="expand_more" className="text-[18px]" />
          </button>
          <nav className="hidden flex-1 items-center overflow-x-auto no-scrollbar md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap px-3 py-2.5 text-[12px] font-semibold text-[#3e494a] hover:text-[#006872]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Mobile: horizontal scroll nav */}
          <nav className="flex flex-1 items-center overflow-x-auto no-scrollbar md:hidden">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap px-2 py-2.5 text-[11px] font-semibold text-[#3e494a] hover:text-[#006872]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Categories dropdown */}
        {showCategories && categories.length > 0 && (
          <div className="absolute z-50 w-64 border border-[#e4e2e1] bg-white shadow-lg">
            <div className="max-h-96 overflow-y-auto fancy-scroll">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  onClick={() => setShowCategories(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold text-[#3e494a] hover:bg-[#d9eeee]"
                >
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" loading="lazy" decoding="async" className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded" style={{ background: c.tint }}>
                      <Icon name={c.icon} className="text-[14px] text-[#006872]" />
                    </div>
                  )}
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
