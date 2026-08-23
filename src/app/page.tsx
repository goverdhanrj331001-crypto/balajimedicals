'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductBand } from '@/components/store/product-band';
import { ProductCarousel } from "@/components/store/product-carousel";
import { ScrollCarousel } from "@/components/store/scroll-carousel";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { LabCarousel } from "@/components/store/lab-carousel";
import { Icon } from '@/components/ui/icon';
import type { Product, Category, HealthConcern, Brand, Offer, Banner, LabPackage, SiteSettings } from '@/types';

interface Catalog {
  products: Product[];
  categories: Category[];
  healthConcerns: HealthConcern[];
  brands: Brand[];
  offers: Offer[];
  banners: Banner[];
  labPackages: LabPackage[];
  settings: SiteSettings | null;
}

export default function HomePage() {
  const [data, setData] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const heroBanners = useMemo(() => data?.banners.filter((b) => b.slot === 'hero') ?? [], [data?.banners]);
  const hero = heroBanners[0];
  const essentials = useMemo(() => data?.banners.find((b) => b.slot === 'essentials'), [data?.banners]);
  const call = useMemo(() => data?.banners.find((b) => b.slot === 'call'), [data?.banners]);

  const { healthcareProducts, winterCare, immunityBoosters } = useMemo(() => {
    if (!data) return { healthcareProducts: [], winterCare: [], immunityBoosters: [] };
    
    const healthcare = data.products.filter(
      (p) => p.categoryId === 'cat-healthcare' || p.productType === 'Healthcare Device' || p.productType === 'Medicine'
    );
    const winter = data.products.filter(
      (p) => p.categoryId === 'cat-winter-care' || p.tags?.includes('winter') || p.tags?.includes('cold')
    );
    const immunity = data.products.filter(
      (p) => p.categoryId === 'cat-supplements' || p.categoryId === 'cat-ayurveda' || p.tags?.includes('immunity')
    );

    return {
      healthcareProducts: healthcare.length >= 2 ? healthcare.slice(0, 6) : data.products.slice(0, 6),
      winterCare: winter.length >= 2 ? winter.slice(0, 6) : data.products.slice(0, 6),
      immunityBoosters: immunity.length >= 2 ? immunity.slice(0, 6) : data.products.slice(2, 8),
    };
  }, [data]);

  if (loading || !data) {
    return (
      <div className="app-root min-h-screen">
        <DesktopHeader categories={[]} />
        <div className="flex h-96 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-root page-fade pb-16 md:pb-0">
      {/* Desktop Header (desktop only) */}
      <DesktopHeader categories={data.categories} />

      {/* ═══ Mobile Layout ═══ */}
      <div className="md:hidden">
        {/* Mobile search + toggle */}
        <StoreHeader showToggle />
        <main className="desktop-canvas">
          {/* Hero Carousel on mobile */}
          {heroBanners.length > 0 && <HeroCarousel banners={heroBanners} isMobile={true} />}
          {hero && !hero.imageUrl && (
            <section className="hero-art relative flex h-48 items-center justify-between overflow-hidden px-0 md:h-80 md:px-16">
              <div className="relative z-10 max-w-[58%]">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#643f00]">
                  {hero.badge ?? data.settings?.heroBadgeText ?? 'Everyday wellness'}
                </p>
                <h2 className="mt-1 text-[24px] font-bold leading-8 text-[#2a1800] md:text-[34px]">
                  {hero.title ?? data.settings?.heroTitle ?? 'Boost your immunity'}
                </h2>
                <p className="mt-1 text-[14px] text-[#643f00]">
                  {hero.subtitle ?? data.settings?.heroSubtitle ?? 'Health essentials for brighter days.'}
                </p>
                <Link
                  href={hero.ctaHref ?? '/products'}
                  className="mt-4 inline-block rounded-full bg-[#006872] px-4 py-2 text-[12px] font-bold text-white"
                >
                  {hero.ctaText ?? 'CLICK TO SHOP'}
                </Link>
              </div>
              <div className="hero-bottle relative mr-8 mt-5 md:mr-28" aria-hidden="true" />
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                <i className="h-2 w-2 rounded-full bg-white" />
                <i className="h-2 w-2 rounded-full bg-white/50" />
                <i className="h-2 w-2 rounded-full bg-white/50" />
              </div>
            </section>
          )}

          {/* Popular categories */}
          <section className="bg-[#f5f3f3] px-3 md:px-8 py-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold leading-6">Popular categories</h2>
              <Link href="/categories" className="rounded bg-[#006872] px-3 py-1 text-[12px] font-bold text-white">
                VIEW ALL
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {data.categories.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  className="soft-card rounded-lg p-2 transition hover:shadow-md active:scale-95"
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ background: c.tint }}>
                        <Icon name={c.icon} className="text-[34px] text-[#006872]" />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 block truncate text-center text-[11px] font-medium">{c.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Diagnostic Lab Tests Carousel (Mobile) */}
          <LabCarousel packages={data.labPackages ?? []} />

          {/* Daily essentials banner — real image */}
          {essentials && essentials.imageUrl && (
            <section className="px-3 md:px-8 py-4">
              <Link href={essentials.ctaHref ?? '/products'} className="block overflow-hidden rounded-xl">
                <img
                  src={essentials.imageUrl}
                  alt="Health Essentials"
                  className="h-32 w-full object-cover md:h-48"
                />
              </Link>
            </section>
          )}
          {essentials && !essentials.imageUrl && (
            <section className="px-3 md:px-8 py-4">
              <div className="relative flex h-32 items-center overflow-hidden rounded-xl bg-[#4caf50] px-4 md:px-6 text-white md:h-48">
                <div className="relative z-10">
                  <p className="text-[11px] uppercase tracking-wider">{essentials.subtitle ?? 'Daily health'}</p>
                  <h3 className="text-[24px] font-bold leading-8">{essentials.title}</h3>
                  {essentials.note && <p className="text-[14px]">{essentials.note}</p>}
                  <Link href={essentials.ctaHref ?? '/products'} className="mt-2 flex items-center gap-2 text-[12px] font-bold">
                    {essentials.ctaText ?? 'SHOP NOW'}
                    <Icon name="arrow_forward" className="rounded-full bg-white p-1 text-[16px] text-[#4caf50]" />
                  </Link>
                </div>
                <Icon name="medication" className="absolute right-12 text-[100px] text-white/25" />
              </div>
            </section>
          )}

          {/* Call banner */}
          {call && (
            <section className="border-y border-[#bdc9ca]/30 bg-white px-3 md:px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold">{call.title}</h2>
                  <p className="text-[14px] text-[#3e494a]">{call.subtitle}</p>
                </div>
                <a
                  href={`tel:${data.settings?.supportPhone ?? ''}`}
                  className="rounded bg-[#006872] px-4 py-2 text-[12px] font-bold text-white"
                >
                  {call.ctaText ?? 'Call Now'}
                </a>
              </div>
            </section>
          )}

          {/* Product bands */}
          <ProductBand title="Healthcare Products" color="#ef5350" products={healthcareProducts} />
          <ProductBand title="Winter Care" color="#1976d2" products={winterCare} />
          <ProductBand title="Immunity Boosters" color="#26a69a" products={immunityBoosters} />

          {/* Health concerns */}
          <section className="px-3 md:px-8 py-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold">Shop by health concerns</h2>
              <Link href="/health-concerns" className="rounded bg-[#006872] px-3 py-1 text-[12px] font-bold text-white">
                VIEW ALL
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {data.healthConcerns.slice(0, 6).map((hc) => (
                <Link key={hc.id} href={`/products?concern=${encodeURIComponent(hc.name)}`} className="group text-center">
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    {hc.imageUrl ? (
                      <img
                        src={hc.imageUrl}
                        alt={hc.name}
                        className="h-full w-full object-cover transition group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="asset-art flex h-full w-full items-center justify-center"
                        style={{ background: hc.tint }}
                      >
                        <Icon
                          name={hc.icon}
                          className="text-[34px] text-[#006872] transition group-hover:scale-110"
                        />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 block text-[11px] font-medium">{hc.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured brands (Mobile 3x3 Grid) */}
          <section className="px-3 md:px-8 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#0f172a]">Featured brands</h2>
              <Link href="/brands" className="rounded-lg bg-[#006872] px-3.5 py-1 text-[12px] font-bold text-white shadow-2xs hover:bg-[#00535b] transition">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {data.brands.slice(0, 9).map((brand, idx) => {
                const pastelTints = [
                  '#f0fdf4', // mint green (Himalaya)
                  '#f0f9ff', // light sky (Horlicks)
                  '#f7fee7', // light green (Dabur)
                  '#fff7ed', // peach (Dr. Morepen)
                  '#09090b', // dark (MuscleBlaze)
                  '#faf5ff', // lavender (Bournvita)
                  '#f0fdfa', // light teal (Mamaearth)
                  '#fff1f2', // soft coral (Dr. Morepen)
                  '#fefce8', // light yellow (Jiva)
                ];
                const cardBg = pastelTints[idx % pastelTints.length];
                const isDarkCard = cardBg === '#09090b';

                return (
                  <Link
                    key={brand.id}
                    href={`/products?brand=${encodeURIComponent(brand.name)}`}
                    style={{ backgroundColor: cardBg }}
                    className="group flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#e2e8f0] p-3 shadow-2xs transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                  >
                    {brand.logo || brand.imageUrl ? (
                      <img
                        src={(brand.logo || brand.imageUrl || '').replace(/&#x2F;/g, '/')}
                        alt={brand.name}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                      />
                    ) : (
                      <span className={`text-center text-[12px] font-bold ${isDarkCard ? 'text-white' : 'text-[#006872]'}`}>
                        {brand.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* ═══ Desktop Layout ═══ */}
      <div className="hidden md:block">
        <main>
          {/* Hero Carousel on Desktop */}
          {heroBanners.length > 0 && (
            <section className="px-4 md:px-8 pt-4 pb-4 bg-white">
              <div className="mx-auto max-w-7xl space-y-3">
                <HeroCarousel banners={heroBanners} isMobile={false} />
                {/* Promo strip — 3 banner cards */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <Link href="/products" className="block overflow-hidden rounded-xl shadow-sm transition hover:shadow-md hover:scale-[1.01]">
                    <img src="/promo-fast-delivery.jpg" loading="lazy" decoding="async" alt="Fast Delivery" className="h-44 lg:h-48 w-full object-cover rounded-xl" />
                  </Link>
                  <Link href="/products" className="block overflow-hidden rounded-xl shadow-sm transition hover:shadow-md hover:scale-[1.01]">
                    <img src="/promo-vitamin-c.jpg" loading="lazy" decoding="async" alt="Vitamin C" className="h-44 lg:h-48 w-full object-cover rounded-xl" />
                  </Link>
                  <Link href="/products" className="block overflow-hidden rounded-xl shadow-sm transition hover:shadow-md hover:scale-[1.01]">
                    <img src="/promo-trust.jpg" loading="lazy" decoding="async" alt="Trust & Warranty" className="h-44 lg:h-48 w-full object-cover rounded-xl" />
                  </Link>
                </div>
              </div>
            </section>
          )}
          {hero && !hero.imageUrl && (
            <section className="px-4 md:px-8 pt-4 pb-4 bg-white">
              <div className="mx-auto max-w-7xl space-y-3">
                <div className="bg-gradient-to-r from-[#006872] to-[#00838f] rounded-xl px-10 py-12 text-white shadow-sm">
                  <h2 className="text-[32px] font-bold">{hero?.title ?? 'Boost your immunity'}</h2>
                  <p className="mt-2 text-[15px] text-white/90">{hero?.subtitle}</p>
                  <Link
                    href={hero?.ctaHref ?? '/products'}
                    className="mt-4 inline-block rounded-lg bg-[#ffc107] px-5 py-2.5 text-[13px] font-bold text-[#006872] transition hover:bg-[#ffb300]"
                  >
                    {hero?.ctaText ?? 'SHOP NOW'} →
                  </Link>
                </div>
                {/* Promo strip — 3 banner cards */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <Link href="/products" className="block overflow-hidden rounded-xl shadow-sm transition hover:shadow-md hover:scale-[1.01]">
                    <img src="/promo-fast-delivery.jpg" loading="lazy" decoding="async" alt="Fast Delivery" className="h-44 lg:h-48 w-full object-cover rounded-xl" />
                  </Link>
                  <Link href="/products" className="block overflow-hidden rounded-xl shadow-sm transition hover:shadow-md hover:scale-[1.01]">
                    <img src="/promo-vitamin-c.jpg" loading="lazy" decoding="async" alt="Vitamin C" className="h-44 lg:h-48 w-full object-cover rounded-xl" />
                  </Link>
                  <Link href="/products" className="block overflow-hidden rounded-xl shadow-sm transition hover:shadow-md hover:scale-[1.01]">
                    <img src="/promo-trust.jpg" loading="lazy" decoding="async" alt="Trust & Warranty" className="h-44 lg:h-48 w-full object-cover rounded-xl" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Product carousels */}
          <ProductCarousel title="Balaji Medical Store Health Products" products={data.products} />

          {/* Popular categories */}
          <ScrollCarousel title="Popular Categories" viewAllHref="/categories" itemWidth={150}>
            {data.categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="w-[140px] md:w-[150px] shrink-0 bg-white rounded-2xl p-3.5 border border-[#ededed] shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 group text-center flex flex-col items-center justify-between"
              >
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#f8fafc] p-2">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      loading="lazy"
                      decoding="async"
                      width={120}
                      height={120}
                      className="h-full w-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg" style={{ background: c.tint || '#e0f2f1' }}>
                      <Icon name={c.icon || 'category'} className="text-[36px] text-[#006872] transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  )}
                </div>
                <div className="mt-2.5 w-full">
                  <h4 className="truncate text-[13px] font-medium text-[#242424] transition-colors group-hover:text-[#006872]">
                    {c.name}
                  </h4>
                </div>
              </Link>
            ))}
          </ScrollCarousel>

          {/* Diagnostic Lab Tests & Health Packages Carousel (Desktop) */}
          <LabCarousel packages={data.labPackages ?? []} />

          {/* 1. Recommended For You */}
          <ProductCarousel title="Recommended For You" products={[...data.products].reverse()} />

          {/* 2. Featured Brands */}
          <ScrollCarousel title="Featured Brands" viewAllHref="/brands" itemWidth={150}>
            {data.brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="w-[140px] md:w-[150px] shrink-0 bg-white rounded-2xl p-3.5 border border-[#ededed] shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 group text-center flex flex-col items-center justify-between"
              >
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#f8fafc] p-3">
                  {brand.logo || brand.imageUrl ? (
                    <img
                      src={brand.logo || brand.imageUrl}
                      alt={brand.name}
                      loading="lazy"
                      decoding="async"
                      width={120}
                      height={120}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-center text-[13px] font-bold text-[#006872]">{brand.name}</span>
                  )}
                </div>
                <div className="mt-2.5 w-full">
                  <h4 className="truncate text-[13px] font-medium text-[#242424] transition-colors group-hover:text-[#006872]">
                    {brand.name}
                  </h4>
                </div>
              </Link>
            ))}
          </ScrollCarousel>

          {/* 3. Deals of the Day */}
          <ProductCarousel title="Deals of the Day" products={data.products.filter((p) => p.oldPrice)} />

          {/* 4. Shop by Health Concerns */}
          <ScrollCarousel title="Shop by Health Concerns" viewAllHref="/health-concerns" itemWidth={150}>
            {data.healthConcerns.map((hc) => (
              <Link
                key={hc.id}
                href={`/products?concern=${encodeURIComponent(hc.name)}`}
                className="w-[140px] md:w-[150px] shrink-0 bg-white rounded-2xl p-3.5 border border-[#ededed] shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 group text-center flex flex-col items-center justify-between"
              >
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#f8fafc]">
                  {hc.imageUrl ? (
                    <img
                      src={hc.imageUrl}
                      alt={hc.name}
                      loading="lazy"
                      decoding="async"
                      width={120}
                      height={120}
                      className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-xl"
                      style={{ background: hc.tint || '#e0f2f1' }}
                    >
                      <Icon name={hc.icon || 'healing'} className="text-[36px] text-[#006872] transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  )}
                </div>
                <div className="mt-2.5 w-full">
                  <h4 className="truncate text-[13px] font-medium text-[#242424] transition-colors group-hover:text-[#006872]">
                    {hc.name}
                  </h4>
                </div>
              </Link>
            ))}
          </ScrollCarousel>

          {/* 5. Winter Care */}
          <ProductCarousel title="Winter Care" products={winterCare} />
        </main>

        {/* Desktop Footer */}
        <DesktopFooter categories={data.categories} brands={data.brands} settings={data.settings} />
      </div>

      <BottomNav />
    </div>
  );
}
