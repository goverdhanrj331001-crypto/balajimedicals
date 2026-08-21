'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/store/product-card';
import { Icon } from '@/components/ui/icon';
import type { Product } from '@/types';

export function ProductCarousel({ title, products }: { title: string; products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  if (!products.length) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 220 * 4; // scroll 4 cards at a time
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
    <section className="hidden bg-white px-8 py-4 md:block">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-bold">{title}</h2>
          <Link href="/products" className="rounded bg-[#006872] px-3 py-1 text-[12px] font-bold text-white">
            VIEW ALL
          </Link>
        </div>
        <div className="relative group">
          {/* Left arrow */}
          {showLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg border border-[#e4e2e1] text-[#006872] hover:bg-[#d9eeee] transition"
              aria-label="Scroll left"
            >
              <Icon name="chevron_left" className="text-[24px]" />
            </button>
          )}
          {/* Right arrow */}
          {showRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg border border-[#e4e2e1] text-[#006872] hover:bg-[#d9eeee] transition"
              aria-label="Scroll right"
            >
              <Icon name="chevron_right" className="text-[24px]" />
            </button>
          )}
          {/* Scrollable container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
          >
            {products.map((p) => (
              <div key={p.id} className="w-[220px] shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
