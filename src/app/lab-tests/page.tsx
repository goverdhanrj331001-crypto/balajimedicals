'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import type { LabPackage, LabTest, Banner } from '@/types';

interface Catalog {
  labPackages: LabPackage[];
  labTests: LabTest[];
  banners?: Banner[];
}

export default function LabTestsPage() {
  const [data, setData] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const packages = data?.labPackages ?? [];
  const tests = data?.labTests ?? [];
  const banner = data?.banners?.find((b) => b.slot === 'products') ?? data?.banners?.find((b) => b.slot === 'hero');

  const filteredPackages = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.toLowerCase();
    return packages.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.detail && p.detail.toLowerCase().includes(q)),
    );
  }, [packages, search]);

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
      <DesktopHeader />
      <StoreHeader search={true} showToggle={true} />

      <main className="mx-auto max-w-7xl px-4 md:px-8 py-5">
        {/* ─── Breadcrumb ─── */}
        <nav className="mb-4 flex items-center gap-2 text-[12.5px] text-[#64748b]" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-[#006872]">Home</Link>
          <span>/</span>
          <span className="font-semibold text-[#0f172a]">Lab Tests</span>
        </nav>

        {/* ─── Top Banner ─── */}
        {banner && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-xs">
            {banner.imageUrl ? (
              <Link href={(banner.ctaHref || '/lab-tests').replace(/&#x2F;/g, '/')} className="block overflow-hidden transition hover:opacity-95">
                <img
                  src={banner.imageUrl.replace(/&#x2F;/g, '/')}
                  alt={banner.title || 'Lab Tests Banner'}
                  className="h-[180px] md:h-[240px] lg:h-[280px] w-full object-cover"
                />
              </Link>
            ) : (
              <div className="relative overflow-hidden bg-gradient-to-r from-[#006872] via-[#007a87] to-[#008f9f] p-6 md:p-8 text-white">
                <div className="relative z-10 max-w-xl space-y-2">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                    NABL & ISO Certified Labs
                  </span>
                  <h2 className="text-[24px] md:text-[30px] font-extrabold leading-tight">
                    Accurate Health Checkups & Lab Tests at Home
                  </h2>
                  <p className="text-[13px] text-white/90">
                    Free sample collection from home & digital reports delivered within 24 hours.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Search Bar ─── */}
        <div className="mb-5 flex justify-end">
          <div className="relative sm:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests or health packages..."
              className="w-full rounded-xl border border-[#cbd5e1] bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[#006872] shadow-2xs placeholder:text-[#94a3b8]"
            />
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a] text-[13px]"
              >
                ✕
              </button>
            )}
          </div>
        </div>



        {/* ─── Health Packages Section ─── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-[#0f172a]">Popular Health Packages</h2>
              <p className="text-[12px] text-[#64748b]">Full body checkups curated by top medical experts</p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl bg-white border border-[#e2e8f0] p-8">
              <Icon name="science" className="text-[48px] text-slate-300" />
              <p className="mt-3 text-[16px] font-bold text-[#0f172a]">No Health Packages Found</p>
              <p className="text-[12.5px] text-[#64748b] mt-1">Try clearing your search query.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPackages.map((p) => {
                const price = Math.round(Number(p.price));
                const oldPrice = Math.round((p as any).oldPrice || price * 1.6);
                const discount = Math.round(((oldPrice - price) / oldPrice) * 100);

                return (
                  <div
                    key={p.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-[#e2e8f0] shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                  >
                    {/* Header Image / Icon Container with Rounded Corners */}
                    <div className="p-3 pb-0">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#f0fdfa] flex items-center justify-center">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl.replace(/&#x2F;/g, '/')}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <Icon name={p.icon || 'science'} className="text-[48px] text-[#006872]" />
                          </div>
                        )}

                        {/* Single Clean Badge */}
                        {p.badge ? (
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#006872] px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-xs">
                            {p.badge}
                          </span>
                        ) : discount > 0 ? (
                          <span className="absolute right-2.5 top-2.5 rounded-full bg-[#006872] px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-xs">
                            {discount}% OFF
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${(p.collectionType || 'both') === 'home'
                              ? 'bg-[#dcfce7] text-[#15803d]'
                              : (p.collectionType || 'both') === 'lab'
                                ? 'bg-[#e0e7ff] text-[#4338ca]'
                                : 'bg-[#f0fdfa] text-[#006872]'
                            }`}>
                            {(p.collectionType || 'both') === 'home' ? '🏠 Home Collection' : (p.collectionType || 'both') === 'lab' ? '🏥 Lab Visit Only' : ' Home & Lab'}
                          </span>
                        </div>
                        <h3 className="text-[15px] font-bold text-[#0f172a] line-clamp-1 group-hover:text-[#006872] transition-colors">
                          {p.name}
                        </h3>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#64748b] line-clamp-2">
                          {p.detail || 'Includes Comprehensive Blood Profile, Fasting Sugar, Lipid & Kidney Function Test.'}
                        </p>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[18px] font-extrabold text-[#0f172a]">
                              ₹{price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[12px] font-medium text-[#94a3b8] line-through">
                              ₹{oldPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/lab-tests/schedule?pkg=${p.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#006872] px-4 py-2 text-[12px] font-bold text-white shadow-xs transition hover:bg-[#00535b] active:scale-95"
                        >
                          <span>Book Now</span>
                          <Icon name="arrow_forward" className="text-[14px]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── Individual Tests Section ─── */}
        {tests && tests.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-[20px] font-bold text-[#0f172a]">Popular Diagnostic Tests</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tests.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#e2e8f0] shadow-2xs hover:border-[#006872] transition"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="text-[13.5px] font-bold text-[#0f172a]">{t.name}</h4>
                      <span className={`inline-block rounded px-1.5 py-0.2 text-[9.5px] font-bold ${(t.collectionType || 'both') === 'home'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : (t.collectionType || 'both') === 'lab'
                            ? 'bg-[#e0e7ff] text-[#4338ca]'
                            : 'bg-[#f0fdfa] text-[#006872]'
                        }`}>
                        {(t.collectionType || 'both') === 'home' ? '🏠 Home' : (t.collectionType || 'both') === 'lab' ? '🏥 Lab' : ' Both'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">{(t as any).sampleType || 'Blood Sample'} • Report in 24 hrs</p>
                    <span className="mt-1 block text-[14px] font-extrabold text-[#006872]">
                      ₹{Number(t.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Link
                    href={`/lab-tests/schedule?test=${t.id}`}
                    className="rounded-xl border border-[#006872] px-3.5 py-1.5 text-[11.5px] font-bold text-[#006872] transition hover:bg-[#006872] hover:text-white"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
