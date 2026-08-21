'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import type { Brand } from '@/types';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">All Brands</h1>
        <p className="mt-1 text-[13px] text-[#3e494a]">
          {loading ? 'Loading…' : `${brands.length} brands available`}
        </p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${encodeURIComponent(b.name)}`}
                className="soft-card group overflow-hidden rounded-xl transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-white p-4">
                  {b.logo || b.imageUrl ? (
                    <img
                      src={b.logo || b.imageUrl}
                      alt={b.name}
                      className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d9eeee] text-[20px] font-bold text-[#006872]">
                      {b.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="border-t border-[#f0eded] p-3 text-center">
                  <p className="text-[13px] font-bold text-[#1b1c1c]">{b.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
