'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import type { HealthConcern } from '@/types';

export default function HealthConcernsPage() {
  const [concerns, setConcerns] = useState<HealthConcern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setConcerns(d.healthConcerns ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">Shop by Health Concerns</h1>
        <p className="mt-1 text-[13px] text-[#3e494a]">
          {loading ? 'Loading…' : `${concerns.length} health concerns`}
        </p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {concerns.map((hc) => (
              <Link
                key={hc.id}
                href={`/products?concern=${encodeURIComponent(hc.name)}`}
                className="soft-card group overflow-hidden rounded-xl transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden">
                  {hc.imageUrl ? (
                    <img
                      src={hc.imageUrl}
                      alt={hc.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{ background: hc.tint }}
                    >
                      <Icon name={hc.icon} className="text-[48px] text-[#006872]" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-[13px] font-bold text-white">{hc.name}</p>
                  </div>
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
