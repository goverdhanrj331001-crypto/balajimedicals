'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import type { LabPackage, LabTest } from '@/types';

export default function LabTestsPage() {
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setPackages(d.labPackages ?? []);
        setTests(d.labTests ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">Lab Tests</h1>
        <p className="mt-1 text-[13px] text-[#3e494a]">
          Book lab tests with home sample collection and digital reports.
        </p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <>
            {/* Lab packages */}
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[18px] font-bold">Health Packages</h2>
                <Link href="/lab-tests/packages" className="text-[12px] font-bold text-[#006872]">View All →</Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {packages.map((p) => (
                  <div key={p.id} className="soft-card overflow-hidden rounded-xl">
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#f5f3f3]">
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
                    <div className="p-4">
                      <h3 className="text-[15px] font-bold">{p.name}</h3>
                      <p className="mt-1 text-[12px] leading-5 text-[#3e494a]">{p.detail}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[18px] font-extrabold">${Number(p.price).toFixed(2)}</span>
                        <Link
                          href={`/lab-tests/schedule?pkg=${p.id}`}
                          className="rounded-lg bg-[#006872] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#00535b]"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
