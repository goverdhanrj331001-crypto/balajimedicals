'use client';

import Link from 'next/link';
import { ProductArt } from '@/components/ui/product-art';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart.find((i) => i.id === product.id);
  const isInCart = !!cartItem;
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
    <article className="soft-card relative flex h-full flex-col overflow-hidden rounded-xl transition hover:-translate-y-0.5 hover:shadow-md">
      {product.badge && (
        <span className="absolute left-2 top-2 z-10 rounded-sm bg-[#fc5d59] px-2 py-0.5 text-[11px] font-bold text-[#600009]">
          {product.badge}
        </span>
      )}
      <Link href={`/products/${product.id}`} className="text-left">
        <div className="flex aspect-square items-center justify-center overflow-hidden bg-[#f5f3f3]">
          <ProductArt product={product} className="h-full w-full" />
        </div>
        <div className="p-3">
          <span className="mb-1 block text-[11px] font-medium uppercase leading-[14px] text-[#3e494a]">
            {product.brand}
          </span>
          <h3 className="line-clamp-2 min-h-10 text-[14px] font-medium leading-5 text-[#1b1c1c]">
            {product.name}
          </h3>
        </div>
      </Link>
      <div className="mt-auto flex items-end justify-between px-3 pb-3">
        <div>
          {product.oldPrice && (
            <span className="block text-[11px] text-[#6e797b] line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
          <span className="text-[18px] font-semibold leading-6 text-[#1b1c1c]">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* If in cart → show quantity controls; otherwise show ADD button */}
        {isInCart ? (
          <div className="flex items-center gap-1 rounded-lg border border-[#006872] bg-white">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-l-md text-[16px] font-bold text-[#006872] hover:bg-[#d9eeee]"
              onClick={onDec}
            >
              −
            </button>
            <span className="min-w-[24px] text-center text-[13px] font-bold text-[#006872]">{qty}</span>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-r-md text-[16px] font-bold text-[#006872] hover:bg-[#d9eeee]"
              onClick={onInc}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-md bg-[#00838f] px-3 py-1 text-[12px] font-bold leading-4 text-white shadow-sm transition hover:bg-[#006872] active:scale-95"
            onClick={onAdd}
          >
            ADD
          </button>
        )}
      </div>
    </article>
  );
}
