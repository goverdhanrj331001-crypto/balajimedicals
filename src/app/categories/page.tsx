'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">All Categories</h1>
        <p className="mt-1 text-[13px] text-[#3e494a]">
          {loading ? 'Loading…' : `${categories.length} categories available`}
        </p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="soft-card group rounded-xl p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ background: c.tint }}>
                      <Icon name={c.icon} className="text-[42px] text-[#006872] transition group-hover:scale-110" />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-[13px] font-bold">{c.name}</p>
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
