'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import type { LabPackage } from '@/types';

interface LabCarouselProps {
  packages: LabPackage[];
  title?: string;
  viewAllHref?: string;
}

export function LabCarousel({
  packages,
  title = 'Full body health checkups',
  viewAllHref = '/lab-tests',
}: LabCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  if (!packages || packages.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 260 * 3;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  return (
    <section className="w-full bg-white px-4 md:px-8 py-5">
      <div className="mx-auto max-w-7xl">
        {/* ─── Header: Exact same style as ProductCarousel ─── */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#1e293b]">{title}</h2>
          <Link
            href={viewAllHref}
            className="rounded-lg bg-[#006872] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#00535b] shadow-2xs cursor-pointer active:scale-95"
          >
            VIEW ALL
          </Link>
        </div>

        {/* ─── Carousel with Floating Arrow ─── */}
        <div className="relative group">
          {/* Left Arrow Button */}
          {showLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute -left-3 top-1/2 z-20 hidden md:flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] border border-[#cbd5e1] text-[#006872] hover:bg-[#f0fdfa] hover:border-[#006872] hover:scale-105 transition-all cursor-pointer active:scale-95"
              aria-label="Scroll left"
            >
              <Icon name="chevron_left" className="text-[20px]" />
            </button>
          )}

          {/* Right Arrow Button */}
          {showRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute -right-3 top-1/2 z-20 hidden md:flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] border border-[#cbd5e1] text-[#006872] hover:bg-[#f0fdfa] hover:border-[#006872] hover:scale-105 transition-all cursor-pointer active:scale-95"
              aria-label="Scroll right"
            >
              <Icon name="chevron_right" className="text-[20px]" />
            </button>
          )}

          {/* Cards Track */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3.5 overflow-x-auto pb-2 pt-1 px-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {packages.map((pkg) => {
              const price = Number(pkg.price);
              const oldPrice = Math.round(price * 2);
              const discount = 50;

              return (
                <Link
                  key={pkg.id}
                  href={`/lab-tests/schedule?pkg=${pkg.id}`}
                  className="w-[235px] sm:w-[245px] md:w-[255px] shrink-0 snap-start flex flex-col justify-between rounded-xl bg-white border border-[#e2e8f0] p-3.5 shadow-2xs hover:border-[#006872]/40 hover:shadow-md transition-all duration-200 group/card"
                >
                  {/* Card Title */}
                  <div>
                    <h3 className="text-[13.5px] font-bold text-[#1e293b] leading-snug line-clamp-1 group-hover/card:text-[#006872] transition-colors" title={pkg.name}>
                      {pkg.name}
                    </h3>
                  </div>

                  {/* Middle Row: Lab Logo/Name */}
                  <div className="my-3 flex items-center gap-1.5 border-t border-[#f1f5f9] pt-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e0f2f1] text-[#006872]">
                      <Icon name="science" className="text-[13px]" />
                    </div>
                    <span className="truncate text-[11.5px] font-semibold text-[#475569]">
                      Balaji Labs
                    </span>
                  </div>

                  {/* Bottom Row: Price, Strikethrough & Discount */}
                  <div className="flex items-center">
                    <span className="text-[15.5px] font-extrabold text-[#0f172a]">
                      ₹{price}
                    </span>
                    <span className="ml-2 text-[12px] text-[#94a3b8] line-through">
                      ₹{oldPrice}
                    </span>
                    <span className="ml-2 rounded-md bg-[#e6f4ea] px-1.5 py-0.5 text-[10.5px] font-bold text-[#16a34a]">
                      {discount}% off
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
