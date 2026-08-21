'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';
import { StatCard, SectionCard, AdminTable, StatusRow, StatusPill } from '@/components/admin/admin-ui';
import { Icon } from '@/components/ui/icon';

interface DashboardData {
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
  recentOrders: any[];
  topProducts: { id: string; name: string; sold: number }[];
  trend: { day: string; revenue: number; orders: number }[];
  recentActivity: { icon: string; title: string; text: string; time: string }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Sales Overview">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] text-[#6e797b]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="mt-1 text-[24px] font-extrabold tracking-tight">Sales Overview</h2>
          <p className="mt-1 text-[13px] text-[#3e494a]">A clear view of your pharmacy operations today.</p>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Revenue" value={`$${data.stats.totalRevenue.toLocaleString()}`} delta="+12.5% from last month" icon="payments" />
            <StatCard label="Total Orders" value={data.stats.totalOrders} delta="+8.2% from last month" icon="shopping_bag" tone="blue" />
            <StatCard label="Customers" value={data.stats.newCustomers} delta="+15.4% from last month" icon="group_add" tone="gold" />
            <StatCard label="Pending Actions" value={data.stats.pendingActions} delta="Needs your attention" icon="pending_actions" tone="red" />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <SectionCard title="Weekly Sales Trend">
              <div className="h-[260px]">
                <TrendChart trend={data.trend} />
              </div>
            </SectionCard>
            <SectionCard title="Recent Activity">
              <div className="space-y-4">
                {data.recentActivity.length === 0 && (
                  <p className="text-center text-[12px] text-[#6e797b]">No recent activity.</p>
                )}
                {data.recentActivity.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9eeee] text-[#006872]">
                      <Icon name={a.icon} className="text-[17px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold">{a.title}</p>
                      <p className="truncate text-[11px] text-[#3e494a]">{a.text}</p>
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-[#6e797b]">{a.time}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <SectionCard
              title="Recent Orders"
              action={<Link href="/admin/orders" className="text-[12px] font-bold text-[#006872]">View All</Link>}
            >
              <AdminTable
                headers={['Order ID', 'Customer', 'Total', 'Status']}
                rows={data.recentOrders.map((_) => ['', '', '', ''])}
                showAction={false}
                renderRow={(_row, ri) => {
                  const o = data.recentOrders[ri];
                  return (
                    <>
                      <td className="px-3 py-3 text-[12px] font-bold text-[#006872]">{o.id}</td>
                      <td className="px-3 py-3 text-[12px]">{o.customerName}</td>
                      <td className="px-3 py-3 text-[12px] font-semibold">${Number(o.total).toFixed(2)}</td>
                      <td className="px-3 py-3"><StatusPill value={o.status} /></td>
                    </>
                  );
                }}
              />
            </SectionCard>

            <SectionCard title="Top Products">
              <div className="space-y-4">
                {data.topProducts.length === 0 && (
                  <p className="text-center text-[12px] text-[#6e797b]">No sales data yet.</p>
                )}
                {data.topProducts.map((p, i) => {
                  const colors = ['bg-[#006872]', 'bg-[#00838f]', 'bg-[#a46a00]', 'bg-[#fc5d59]', 'bg-[#4caf50]'];
                  const maxSold = Math.max(...data.topProducts.map((x) => x.sold), 1);
                  const width = Math.max(15, Math.round((p.sold / maxSold) * 100));
                  return (
                    <div key={p.id}>
                      <div className="mb-1 flex justify-between text-[12px]">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-[#6e797b]">{p.sold} sold</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#eae8e7]">
                        <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <SectionCard title="System Status">
              <StatusRow label="API Services" status="Operational" good />
              <StatusRow label="Payment Gateway" status="Operational" good />
              <StatusRow label="Database" status="Operational" good />
            </SectionCard>
            <SectionCard title="Critical Items">
              <div className="flex items-center gap-3 rounded-lg bg-[#fff4f2] p-3">
                <Icon name="warning" className="text-[#ba1a1a]" />
                <div>
                  <p className="text-[12px] font-bold">{data.stats.lowStock + data.stats.outOfStock} products need restocking</p>
                  <p className="text-[11px] text-[#3e494a]">Review inventory now</p>
                </div>
              </div>
              <div className="mt-2 text-center">
                <Link href="/admin/products" className="text-[12px] font-bold text-[#006872]">Go to Products →</Link>
              </div>
            </SectionCard>
            <SectionCard title="Quick Actions">
              <div className="grid gap-2">
                <Link href="/admin/products" className="flex items-center gap-2 rounded-lg border border-[#bdc9ca] px-3 py-2 text-[12px] font-bold text-[#006872] hover:bg-[#f5f3f3]">
                  <Icon name="add_box" className="text-[18px]" />Add Product
                </Link>
                <Link href="/admin/lab-packages" className="flex items-center gap-2 rounded-lg border border-[#bdc9ca] px-3 py-2 text-[12px] font-bold text-[#006872] hover:bg-[#f5f3f3]">
                  <Icon name="science" className="text-[18px]" />Add Lab Package
                </Link>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function TrendChart({ trend }: { trend: { day: string; revenue: number; orders: number }[] }) {
  if (!trend.length) return <div className="text-center text-[12px] text-[#6e797b]">No data</div>;
  const maxRev = Math.max(...trend.map((t) => t.revenue), 1);
  const w = 700;
  const h = 200;
  const pts = trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * (w - 40) + 20;
    const y = h - 30 - (t.revenue / maxRev) * (h - 60);
    return [x, y];
  });
  const linePath = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const fillPath = `${linePath} L ${pts[pts.length - 1][0]} ${h - 30} L ${pts[0][0]} ${h - 30} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00838f" stopOpacity=".25" />
          <stop offset="1" stopColor="#00838f" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="20" x2={w - 20} y1={h - 30 - f * (h - 60)} y2={h - 30 - f * (h - 60)} stroke="#bdc9ca" strokeDasharray="3 3" strokeWidth="1" />
      ))}
      <path d={fillPath} fill="url(#sales-fill)" />
      <path d={linePath} fill="none" stroke="#006872" strokeWidth="3" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#006872" />
      ))}
      {trend.map((t, i) => (
        <text key={i} x={pts[i][0]} y={h - 10} textAnchor="middle" fontSize="10" fill="#6e797b">
          {t.day}
        </text>
      ))}
    </svg>
  );
}
