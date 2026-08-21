'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';

interface DesktopFooterProps {
  categories?: { id: string; name: string }[];
  brands?: { id: string; name: string }[];
}

export function DesktopFooter({ categories: propCategories = [], brands = [] }: DesktopFooterProps) {
  const [categories, setCategories] = useState(propCategories);

  // Fetch categories if not passed as props
  useEffect(() => {
    if (propCategories.length === 0) {
      fetch('/api/public/catalog', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => setCategories(d.categories ?? []))
        .catch(() => {});
    }
  }, [propCategories.length]);
  return (
    <footer className="hidden md:block">
      {/* Trust bar — above footer */}
      <div className="bg-[#006872] px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-around gap-4 text-white">
          {[
            { icon: 'local_shipping', label: 'FREE SHIPPING' },
            { icon: 'credit_card', label: 'ONLINE PAYMENT' },
            { icon: 'support_agent', label: '24/7 SUPPORT' },
            { icon: 'security', label: '100% SAFE' },
            { icon: 'undo', label: 'FREE RETURNS' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <Icon name={item.icon} className="text-[24px]" />
              <span className="text-[13px] font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-[#1b1c1c] px-4 py-10 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.webp" alt="Balaji Medical Store" className="h-10 w-auto" loading="lazy" />
            </div>
            <p className="mt-3 text-[12px] leading-5 text-white/60">
              Your trusted online pharmacy for medicines, lab tests, and healthcare products. Quality medicines delivered to your doorstep.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Facebook">
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Instagram">
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Twitter">
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wide">Quick Links</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/products" className="text-[12px] text-white/60 hover:text-white">All Products</Link></li>
              <li><Link href="/categories" className="text-[12px] text-white/60 hover:text-white">Categories</Link></li>
              <li><Link href="/brands" className="text-[12px] text-white/60 hover:text-white">Brands</Link></li>
              <li><Link href="/lab-tests" className="text-[12px] text-white/60 hover:text-white">Lab Tests</Link></li>
              <li><Link href="/health-concerns" className="text-[12px] text-white/60 hover:text-white">Health Concerns</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wide">Categories</h3>
            <ul className="mt-3 space-y-2">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.id}`} className="text-[12px] text-white/60 hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wide">Contact Us</h3>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2 text-[12px] text-white/60">
                <Icon name="phone" className="text-[16px]" />
                +1 555-1234
              </li>
              <li className="flex items-center gap-2 text-[12px] text-white/60">
                <Icon name="email" className="text-[16px]" />
                support@balajimedical.com
              </li>
              <li className="flex items-center gap-2 text-[12px] text-white/60">
                <Icon name="location_on" className="text-[16px]" />
                Main Street, Your City
              </li>
              <li className="flex items-center gap-2 text-[12px] text-white/60">
                <Icon name="schedule" className="text-[16px]" />
                Open 24/7
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-4">
          <p className="text-center text-[11px] text-white/40">
            © {new Date().getFullYear()} Balaji Medical Store. All rights reserved. | Privacy Policy | Terms &amp; Conditions
          </p>
        </div>
      </div>
    </footer>
  );
}
