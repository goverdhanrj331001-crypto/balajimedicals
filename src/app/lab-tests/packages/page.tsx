'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import type { LabPackage } from '@/types';

export default function LabPackagesPage() {
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setPackages(d.labPackages ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <Link href="/lab-tests" className="mb-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#006872]">
          <Icon name="arrow_back" className="text-[16px]" /> Back to Lab Tests
        </Link>
        <h1 className="text-[24px] font-extrabold tracking-tight">Health Packages</h1>
        <p className="mt-1 text-[13px] text-[#3e494a]">Comprehensive health checkup packages at discounted prices.</p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {packages.map((p) => (
              <div key={p.id} className="soft-card overflow-hidden rounded-xl">
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-[#f5f3f3]">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon name={p.icon} className="text-[48px] text-[#bdc9ca]" />
                    </div>
                  )}
                  {p.badge && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#fc5d59] px-2 py-1 text-[10px] font-bold text-[#600009]">
                      {p.badge}
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-[18px] font-bold">{p.name}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#3e494a]">{p.detail}</p>
                  <div className="mt-4 flex items-end justify-between border-t border-[#f0eded] pt-3">
                    <div>
                      <p className="text-[11px] text-[#6e797b]">Starting from</p>
                      <span className="text-[22px] font-extrabold">${Number(p.price).toFixed(2)}</span>
                    </div>
                    <Link
                      href={`/lab-tests/schedule?pkg=${p.id}`}
                      className="rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#00535b]"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
