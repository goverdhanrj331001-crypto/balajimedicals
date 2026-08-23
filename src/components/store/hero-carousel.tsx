'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Banner } from '@/types';

interface HeroCarouselProps {
  banners: Banner[];
  isMobile?: boolean;
}

export function HeroCarousel({ banners, isMobile = false }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  // Single banner fallback
  if (banners.length === 1) {
    const b = banners[0];
    const href = (b.ctaHref || '/products').replace(/&#x2F;/g, '/');
    if (isMobile) {
      return (
        <div className="px-3.5 pt-3 pb-1">
          <Link href={href} className="block overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-2xs">
            <img
              src={b.imageUrl ? b.imageUrl.replace(/&#x2F;/g, '/') : ''}
              alt={b.title || 'Pharmacy Banner'}
              className="h-44 w-full object-cover"
            />
          </Link>
        </div>
      );
    }
    return (
      <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-xs">
        <Link href={href} className="block overflow-hidden">
          <img
            src={b.imageUrl ? b.imageUrl.replace(/&#x2F;/g, '/') : ''}
            alt={b.title || 'Pharmacy Banner'}
            className="h-[220px] md:h-[280px] lg:h-[320px] w-full object-cover"
          />
        </Link>
      </div>
    );
  }

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      // Swipe Left -> Next
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } else if (diff < -50) {
      // Swipe Right -> Prev
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
    touchStartX.current = null;
  };

  return (
    <div className={isMobile ? 'px-3.5 pt-3 pb-1' : 'w-full'}>
      <div
        className={`relative overflow-hidden ${
          isMobile
            ? 'rounded-2xl border border-[#e2e8f0] shadow-2xs'
            : 'rounded-2xl border border-[#e2e8f0] shadow-xs'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((b, idx) => {
            const href = (b.ctaHref || '/products').replace(/&#x2F;/g, '/');
            const imgUrl = b.imageUrl ? b.imageUrl.replace(/&#x2F;/g, '/') : '';

            return (
              <div key={b.id || idx} className="w-full shrink-0">
                <Link href={href} className="block">
                  <img
                    src={imgUrl}
                    alt={b.title || `Hero Banner ${idx + 1}`}
                    className={
                      isMobile
                        ? 'h-44 w-full object-cover'
                        : 'h-[220px] md:h-[280px] lg:h-[320px] w-full object-cover'
                    }
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Carousel Dots Indicator */}
        <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-6 bg-[#006872]' : 'w-2 bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
