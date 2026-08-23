'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard' },
      { label: 'Analytics & Reports', icon: 'analytics', href: '/admin/reports' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', icon: 'inventory_2', href: '/admin/products' },
      { label: 'Categories', icon: 'category', href: '/admin/categories' },
      { label: 'Brands', icon: 'storefront', href: '/admin/brands' },
      { label: 'Health Concerns', icon: 'health_and_safety', href: '/admin/health-concerns' },
      { label: 'Offers', icon: 'local_offer', href: '/admin/offers' },
      { label: 'Banners', icon: 'view_carousel', href: '/admin/banners' },
      { label: 'Lab Packages', icon: 'science', href: '/admin/lab-packages' },
      { label: 'Lab Tests', icon: 'biotech', href: '/admin/lab-tests' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Orders', icon: 'receipt_long', href: '/admin/orders' },
      { label: 'Medicine Orders', icon: 'medication', href: '/admin/medicine-orders' },
      { label: 'Lab Testing Orders', icon: 'science', href: '/admin/lab-orders' },
      { label: 'Transactions', icon: 'payments', href: '/admin/transactions' },
      { label: 'Support Tickets', icon: 'support_agent', href: '/admin/support' },
      { label: 'Reviews', icon: 'reviews', href: '/admin/reviews' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Users', icon: 'group', href: '/admin/users' },
      { label: 'Employees', icon: 'badge', href: '/admin/employees' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#006872] text-white lg:flex">
      <div className="border-b border-white/15 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 shrink-0 items-center rounded-md bg-white px-2 shadow-sm">
            <img src="/logo.webp" alt="Balaji Medical Store" className="h-6 w-auto object-contain" />
          </div>
          <span className="whitespace-nowrap rounded bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#92f1fe]">
            Admin Portal
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5 fancy-scroll">
        {navGroups.map((group) => (
          <div className="mb-6" key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#92f1fe]/75">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ label, icon, href }) => {
                const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${
                      isActive
                        ? 'bg-white font-bold text-[#006872]'
                        : 'text-white/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon name={icon} className="text-[19px]" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/15 p-3">
        <Link
          href="/admin/settings"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/85 transition hover:bg-white/10"
        >
          <Icon name="settings" className="text-[19px]" />
          System Settings
        </Link>
        <Link
          href="/"
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/85 transition hover:bg-white/10"
        >
          <Icon name="logout" className="text-[19px]" />
          Exit to store
        </Link>
      </div>
    </aside>
  );
}
