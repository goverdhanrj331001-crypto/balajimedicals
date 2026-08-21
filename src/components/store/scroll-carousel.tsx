'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';

interface ScrollCarouselProps {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
  itemWidth?: number; // width of each item in px
}

export function ScrollCarousel({ title, viewAllHref, children, itemWidth = 180 }: ScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = itemWidth * 4;
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
    <section className="hidden bg-white px-8 py-6 md:block">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[22px] font-bold">{title}</h2>
          {viewAllHref && (
            <Link href={viewAllHref} className="rounded bg-[#006872] px-3 py-1.5 text-[12px] font-bold text-white">
              VIEW ALL
            </Link>
          )}
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
          {/* Scrollable container — no scrollbar line */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
