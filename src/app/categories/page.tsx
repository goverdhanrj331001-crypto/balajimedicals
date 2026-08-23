'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import type { Category, Product, Banner } from '@/types';

interface Catalog {
  categories: Category[];
  products: Product[];
  banners?: Banner[];
}

export default function CategoriesPage() {
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

  const categories = data?.categories ?? [];
  const banner = data?.banners?.find((b) => b.slot === 'products') ?? data?.banners?.find((b) => b.slot === 'hero');

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
      <DesktopHeader />
      <StoreHeader search={true} />

      <main className="mx-auto max-w-7xl px-4 md:px-8 py-5">
        {/* ─── Top Banner ─── */}
        {banner && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-xs">
            {banner.imageUrl ? (
              <Link href={(banner.ctaHref || '/products').replace(/&#x2F;/g, '/')} className="block overflow-hidden transition hover:opacity-95">
                <img
                  src={banner.imageUrl.replace(/&#x2F;/g, '/')}
                  alt={banner.title || 'Categories Banner'}
                  className="h-[200px] md:h-[260px] lg:h-[300px] w-full object-cover"
                />
              </Link>
            ) : (
              <div className="relative overflow-hidden bg-gradient-to-r from-[#006872] via-[#007a87] to-[#008f9f] p-6 md:p-10 text-white">
                <div className="relative z-10 max-w-2xl space-y-2">
                  {banner.badge && (
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                      {banner.badge}
                    </span>
                  )}
                  <h2 className="text-[24px] md:text-[32px] font-extrabold leading-tight">
                    {banner.title || 'Explore Top Pharmacy Categories'}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-[13.5px] text-white/90 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaText && (
                    <div className="pt-2">
                      <Link
                        href={(banner.ctaHref || '/products').replace(/&#x2F;/g, '/')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#ffc107] px-4 py-2 text-[12.5px] font-bold text-[#006872] transition hover:bg-[#ffb300] shadow-xs"
                      >
                        <span>{banner.ctaText}</span>
                        <Icon name="arrow_forward" className="text-[15px]" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Breadcrumb ─── */}
        <nav className="mb-4 flex items-center gap-2 text-[12.5px] text-[#64748b]" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-[#006872]">Home</Link>
          <span>/</span>
          <span className="font-semibold text-[#0f172a]">Categories</span>
        </nav>

        {/* ─── Page Header & Search ─── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-[#0f172a]">
              All Categories
            </h1>
            <p className="text-[12.5px] text-[#64748b] mt-0.5">
              {loading ? 'Loading…' : `Browse medicines & healthcare across ${categories.length} categories`}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
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

        {/* ─── Content ─── */}
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white border border-[#e2e8f0] p-8">
            <Icon name="category" className="text-[48px] text-slate-300" />
            <p className="mt-3 text-[16px] font-bold text-[#0f172a]">No Categories Found</p>
            <p className="text-[12.5px] text-[#64748b] mt-1">No category matching "{search}" was found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-[#ededed] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 text-center"
              >
                {/* Image container — ONLY the image, pure clean white background */}
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl.replace(/&#x2F;/g, '/')}
                      alt={c.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-108"
                    />
                  ) : (
                    <Icon
                      name={c.icon || 'medication'}
                      className="text-[52px] text-[#006872] transition-transform duration-300 group-hover:scale-108"
                    />
                  )}
                </div>

                {/* Title */}
                <div className="mt-2.5">
                  <h3 className="text-[13.5px] font-bold text-[#0f172a] transition-colors group-hover:text-[#006872] line-clamp-1">
                    {c.name}
                  </h3>
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
