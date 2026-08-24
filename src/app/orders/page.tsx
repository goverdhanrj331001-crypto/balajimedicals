'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';
import type { Order } from '@/types';

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
      </div>
    }>
      <OrdersPageInner />
    </Suspense>
  );
}

function OrdersPageInner() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'medicine' | 'lab'>('all');
  const userId = user?.uid;

  // Read ?tab= from URL and set active tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'lab' || tab === 'medicine' || tab === 'all') {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
      <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
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
      <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
        <DesktopHeader />
        <StoreHeader search={false} />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdfa] text-[#006872]">
            <Icon name="lock" className="text-[36px]" />
          </div>
          <h2 className="mt-4 text-[18px] font-bold text-[#0f172a]">Please login to view your orders</h2>
          <p className="mt-1 text-[13px] text-[#64748b]">Track medicines and download your digital lab test reports.</p>
          <Link href="/login?redirect=/orders" className="mt-5 rounded-xl bg-[#006872] px-6 py-2.5 text-[13px] font-bold text-white shadow-xs hover:bg-[#00535b]">
            Login to Your Account
          </Link>
        </div>
        <DesktopFooter />
        <BottomNav />
      </div>
    );
  }

  const filteredOrders = orders
    .filter((o) => (activeTab === 'all' ? true : o.type === activeTab))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  const labOrdersCount = orders.filter((o) => o.type === 'lab').length;
  const medicineOrdersCount = orders.filter((o) => o.type === 'medicine').length;

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas mx-auto max-w-7xl px-4 md:px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-[#0f172a]">Order History &amp; Reports</h1>
            <p className="text-[13px] text-[#64748b] mt-0.5">{orders.length} total order(s) placed</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/products" className="rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#334155] hover:bg-[#f1f5f9] shadow-2xs">
              + Shop Medicines
            </Link>
            <Link href="/lab-tests" className="rounded-xl bg-[#006872] px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-[#00535b] shadow-2xs">
              + Book Lab Test
            </Link>
          </div>
        </div>

        {/* Order Type Tabs */}
        <div className="mt-5 flex gap-2 border-b border-[#e2e8f0] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-xl px-4 py-2 text-[12.5px] font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#006872] text-white shadow-xs'
                : 'bg-white text-[#64748b] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('medicine')}
            className={`rounded-xl px-4 py-2 text-[12.5px] font-bold transition cursor-pointer ${
              activeTab === 'medicine'
                ? 'bg-[#006872] text-white shadow-xs'
                : 'bg-white text-[#64748b] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            💊 Medicines ({medicineOrdersCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lab')}
            className={`rounded-xl px-4 py-2 text-[12.5px] font-bold transition cursor-pointer ${
              activeTab === 'lab'
                ? 'bg-[#006872] text-white shadow-xs'
                : 'bg-white text-[#64748b] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
            }`}
          >
            🔬 Lab Tests &amp; Reports ({labOrdersCount})
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-[#e2e8f0] bg-white p-12 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdfa] text-[#006872]">
              <Icon name="receipt_long" className="text-[36px]" />
            </div>
            <h2 className="mt-4 text-[18px] font-bold text-[#0f172a]">No orders found in this category</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">Explore medicines and diagnostic tests with doorstep delivery.</p>
            <div className="mt-5 flex gap-3">
              <Link href="/products" className="rounded-xl bg-[#006872] px-5 py-2.5 text-[12.5px] font-bold text-white shadow-xs hover:bg-[#00535b]">
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {filteredOrders.map((o) => {
              const isLab = o.type === 'lab';
              const isCompleted = o.status === 'Delivered' || o.status === 'Completed';

              return (
                <div key={o.id} className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all hover:shadow-md">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#f1f5f9] pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-extrabold text-[#006872]">#{o.id}</span>
                        <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10.5px] font-bold uppercase text-[#334155]">
                          {isLab ? '🔬 Lab Diagnostic' : '💊 Medicine'}
                        </span>
                        {isLab && (
                          <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold ${
                            o.collectionMode === 'home' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#e0e7ff] text-[#4338ca]'
                          }`}>
                            {o.collectionMode === 'home' ? '🏠 Home Collection' : '🏥 Lab Visit'}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11.5px] text-[#64748b]">
                        Booked on {o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        isCompleted
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : o.status === 'Cancelled'
                          ? 'bg-[#fee2e2] text-[#b91c1c]'
                          : 'bg-[#fef3c7] text-[#b45309]'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </div>

                  {/* Patient Info for Lab Tests */}
                  {isLab && (o.patientName || o.patientAge || o.patientGender || o.patientPhone) && (
                    <div className="my-3 rounded-xl bg-[#f8fafc] p-3 border border-[#f1f5f9] text-[12px] text-[#334155] flex flex-wrap gap-x-6 gap-y-1">
                      {o.patientName && <p><span className="text-[#64748b]">Patient:</span> <strong>{o.patientName}</strong></p>}
                      {(o.patientAge || o.patientGender) && <p><span className="text-[#64748b]">Age/Gender:</span> <strong>{o.patientAge ?? '—'} / {o.patientGender ?? '—'}</strong></p>}
                      {o.patientPhone && <p><span className="text-[#64748b]">Contact:</span> <strong>{o.patientPhone}</strong></p>}
                    </div>
                  )}

                  {/* Items list */}
                  <div className="py-3 space-y-1.5">
                    {o.items?.map((it, i) => (
                      <div key={i} className="flex justify-between text-[13px]">
                        <span className="font-medium text-[#0f172a]">{it.name} <span className="text-[#64748b] text-[12px]">× {it.qty}</span></span>
                        <span className="font-bold text-[#0f172a]">₹{(it.price * it.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Lab Test Report Box if Uploaded */}
                  {isLab && o.reportUrl && (
                    <div className="my-3 rounded-2xl border-2 border-[#006872]/20 bg-[#f0fdfa] p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#006872] text-white shadow-xs">
                          <Icon name="description" className="text-[24px]" />
                        </div>
                        <div>
                          <p className="text-[13.5px] font-bold text-[#006872]">Digital Lab Test Report Ready</p>
                          <p className="text-[11.5px] text-[#0f766e]">
                            Verified and uploaded by Balaji Medical Store Pathology Lab.
                          </p>
                        </div>
                      </div>
                      <a
                        href={o.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#006872] px-4 py-2 text-[12.5px] font-bold text-white shadow-xs transition hover:bg-[#00535b] active:scale-95"
                      >
                        <Icon name="download" className="text-[16px]" />
                        <span>View / Download Report</span>
                      </a>
                    </div>
                  )}

                  {/* Bottom details */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f1f5f9] pt-3.5">
                    <span className="text-[12px] text-[#64748b]">
                      {o.shippingAddress ? (
                        <span>📍 {o.shippingAddress}</span>
                      ) : (
                        <span>Payment Method: {o.paymentMethod ?? 'COD'}</span>
                      )}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] text-[#64748b]">Total Amount:</span>
                      <span className="text-[17px] font-extrabold text-[#0f172a]">₹{Number(o.total).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
