import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/store/repo';

export const dynamic = 'force-dynamic';

// Returns dashboard KPIs aggregated from collections.
export async function GET(_req: NextRequest) {
  try {
    const [orders, products, users, tickets, transactions, labOrders] = await Promise.all([
      repo.list('orders', { where: [{ field: 'type', op: '==', value: 'medicine' }] }),
      repo.list('products'),
      repo.list('users'),
      repo.list('supportTickets'),
      repo.list('transactions'),
      repo.list('orders', { where: [{ field: 'type', op: '==', value: 'lab' }] }),
    ]);

    const totalRevenue = transactions
      .filter((t) => t.status === 'Completed')
      .reduce((s, t) => s + Number(t.amount), 0);

    const pendingActions =
      orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length +
      tickets.filter((t) => t.status === 'Open' || t.status === 'Pending').length;

    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    // Recent orders (latest 5)
    const recentOrders = [...orders]
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 5);

    // Top products by sales (synthetic — derived from order items)
    const salesMap = new Map<string, number>();
    for (const o of orders) {
      for (const item of o.items ?? []) {
        if (!item.productId) continue;
        salesMap.set(item.productId, (salesMap.get(item.productId) ?? 0) + (item.qty ?? 0));
      }
    }
    const topProducts = Array.from(salesMap.entries())
      .map(([pid, sold]) => {
        const p = products.find((x) => x.id === pid);
        return p ? { id: p.id, name: p.shortName ?? p.name, sold } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b!.sold - a!.sold))
      .slice(0, 5);

    // 7-day sales trend (synthetic from orders)
    const now = Date.now();
    const dayMs = 86_400_000;
    const trend: { day: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = now - i * dayMs;
      const dayOrders = orders.filter((o) => Math.abs((o.createdAt ?? 0) - start) < dayMs);
      const rev = dayOrders.reduce((s, o) => s + Number(o.total ?? 0), 0);
      const day = new Date(start).toLocaleDateString('en-US', { weekday: 'short' });
      trend.push({ day, revenue: Math.round(rev), orders: dayOrders.length });
    }

    return NextResponse.json({
      stats: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: orders.length + labOrders.length,
        newCustomers: users.length,
        pendingActions,
        lowStock,
        outOfStock,
        totalProducts: products.length,
        openTickets: tickets.filter((t) => t.status !== 'Closed').length,
      },
      recentOrders,
      topProducts,
      trend,
      recentActivity: [
        ...orders.slice(0, 3).map((o) => ({
          icon: 'shopping_bag',
          title: 'New order',
          text: `Order #${o.id} by ${o.customerName}`,
          time: timeAgo(o.createdAt),
        })),
        ...tickets.slice(0, 2).map((t) => ({
          icon: 'support_agent',
          title: 'Support ticket',
          text: `${t.subject} — ${t.customerName}`,
          time: timeAgo(t.createdAt),
        })),
      ].slice(0, 5),
    });
  } catch (e: any) {
    console.error('[stats]', e);
    return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 });
  }
}

function timeAgo(ts?: number) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 36_00_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 36_00_000)} hr ago`;
  return `${Math.floor(diff / 86_400_000)} day ago`;
}
