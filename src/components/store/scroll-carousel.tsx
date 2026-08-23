'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';

interface ScrollCarouselProps {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
  itemWidth?: number; // width of each item in px
}

export function ScrollCarousel({ title, viewAllHref, children, itemWidth = 150 }: ScrollCarouselProps) {
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
    <section className="hidden bg-white px-4 md:px-8 py-5 md:block">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#1e293b]">{title}</h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="rounded-lg bg-[#006872] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#00535b] shadow-2xs"
            >
              VIEW ALL
            </Link>
          )}
        </div>
        <div className="relative group">
          {/* Left floating arrow */}
          {showLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute -left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-[#cbd5e1] text-[#006872] hover:bg-[#d9eeee] transition cursor-pointer active:scale-95"
              aria-label="Scroll left"
            >
              <Icon name="chevron_left" className="text-[24px]" />
            </button>
          )}
          {/* Right floating arrow */}
          {showRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute -right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-[#cbd5e1] text-[#006872] hover:bg-[#d9eeee] transition cursor-pointer active:scale-95"
              aria-label="Scroll right"
            >
              <Icon name="chevron_right" className="text-[24px]" />
            </button>
          )}
          {/* Scrollable cards container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3.5 overflow-x-auto pb-3 pt-1.5 px-0.5 no-scrollbar scroll-smooth"
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
