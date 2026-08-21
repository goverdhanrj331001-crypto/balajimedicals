'use client';

import Link from 'next/link';
import { ProductArt } from '@/components/ui/product-art';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface ProductBandProps {
  title: string;
  color: string;
  products: Product[];
}

export function ProductBand({ title, color, products }: ProductBandProps) {
  const { cart, addToCart, updateQuantity } = useCart();

  if (!products.length) return null;

  return (
    <section className="py-4 text-white" style={{ background: color }}>
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="text-[18px] font-semibold">{title}</h2>
        <Link href="/products" className="flex items-center text-[12px] font-bold">
          View All <Icon name="chevron_right" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-3 no-scrollbar">
        {products.map((product) => {
          const cartItem = cart.find((i) => i.id === product.id);
          const isInCart = !!cartItem;
          const qty = cartItem?.quantity ?? 0;

          return (
            <div
              key={product.id}
              className="min-w-[152px] rounded-lg bg-white p-3 text-[#1b1c1c] shadow-sm md:min-w-[190px]"
            >
              <Link href={`/products/${product.id}`} className="block w-full text-left">
                <ProductArt product={product} className="mb-3 aspect-square w-full rounded" />
                <h3 className="truncate text-[14px]">{product.shortName}</h3>
                <p className="text-[12px] font-bold text-[#006872]">${product.price.toFixed(2)}</p>
              </Link>
              {/* Cart controls */}
              {isInCart ? (
                <div className="mt-2 flex items-center justify-between rounded border border-[#006872] bg-white">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-l text-[16px] font-bold text-[#006872] hover:bg-[#d9eeee]"
                    onClick={() => updateQuantity(product.id, qty - 1)}
                  >
                    −
                  </button>
                  <span className="min-w-[24px] text-center text-[12px] font-bold text-[#006872]">{qty}</span>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-r text-[16px] font-bold text-[#006872] hover:bg-[#d9eeee]"
                    onClick={() => updateQuantity(product.id, qty + 1)}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="mt-2 w-full rounded border border-[#006872] py-1 text-[11px] font-bold text-[#006872]"
                  onClick={() => {
                    addToCart(product, 1);
                    toast.success(`${product.shortName} added to cart`);
                  }}
                >
                  Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
