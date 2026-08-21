'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductBand } from '@/components/store/product-band';
import { ProductCarousel } from "@/components/store/product-carousel";
import { ScrollCarousel } from "@/components/store/scroll-carousel";
import { Icon } from '@/components/ui/icon';
import type { Product, Category, HealthConcern, Brand, Offer, Banner, LabPackage } from '@/types';

interface Catalog {
  products: Product[];
  categories: Category[];
  healthConcerns: HealthConcern[];
  brands: Brand[];
  offers: Offer[];
  banners: Banner[];
  labPackages: LabPackage[];
  settings: any;
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

  const hero = data.banners.find((b) => b.slot === 'hero');
  const essentials = data.banners.find((b) => b.slot === 'essentials');
  const call = data.banners.find((b) => b.slot === 'call');

  const healthcareProducts = data.products.slice(0, 6);
  const winterCare = data.products.slice(0, 3);
  const immunityBoosters = data.products.slice(2, 5);

  return (
    <div className="app-root page-fade pb-16 md:pb-0">
      {/* Desktop Header (desktop only) */}
      <DesktopHeader categories={data.categories} />

      {/* ═══ Mobile Layout ═══ */}
      <div className="md:hidden">
        {/* Mobile search + toggle (no teal bar) */}
        <StoreHeader showToggle />
        <main className="desktop-canvas">
          {/* Hero — real banner image, no text overlay */}
          {hero && hero.imageUrl && (
            <Link href={hero.ctaHref ?? '/products'} className="block">
              <img
                src={hero.imageUrl}
                alt="Balaji Medical Store Pharmacy Banner"
                className="h-44 w-full object-cover md:h-64"
              />
            </Link>
          )}
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

          {/* Daily essentials banner — real image, no text overlay */}
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

          {/* Offers */}
          <section className="px-3 md:px-8 py-4">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {data.offers.map((offer) => (
                <div key={offer.id} className="soft-card flex min-w-[280px] items-center gap-3 rounded-lg p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffddb5] text-lg font-bold text-[#835400]">
                    %
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">{offer.text}</p>
                    <p className="text-[11px] text-[#3e494a]">Code: <b>{offer.code}</b></p>
                  </div>
                </div>
              ))}
            </div>
          </section>

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

          {/* Featured brands */}
          <section className="px-3 md:px-8 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold">Featured brands</h2>
              <Link href="/brands" className="rounded bg-[#006872] px-3 py-1 text-[12px] font-bold text-white">
                VIEW ALL
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {data.brands.slice(0, 6).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${encodeURIComponent(brand.name)}`}
                  className="soft-card group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-[#e4e2e1] bg-white p-2 transition hover:shadow-md"
                >
                  {brand.logo || brand.imageUrl ? (
                    <img
                      src={brand.logo || brand.imageUrl}
                      alt={brand.name}
                      className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-center text-[12px] font-bold text-[#006872]">{brand.name}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* ═══ Desktop Layout ═══ */}
      <div className="hidden md:block">
        <main>
          {/* Hero — real banner image, no text overlay */}
          {hero && hero.imageUrl && (
            <Link href={hero.ctaHref ?? '/products'} className="block">
              <img
                src={hero.imageUrl}
                alt="Balaji Medical Store Pharmacy Banner"
                className="h-[300px] w-full object-cover lg:h-[400px]"
              />
            </Link>
          )}
          {hero && !hero.imageUrl && (
            <section className="bg-gradient-to-r from-[#006872] to-[#00838f] px-8 py-12">
              <div className="mx-auto max-w-7xl text-white">
                <h2 className="text-[34px] font-bold">{hero.title ?? 'Boost your immunity'}</h2>
                <p className="mt-2 text-[16px]">{hero.subtitle}</p>
                <Link
                  href={hero.ctaHref ?? '/products'}
                  className="mt-4 inline-block rounded-lg bg-[#ffc107] px-5 py-2.5 text-[14px] font-bold text-[#006872]"
                >
                  {hero.ctaText ?? 'SHOP NOW'} →
                </Link>
              </div>
            </section>
          )}

          {/* Promo strip — 3 real banner images */}
          <section className="bg-[#f5f3f3] px-8 py-4">
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-3">
              <Link href="/products" className="block overflow-hidden rounded-xl">
                <img src="/promo-fast-delivery.png" loading="lazy" decoding="async" alt="Fast Delivery" className="h-32 w-full object-cover transition hover:scale-105" />
              </Link>
              <Link href="/products" className="block overflow-hidden rounded-xl">
                <img src="/promo-vitamin-c.png" loading="lazy" decoding="async" alt="Vitamin C" className="h-32 w-full object-cover transition hover:scale-105" />
              </Link>
              <Link href="/products" className="block overflow-hidden rounded-xl">
                <img src="/promo-trust.png" loading="lazy" decoding="async" alt="Trust & Warranty" className="h-32 w-full object-cover transition hover:scale-105" />
              </Link>
            </div>
          </section>

          {/* Product carousels */}
          <ProductCarousel title="Balaji Medical Store Health Products" products={data.products} />

          {/* Popular categories */}
          <ScrollCarousel title="Popular Categories" viewAllHref="/categories" itemWidth={160}>
            {data.categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="w-[160px] shrink-0 soft-card group rounded-xl p-2 transition hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ background: c.tint }}>
                      <Icon name={c.icon} className="text-[36px] text-[#006872] transition group-hover:scale-110" />
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-center text-[11px] font-semibold">{c.name}</p>
              </Link>
            ))}
          </ScrollCarousel>

          <ProductCarousel title="Recommended For You" products={[...data.products].reverse()} />
          <ProductCarousel title="Deals of the Day" products={data.products.filter((p) => p.oldPrice)} />
          <ProductCarousel title="Winter Care" products={winterCare} />

          {/* Featured brands */}
          <ScrollCarousel title="Featured Brands" viewAllHref="/brands" itemWidth={200}>
            {data.brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="w-[200px] shrink-0 soft-card group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-[#e4e2e1] bg-white p-2 transition hover:shadow-md"
              >
                {brand.logo || brand.imageUrl ? (
                  <img
                    src={brand.logo || brand.imageUrl}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                  />
                ) : (
                  <span className="text-center text-[12px] font-bold text-[#006872]">{brand.name}</span>
                )}
              </Link>
            ))}
          </ScrollCarousel>

          {/* Shop by health concerns */}
          <ScrollCarousel title="Shop by Health Concerns" viewAllHref="/health-concerns" itemWidth={160}>
            {data.healthConcerns.map((hc) => (
              <Link key={hc.id} href={`/products?concern=${encodeURIComponent(hc.name)}`} className="w-[160px] shrink-0 group text-center">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
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
                      <Icon name={hc.icon} className="text-[34px] text-[#006872] transition group-hover:scale-110" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[11px] font-bold text-white">{hc.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </ScrollCarousel>

          {/* Offers */}
          <section className="bg-white px-8 py-4">
            <div className="mx-auto max-w-7xl">
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {data.offers.map((offer) => (
                  <div key={offer.id} className="soft-card flex min-w-[280px] items-center gap-3 rounded-lg p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffddb5] text-lg font-bold text-[#835400]">
                      %
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold">{offer.text}</p>
                      <p className="text-[11px] text-[#3e494a]">Code: <b>{offer.code}</b></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Desktop Footer */}
        <DesktopFooter categories={data.categories} brands={data.brands} />
      </div>

      <BottomNav />
    </div>
  );
}

