'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductArt } from '@/components/ui/product-art';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItem = cart.find((i) => i.id === product.id);
  const isInCart = mounted && !!cartItem;
  const qty = cartItem?.quantity ?? 0;

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.shortName} added to cart`);
  };

  const onInc = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, qty + 1);
  };

  const onDec = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, qty - 1);
  };

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-[#ededed] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] hover:-translate-y-1 group">
      {product.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-[#fee2e2] border border-[#fecaca] px-2 py-0.5 text-[10.5px] font-bold text-[#b91c1c]">
          {product.badge}
        </span>
      )}
      <Link href={`/products/${product.id}`} className="text-left flex-1 flex flex-col">
        {/* Product Image — clean pure white without grey box border */}
        <div className="flex aspect-square w-full items-center justify-center p-3.5">
          <ProductArt product={product} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
        </div>

        {/* Brand & Name */}
        <div className="px-3.5 pb-2 flex-1 flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
            {product.brand}
          </span>
          <h3 className="line-clamp-2 min-h-[38px] text-[13.5px] font-semibold leading-snug text-[#006872] mt-1 group-hover:underline transition-colors">
            {product.name}
          </h3>
        </div>
      </Link>

      {/* Price and ADD button row — vertically centered */}
      <div className="mt-auto flex items-center justify-between px-3.5 py-3 border-t border-[#f1f5f9]">
        <div className="flex flex-col justify-center">
          {product.oldPrice && (
            <span className="text-[10.5px] leading-none text-[#94a3b8] line-through mb-1">
              ₹{product.oldPrice.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-[17px] font-bold leading-none text-[#0f172a]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Action Button / Quantity Controls */}
        <div className="flex items-center">
          {isInCart ? (
            <div className="flex h-8 items-center rounded-lg border border-[#006872] bg-[#f0fdfa] px-1">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded text-[15px] font-bold text-[#006872] hover:bg-[#ccfbf1] transition cursor-pointer"
                onClick={onDec}
              >
                −
              </button>
              <span className="min-w-[24px] text-center text-[12px] font-bold text-[#006872]">{qty}</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded text-[15px] font-bold text-[#006872] hover:bg-[#ccfbf1] transition cursor-pointer"
                onClick={onInc}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="flex h-8 items-center justify-center rounded-lg bg-[#006872] px-4 text-[12px] font-bold text-white shadow-2xs transition hover:bg-[#00535b] active:scale-95 cursor-pointer"
              onClick={onAdd}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
