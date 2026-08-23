'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { StatCard, SectionCard, AdminTable, StatusPill } from '@/components/admin/admin-ui';
import { Icon } from '@/components/ui/icon';

interface ReportData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    newCustomers: number;
    pendingActions: number;
    lowStock: number;
    outOfStock: number;
    totalProducts: number;
    openTickets: number;
  };
  trend: { day: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; sold: number }[];
  recentOrders: any[];
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Analytics & Reports">
      <div className="mb-6">
        <h2 className="text-[24px] font-extrabold tracking-tight">Analytics & Reports</h2>
        <p className="mt-1 text-[13px] text-[#3e494a]">
          Insights across sales, inventory, customers, and operations.
        </p>
      </div>

      {loading || !data ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Revenue" value={`₹${data.stats.totalRevenue.toLocaleString('en-IN')}`} icon="payments" />
            <StatCard label="Total Orders" value={data.stats.totalOrders} icon="receipt_long" tone="blue" />
            <StatCard label="Avg. Order Value" value={`₹${data.stats.totalOrders ? Math.round(data.stats.totalRevenue / data.stats.totalOrders).toLocaleString('en-IN') : 0}`} icon="trending_up" tone="gold" />
            <StatCard label="Open Tickets" value={data.stats.openTickets} icon="support_agent" tone="red" />
          </div>

          {/* Trend chart */}
          <SectionCard title="Weekly Revenue Trend" className="mt-5">
            <div className="h-[300px]">
              <BarChart trend={data.trend} />
            </div>
          </SectionCard>

          {/* Top products table */}
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <SectionCard title="Top Selling Products">
              <AdminTable
                headers={['Product', 'Units Sold', 'Rank']}
                rows={data.topProducts.map((_) => ['', '', ''])}
                showAction={false}
                renderRow={(_row, ri) => {
                  const p = data.topProducts[ri];
                  return (
                    <>
                      <td className="px-3 py-3 text-[12px] font-bold">{p.name}</td>
                      <td className="px-3 py-3 text-[12px]">{p.sold}</td>
                      <td className="px-3 py-3"><StatusPill value={ri === 0 ? 'High' : ri < 3 ? 'Medium' : 'Low'} /></td>
                    </>
                  );
                }}
              />
            </SectionCard>

            <SectionCard title="Inventory Health">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-[#fff4f2] p-3">
                  <div className="flex items-center gap-3">
                    <Icon name="error" className="text-[#ba1a1a]" />
                    <div>
                      <p className="text-[12px] font-bold">Out of Stock</p>
                      <p className="text-[11px] text-[#6e797b]">Urgent restock needed</p>
                    </div>
                  </div>
                  <span className="text-[20px] font-extrabold text-[#910816]">{data.stats.outOfStock}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#fff8e1] p-3">
                  <div className="flex items-center gap-3">
                    <Icon name="warning" className="text-[#835400]" />
                    <div>
                      <p className="text-[12px] font-bold">Low Stock</p>
                      <p className="text-[11px] text-[#6e797b]">Below reorder level</p>
                    </div>
                  </div>
                  <span className="text-[20px] font-extrabold text-[#835400]">{data.stats.lowStock}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#d9eeee] p-3">
                  <div className="flex items-center gap-3">
                    <Icon name="check_circle" className="text-[#006872]" />
                    <div>
                      <p className="text-[12px] font-bold">Total Products</p>
                      <p className="text-[11px] text-[#6e797b]">In catalog</p>
                    </div>
                  </div>
                  <span className="text-[20px] font-extrabold text-[#006872]">{data.stats.totalProducts}</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function BarChart({ trend }: { trend: { day: string; revenue: number; orders: number }[] }) {
  if (!trend.length) return <div className="text-center text-[12px] text-[#6e797b]">No data</div>;
  const max = Math.max(...trend.map((t) => t.revenue), 1);
  return (
    <div className="flex h-full items-end justify-around gap-2 pt-6">
      {trend.map((t, i) => {
        const h = (t.revenue / max) * 100;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full max-w-[60px] flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#006872] to-[#00838f] transition-all"
                style={{ height: `${Math.max(2, h)}%` }}
                title={`₹${t.revenue.toLocaleString('en-IN')} · ${t.orders} orders`}
              />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-[#1b1c1c]">₹{t.revenue.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-[#6e797b]">{t.day}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
