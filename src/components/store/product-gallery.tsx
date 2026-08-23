'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { ProductArt } from '@/components/ui/product-art';
import type { Product } from '@/types';

export function ProductGallery({ product }: { product: Product }) {
  const images = product.gallery?.length
    ? product.gallery
    : product.thumbnail || product.imageUrl
      ? [product.thumbnail || product.imageUrl!]
      : [];
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return <ProductArt product={product} className="aspect-square w-full" />;
  }

  return (
    <div>
      {/* Main image — clean without grey box */}
      <div className="relative aspect-square w-full flex items-center justify-center p-2">
        <img
          src={images[activeIdx]}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
            {activeIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar justify-center">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 p-1 bg-white transition cursor-pointer ${
                i === activeIdx ? 'border-[#006872] shadow-xs' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
              }`}
            >
              <img src={url} loading="lazy" decoding="async" alt={`View ${i + 1}`} className="h-full w-full object-contain" />
              {i === 0 && (
                <span className="absolute left-0 top-0 rounded-br bg-[#006872] px-1 text-[8px] font-bold text-white">
                  PRIMARY
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
