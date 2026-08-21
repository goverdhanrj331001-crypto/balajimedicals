'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ProductArt } from '@/components/ui/product-art';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const shipping = cartTotal >= 50 ? 0 : 5;
  const grandTotal = cartTotal + shipping;

  const onCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setCheckingOut(true);
    router.push('/checkout');
  };

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight">Your Cart</h1>
            <p className="text-[13px] text-[#3e494a]">{cartCount} item(s) in cart</p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="rounded-lg border border-[#bdc9ca] px-3 py-2 text-[11px] font-bold text-[#910816] hover:bg-[#ffdad7]"
            >
              <Icon name="delete" className="mr-1 text-[14px]" /> Clear
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <Icon name="shopping_cart" className="text-[64px] text-[#bdc9ca]" />
            <p className="mt-3 text-[14px] font-bold">Your cart is empty</p>
            <p className="text-[12px] text-[#6e797b]">Add some products to get started.</p>
            <Link href="/products" className="mt-4 rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
            {/* Cart items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="soft-card flex gap-3 rounded-xl p-3">
                  <Link href={`/products/${item.id}`}>
                    <ProductArt product={item} className="h-20 w-20 shrink-0 rounded-lg" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/products/${item.id}`}>
                          <p className="truncate text-[13px] font-bold">{item.shortName}</p>
                        </Link>
                        <p className="text-[10px] text-[#6e797b]">{item.brand} · {item.note}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.success('Item removed');
                        }}
                        className="rounded p-1 text-[#910816] hover:bg-[#ffdad7]"
                        aria-label="Remove"
                      >
                        <Icon name="close" className="text-[18px]" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-[#bdc9ca]">
                        <button
                          type="button"
                          className="px-2.5 py-1 text-[13px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-[12px] font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          className="px-2.5 py-1 text-[13px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-[#6e797b]">${item.price.toFixed(2)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <div className="soft-card rounded-xl p-4">
                <h2 className="text-[14px] font-bold">Order Summary</h2>
                <div className="mt-3 space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#6e797b]">Subtotal ({cartCount} items)</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6e797b]">Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-bold text-[#006872]">FREE</span>
                    ) : (
                      <span className="font-bold">${shipping.toFixed(2)}</span>
                    )}
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] text-[#6e797b]">
                      Add ${(50 - cartTotal).toFixed(2)} more for free shipping.
                    </p>
                  )}
                  <div className="flex justify-between border-t border-[#f0eded] pt-2">
                    <span className="font-bold">Total</span>
                    <span className="text-[18px] font-extrabold">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={checkingOut}
                  onClick={onCheckout}
                  className="mt-4 w-full rounded-lg bg-[#006872] py-3 text-[13px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
                >
                  Proceed to Checkout
                </button>
                <Link
                  href="/products"
                  className="mt-2 flex w-full items-center justify-center gap-1 text-[12px] font-bold text-[#006872]"
                >
                  <Icon name="arrow_back" className="text-[16px]" /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
