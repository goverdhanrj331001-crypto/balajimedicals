'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth/auth-context';

interface DesktopHeaderProps {
  categories?: { id: string; name: string; icon: string; tint: string; imageUrl?: string }[];
}

export function DesktopHeader({ categories: initialCategories = [] }: DesktopHeaderProps) {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [mounted, setMounted] = useState(false);

  const navScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!navScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    if (initialCategories.length > 0) {
      setCategories(initialCategories);
    } else if (showCategories && categories.length === 0) {
      fetch('/api/public/catalog', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (d.categories) setCategories(d.categories);
        })
        .catch(() => {});
    }
  }, [initialCategories, showCategories, categories.length]);

  const activeTab: 'medicine' | 'lab' = pathname.startsWith('/lab-tests') ? 'lab' : 'medicine';

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      const target = activeTab === 'lab' ? '/lab-tests' : '/products';
      router.push(`${target}?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const scrollNav = (direction: 'left' | 'right') => {
    if (!navScrollRef.current) return;
    navScrollRef.current.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth',
    });
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
    <header className="hidden w-full md:block bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* ─── Top Row: Logo, Round Search Bar, User & Cart ─── */}
        <div className="flex items-center justify-between gap-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 transition hover:opacity-95">
            <img src="/logo.webp" alt="Balaji Medical Store" className="h-10 w-auto object-contain" loading="eager" />
          </Link>

          {/* Big, Prominent Search Bar with Round Shape */}
          <form onSubmit={onSearch} className="flex-1 mx-2 lg:mx-4">
            <div className="flex items-center rounded-full border border-[#cbd5e1] bg-[#f8fafc] transition-all focus-within:border-[#006872] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#006872]/15 shadow-2xs hover:border-[#94a3b8]">
              <div className="flex items-center pl-4 text-[#64748b]">
                <Icon name="search" className="text-[20px]" />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-transparent py-2.5 px-3 text-[14px] font-medium outline-none text-[#1e293b] placeholder:text-[#94a3b8]"
                placeholder={activeTab === 'lab' ? 'Search for Lab Tests and Health Packages...' : 'Search for Medicines, Health Products, Brands...'}
              />
              <button
                type="submit"
                className="m-1 flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#006872] px-5 py-2 text-[13px] font-bold text-white transition hover:bg-[#00535b] shadow-xs cursor-pointer active:scale-98"
                aria-label="Search"
              >
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Action Buttons: Book Lab Test, User & Cart */}
          <div className="flex shrink-0 items-center gap-2.5">
            {/* Book Lab Test Button */}
            <Link
              href="/lab-tests"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#006872] to-[#00838f] px-4 py-2 text-[13px] font-bold text-white shadow-xs transition-all hover:shadow-md hover:from-[#00535b] hover:to-[#006872] active:scale-98"
            >
              <Icon name="science" className="text-[19px] text-[#a7f3d0]" />
              <span>Book Lab Test</span>
            </Link>

            {/* Login / Profile */}
            <Link
              href={user ? '/profile' : '/login'}
              className="flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white px-3.5 py-2 text-[13px] font-bold text-[#334155] shadow-2xs transition-all hover:border-[#cbd5e1] hover:bg-[#f8fafc] hover:text-[#006872]"
            >
              <Icon name="person" className="text-[20px] text-[#64748b]" />
              <span>{user ? user.name?.split(' ')[0] : 'Login'}</span>
            </Link>

            {/* Modern Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 py-2 text-[13px] font-bold text-[#1e293b] shadow-2xs transition-all hover:border-[#006872]/40 hover:bg-[#f0fdfa] hover:text-[#006872]"
              aria-label={`Cart with ${cartCount} items`}
            >
              <div className="relative flex items-center justify-center">
                <Icon name="shopping_cart" className="text-[20px] text-[#006872]" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#006872] px-1 text-[11px] font-extrabold text-white shadow-xs ring-2 ring-white animate-in fade-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>
          </div>
        </div>

        {/* ─── Bottom Row: Categories with Left/Right Scroll Arrows (No bottom dividing line) ─── */}
        <div className="relative flex items-center gap-2 pb-3 pt-0.5">
          {/* Categories Button */}
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#006872] px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#00535b] shadow-2xs cursor-pointer active:scale-98"
          >
            <Icon name="menu" className="text-[17px]" />
            <span>All Categories</span>
            <Icon name={showCategories ? 'expand_less' : 'expand_more'} className="text-[17px]" />
          </button>

          {/* Left scroll arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollNav('left')}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-[#cbd5e1] text-[#006872] hover:bg-[#d9eeee] shadow-xs transition cursor-pointer"
              aria-label="Scroll categories left"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
          )}

          {/* Quick Nav Links with Smooth Horizontal Scroll */}
          <nav
            ref={navScrollRef}
            onScroll={checkScroll}
            className="flex flex-1 items-center overflow-x-auto no-scrollbar gap-1 scroll-smooth"
          >
            {navItems.map((item) => {
              const isLab = item.href === '/lab-tests';
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition ${
                    isLab
                      ? 'bg-[#e0f2f1] text-[#006872] hover:bg-[#ccfbf1] font-bold'
                      : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#006872]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right scroll arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollNav('right')}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-[#cbd5e1] text-[#006872] hover:bg-[#d9eeee] shadow-xs transition cursor-pointer"
              aria-label="Scroll categories right"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          )}

          {/* Categories Dropdown Menu */}
          {showCategories && categories.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
              <div className="max-h-96 overflow-y-auto fancy-scroll p-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.id}`}
                    onClick={() => setShowCategories(false)}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-[#334155] transition hover:bg-[#e6f4f5] hover:text-[#006872]"
                  >
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt="" loading="lazy" decoding="async" className="h-7 w-7 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: c.tint || '#e0f2f1' }}>
                        <Icon name={c.icon || 'category'} className="text-[16px] text-[#006872]" />
                      </div>
                    )}
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
