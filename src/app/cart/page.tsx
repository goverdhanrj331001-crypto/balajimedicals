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
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const shipping = cartTotal >= 50 ? 0 : 5;
  const grandTotal = cartTotal + shipping;

  const onCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!user) {
      toast.info('Please log in to proceed to checkout');
      router.push('/login?redirect=/checkout');
      return;
    }
    setCheckingOut(true);
    router.push('/checkout');
  };

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas mx-auto max-w-7xl px-4 md:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-[#0f172a]">Your Shopping Cart</h1>
            <p className="text-[13px] text-[#64748b] mt-0.5">{cartCount} item(s) in your basket</p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#64748b] transition hover:border-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a] shadow-2xs cursor-pointer active:scale-95"
            >
              <Icon name="delete_outline" className="text-[16px]" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-[#e2e8f0] bg-white p-8 sm:p-12 text-center shadow-xs">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f0fdfa] border border-[#ccfbf1] text-[#006872] shadow-sm">
              <Icon name="shopping_cart" className="text-[38px]" />
            </div>
            <h2 className="mt-4 text-[18px] sm:text-[20px] font-extrabold text-[#0f172a]">Your Cart is Empty</h2>
            <p className="mt-1 max-w-md text-[13px] text-[#64748b]">
              Looks like you haven&apos;t added any medicines or health packages yet. Explore our wide range of products!
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-[#006872] px-5 py-2.5 text-[13px] font-bold text-white shadow-xs transition hover:bg-[#00535b] active:scale-95"
              >
                <Icon name="medication" className="text-[18px]" />
                <span>Explore Medicines</span>
              </Link>
              <Link
                href="/lab-tests"
                className="inline-flex items-center gap-2 rounded-xl border border-[#006872] bg-white px-5 py-2.5 text-[13px] font-bold text-[#006872] shadow-xs transition hover:bg-[#f0fdfa] active:scale-95"
              >
                <Icon name="science" className="text-[18px]" />
                <span>Book Lab Tests</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Cart items */}
            <div className="space-y-3.5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all hover:shadow-md"
                >
                  <Link href={`/products/${item.id}`} className="shrink-0">
                    <ProductArt product={item} className="h-20 w-20 rounded-xl object-contain bg-[#f8fafc] p-1 border border-[#f1f5f9]" />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/products/${item.id}`}>
                          <h3 className="text-[14px] font-bold text-[#0f172a] hover:text-[#006872] transition-colors line-clamp-1">
                            {item.shortName || item.name}
                          </h3>
                        </Link>
                        <p className="mt-0.5 text-[11px] font-medium text-[#64748b]">
                          {item.brand} {item.note ? `· ${item.note}` : ''}
                        </p>
                      </div>

                      {/* Neutral, non-red remove button */}
                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.success('Item removed from cart');
                        }}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#334155] cursor-pointer active:scale-90"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Icon name="close" className="text-[18px]" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#f8fafc]">
                      {/* Quantity Controller */}
                      <div className="flex items-center rounded-lg border border-[#cbd5e1] bg-white shadow-2xs">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center text-[14px] font-bold text-[#475569] transition hover:bg-[#f1f5f9] active:scale-95"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-7 text-center text-[12px] font-bold text-[#0f172a]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center text-[14px] font-bold text-[#475569] transition hover:bg-[#f1f5f9] active:scale-95"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <p className="text-[15px] font-extrabold text-[#0f172a]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10.5px] font-medium text-[#94a3b8]">
                            ₹{item.price.toLocaleString('en-IN')} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <h2 className="text-[16px] font-extrabold text-[#0f172a]">Order Summary</h2>
                <div className="mt-4 space-y-2.5 text-[13px]">
                  <div className="flex justify-between text-[#64748b]">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-bold text-[#0f172a]">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#64748b]">
                    <span>Delivery Charges</span>
                    {shipping === 0 ? (
                      <span className="font-bold text-[#16a34a]">FREE</span>
                    ) : (
                      <span className="font-bold text-[#0f172a]">₹{shipping.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  {shipping > 0 && (
                    <p className="rounded-lg bg-[#f0fdfa] p-2 text-[11px] font-semibold text-[#006872]">
                      Add ₹{(50 - cartTotal).toLocaleString('en-IN')} more to get FREE Delivery!
                    </p>
                  )}
                  <div className="flex justify-between border-t border-[#e2e8f0] pt-3 text-[14px]">
                    <span className="font-bold text-[#0f172a]">Total Payable</span>
                    <span className="text-[20px] font-black text-[#006872]">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={checkingOut}
                  onClick={onCheckout}
                  className="mt-5 w-full rounded-xl bg-[#006872] py-3 text-[13.5px] font-bold text-white shadow-xs transition hover:bg-[#00535b] disabled:opacity-60 cursor-pointer active:scale-98"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 py-1 text-[12.5px] font-bold text-[#006872] hover:underline"
                >
                  <Icon name="arrow_back" className="text-[16px]" />
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Trust assurances */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 space-y-2.5 text-[12px] text-[#64748b]">
                <div className="flex items-center gap-2.5">
                  <Icon name="verified_user" className="text-[18px] text-[#006872]" />
                  <span>100% Genuine Medicines & Products</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon name="local_shipping" className="text-[18px] text-[#006872]" />
                  <span>Superfast delivery straight to your doorstep</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon name="lock" className="text-[18px] text-[#006872]" />
                  <span>Safe and Secure Payments</span>
                </div>
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
