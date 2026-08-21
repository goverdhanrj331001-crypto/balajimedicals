'use client';

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

  const getActive = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/categories') || pathname.startsWith('/products') || pathname.startsWith('/lab-tests')) return 'categories';
    if (pathname.startsWith('/cart')) return 'cart';
    if (pathname.startsWith('/orders')) return 'orders';
    if (pathname.startsWith('/profile') || pathname.startsWith('/prescriptions')) return 'profile';
    return 'home';
  };

  const active = getActive();

  return (
    <nav
      className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t border-[#bdc9ca] bg-[#f5f3f3] px-1 shadow-[0_-2px_10px_rgba(0,0,0,.05)] md:hidden"
      aria-label="Bottom navigation"
    >
      {navItems.map(({ key, label, href, icon }) => {
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={href}
            className={`relative flex min-w-[56px] flex-col items-center justify-center rounded-full px-2 py-1 transition active:scale-95 ${
              isActive ? 'bg-[#fc5d59] text-[#600009]' : 'text-[#3e494a] hover:text-[#006872]'
            }`}
          >
            <Icon name={icon} filled={isActive} className="text-[22px]" />
            <span className="mt-0.5 text-[10px] font-bold leading-[12px]">{label}</span>
            {/* Cart badge */}
            {key === 'cart' && cartCount > 0 && (
              <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b3272a] px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
