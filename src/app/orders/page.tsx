'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';
import type { Order } from '@/types';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = user?.uid;

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      return;
    }
    let cancelled = false;
    fetch('/api/public/orders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setOrders(d.items ?? []);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) {
          setOrders([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId, authLoading]);

  if (authLoading) {
    return (
      <div className="app-root min-h-screen pb-16 md:pb-0">
        <DesktopHeader />
      <StoreHeader search={false} />
        <div className="flex h-96 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
        <DesktopFooter />
      <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-root min-h-screen pb-16 md:pb-0">
        <DesktopHeader />
      <StoreHeader search={false} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon name="lock" className="text-[64px] text-[#bdc9ca]" />
          <p className="mt-3 text-[14px] font-bold">Please login to view your orders</p>
          <Link href="/login?redirect=/orders" className="mt-4 rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white">
            Login
          </Link>
        </div>
        <DesktopFooter />
      <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">Your Orders</h1>
        <p className="text-[13px] text-[#3e494a]">{loading ? 'Loading…' : `${orders.length} order(s) placed`}</p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <Icon name="receipt_long" className="text-[64px] text-[#bdc9ca]" />
            <p className="mt-3 text-[14px] font-bold">No orders yet</p>
            <p className="text-[12px] text-[#6e797b]">Place your first order to see it here.</p>
            <Link href="/products" className="mt-4 rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {orders
              .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
              .map((o) => (
                <div key={o.id} className="soft-card rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-bold text-[#006872]">#{o.id}</p>
                      <p className="text-[11px] text-[#6e797b]">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        o.status === 'Delivered' || o.status === 'Completed'
                          ? 'bg-[#d9eeee] text-[#006872]'
                          : o.status === 'Cancelled'
                          ? 'bg-[#ffdad7] text-[#910816]'
                          : 'bg-[#ffddb5] text-[#835400]'
                      }`}>
                        {o.status}
                      </span>
                      <span className="rounded-full bg-[#f0eded] px-2 py-1 text-[10px] font-bold uppercase text-[#3e494a]">
                        {o.type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 border-t border-[#f0eded] pt-3">
                    {o.items?.map((it, i) => (
                      <div key={i} className="flex justify-between text-[12px]">
                        <span className="text-[#3e494a]">{it.name} × {it.qty}</span>
                        <span className="font-bold">${(it.price * it.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#f0eded] pt-3">
                    <span className="text-[12px] text-[#6e797b]">
                      {o.shippingAddress ? `Ship to: ${o.shippingAddress}` : o.paymentMethod ?? ''}
                    </span>
                    <span className="text-[16px] font-extrabold">${Number(o.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
