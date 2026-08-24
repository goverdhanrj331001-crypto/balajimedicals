'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductCard } from '@/components/store/product-card';
import { Icon } from '@/components/ui/icon';
import type { Product, Category, Banner } from '@/types';

interface Catalog {
  products: Product[];
  categories: Category[];
  banners?: Banner[];
}

const sortOptions = [
  { value: 'default', label: 'Featured / Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

const PAGE_SIZE = 30;

function ProductsPageInner() {
  const params = useSearchParams();
  const [data, setData] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const [selectedCat, setSelectedCat] = useState(() => params.get('category') ?? 'all');
  const [selectedBrand, setSelectedBrand] = useState(() => params.get('brand') ?? 'all');
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync URL → state (only when params actually change)
  useEffect(() => {
    const q = params.get('q');
    const cat = params.get('category');
    const brand = params.get('brand');
    if (q !== null && q !== search) {
      Promise.resolve().then(() => { setSearch(q); setCurrentPage(1); });
    }
    if (cat !== null && cat !== selectedCat) {
      Promise.resolve().then(() => { setSelectedCat(cat); setCurrentPage(1); });
    }
    if (brand !== null && brand !== selectedBrand) {
      Promise.resolve().then(() => { setSelectedBrand(brand); setCurrentPage(1); });
    }
  }, [params, search, selectedCat, selectedBrand]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.products;
    if (selectedCat !== 'all') list = list.filter((p) => p.categoryId === selectedCat);
    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
      );
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.shortName.localeCompare(b.shortName));
    return list;
  }, [data, selectedCat, selectedBrand, search, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [search, selectedCat, selectedBrand, sort]);

  // Find banner specifically configured for products page (or fallback to hero banner)
  const productsBanner = data?.banners?.find((b) => b.slot === 'products') ?? data?.banners?.find((b) => b.slot === 'hero');
  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label ?? 'Featured / Default';

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
      <DesktopHeader />
      <StoreHeader search={true} />

      <main className="mx-auto max-w-7xl px-4 md:px-8 py-5">
        {/* ─── Top Banner ─── */}
        {productsBanner && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-xs">
            {productsBanner.imageUrl ? (
              <Link href={(productsBanner.ctaHref || '/products').replace(/&#x2F;/g, '/')} className="block overflow-hidden transition hover:opacity-95">
                <img
                  src={productsBanner.imageUrl.replace(/&#x2F;/g, '/')}
                  alt={productsBanner.title || 'Products Banner'}
                  className="h-[200px] md:h-[260px] lg:h-[300px] w-full object-cover"
                />
              </Link>
            ) : (
              <div className="relative overflow-hidden bg-gradient-to-r from-[#006872] via-[#007a87] to-[#008f9f] p-6 md:p-10 text-white">
                <div className="relative z-10 max-w-2xl space-y-2">
                  {productsBanner.badge && (
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                      {productsBanner.badge}
                    </span>
                  )}
                  <h2 className="text-[24px] md:text-[32px] font-extrabold leading-tight">
                    {productsBanner.title || 'All Products & Healthcare Essentials'}
                  </h2>
                  {productsBanner.subtitle && (
                    <p className="text-[13.5px] text-white/90 leading-relaxed">
                      {productsBanner.subtitle}
                    </p>
                  )}
                  {productsBanner.ctaText && (
                    <div className="pt-2">
                      <Link
                        href={(productsBanner.ctaHref || '/products').replace(/&#x2F;/g, '/')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#ffc107] px-4 py-2 text-[12.5px] font-bold text-[#006872] transition hover:bg-[#ffb300] shadow-xs"
                      >
                        <span>{productsBanner.ctaText}</span>
                        <Icon name="arrow_forward" className="text-[15px]" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Page Title & Items Counter ─── */}
        <div className="mb-4">
          <h1 className="text-[24px] font-bold tracking-tight text-[#0f172a]">All Products</h1>
          <p className="text-[12.5px] text-[#64748b]">
            {loading ? 'Loading products…' : `${filtered.length} items found`}
            {!loading && filtered.length > 0 && (
              <span className="ml-2 text-[#006872] font-semibold">· Page {currentPage} of {totalPages}</span>
            )}
          </p>
        </div>

        {/* ─── Search & Custom Sort Bar ─── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by medicine name, brand, or salt..."
              className="w-full rounded-xl border border-[#cbd5e1] bg-white py-2.5 pl-10 pr-9 text-[13px] font-medium text-[#1e293b] outline-none focus:border-[#006872] shadow-2xs placeholder:text-[#94a3b8]"
            />
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-[#475569] text-[11px] font-bold transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Custom Sleek Sort Dropdown */}
          <div className="relative shrink-0" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-[12.5px] font-medium text-[#0f172a] shadow-2xs hover:border-[#006872] transition cursor-pointer sm:w-auto"
            >
              <div className="flex items-center gap-1.5">
                <Icon name="swap_vert" className="text-[18px] text-[#006872]" />
                <span className="text-[#64748b]">Sort by:</span>
                <span className="font-bold text-[#0f172a]">{currentSortLabel}</span>
              </div>
              <Icon
                name="expand_more"
                className={`text-[18px] text-[#64748b] transition-transform duration-200 ${sortOpen ? 'rotate-180 text-[#006872]' : ''}`}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSort(opt.value as any);
                      setSortOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] transition cursor-pointer ${
                      sort === opt.value
                        ? 'bg-[#f0fdfa] text-[#006872] font-bold'
                        : 'text-[#334155] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sort === opt.value && (
                      <Icon name="check" className="text-[16px] text-[#006872]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Quick Category Pills ─── */}
        {data?.categories && data.categories.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition shrink-0 cursor-pointer ${
                selectedCat === 'all'
                  ? 'bg-[#006872] text-white shadow-2xs'
                  : 'bg-white text-[#475569] border border-[#e2e8f0] hover:border-[#cbd5e1]'
              }`}
            >
              All
            </button>
            {data.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition shrink-0 cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-[#006872] text-white shadow-2xs'
                    : 'bg-white text-[#475569] border border-[#e2e8f0] hover:border-[#cbd5e1]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ─── Products Grid ─── */}
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white border border-[#e2e8f0] p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="search_off" className="text-[36px]" />
            </div>
            <p className="mt-4 text-[16px] font-bold text-[#0f172a]">No Products Found</p>
            <p className="mt-1 text-[13px] text-[#64748b]">Try clearing your search or switching categories.</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCat('all');
                setSelectedBrand('all');
              }}
              className="mt-4 rounded-xl bg-[#006872] px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-[#00535b]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* ─── Pagination Controls ─── */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-[12.5px] font-bold text-[#334155] shadow-2xs transition hover:border-[#006872] hover:text-[#006872] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dots');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === 'dots' ? (
                        <span key={`dots-${idx}`} className="px-1 text-[#94a3b8] text-[13px]">…</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => { setCurrentPage(item as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`h-9 w-9 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                            currentPage === item
                              ? 'bg-[#006872] text-white shadow-xs'
                              : 'bg-white border border-[#e2e8f0] text-[#334155] hover:border-[#006872] hover:text-[#006872]'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-[12.5px] font-bold text-[#334155] shadow-2xs transition hover:border-[#006872] hover:text-[#006872] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <DesktopFooter />
      <BottomNav />
    </div>
  );
}

export default function ProductsPage(props: any) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" /></div>}>
      <ProductsPageInner {...props} />
    </Suspense>
  );
}
