'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductCard } from '@/components/store/product-card';
import { Icon } from '@/components/ui/icon';
import type { Product, Category } from '@/types';

interface Catalog {
  products: Product[];
  categories: Category[];
}

function ProductsPageInner() {
  const params = useSearchParams();
  const [data, setData] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const [selectedCat, setSelectedCat] = useState(() => params.get('category') ?? 'all');
  const [selectedBrand, setSelectedBrand] = useState(() => params.get('brand') ?? 'all');
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sync URL → state (only when params actually change)
  useEffect(() => {
    const q = params.get('q');
    const cat = params.get('category');
    const brand = params.get('brand');
    if (q !== null && q !== search) {
      Promise.resolve().then(() => setSearch(q));
    }
    if (cat !== null && cat !== selectedCat) {
      Promise.resolve().then(() => setSelectedCat(cat));
    }
    if (brand !== null && brand !== selectedBrand) {
      Promise.resolve().then(() => setSelectedBrand(brand));
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

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight">All Products</h1>
            <p className="text-[13px] text-[#3e494a]">
              {loading ? 'Loading…' : `${filtered.length} products available`}
            </p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-lg border border-[#bdc9ca] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#006872]"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {/* Search & filter bar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-[#bdc9ca] bg-white py-2.5 pl-10 pr-3 text-[13px] outline-none focus:border-[#006872]"
            />
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e797b]" />
          </div>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
          >
            <option value="all">All Categories</option>
            {data?.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icon name="search_off" className="text-[64px] text-[#bdc9ca]" />
            <p className="mt-3 text-[14px] font-bold">No products found</p>
            <p className="text-[12px] text-[#6e797b]">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
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
