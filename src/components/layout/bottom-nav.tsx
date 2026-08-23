'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';

const navItems = [
  { key: 'home', label: 'Home', href: '/', icon: 'home' },
  { key: 'categories', label: 'Categories', href: '/categories', icon: 'grid_view' },
  { key: 'cart', label: 'Cart', href: '/cart', icon: 'shopping_cart' },
  { key: 'orders', label: 'Orders', href: '/orders', icon: 'receipt_long' },
  { key: 'profile', label: 'Profile', href: '/profile', icon: 'person' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getActive = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/categories') || pathname.startsWith('/products') || pathname.startsWith('/lab-tests')) return 'categories';
    if (pathname.startsWith('/cart')) return 'cart';
    if (pathname.startsWith('/orders')) return 'orders';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const active = getActive();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-[#e2e8f0] bg-white px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden"
      aria-label="Bottom navigation"
    >
      {navItems.map(({ key, label, href, icon }) => {
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={href}
            className={`relative flex flex-col items-center justify-center rounded-2xl px-3 py-1 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-[#f0fdfa] text-[#006872]'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Icon
              name={icon}
              filled={isActive}
              className={`text-[22px] transition-transform duration-200 ${
                isActive ? 'text-[#006872] scale-105' : 'text-[#64748b]'
              }`}
            />
            <span
              className={`mt-0.5 text-[11px] leading-tight transition-colors ${
                isActive ? 'font-bold text-[#006872]' : 'font-medium text-[#64748b]'
              }`}
            >
              {label}
            </span>

            {/* Cart badge */}
            {key === 'cart' && mounted && cartCount > 0 && (
              <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[9.5px] font-extrabold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
