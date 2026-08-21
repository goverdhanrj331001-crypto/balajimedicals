'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { StatCard, SectionCard, AdminTable, Toolbar, StatusPill } from '@/components/admin/admin-ui';
import { Modal } from '@/components/admin/ui/modal';
import { Select } from '@/components/admin/ui/form';
import { Icon } from '@/components/ui/icon';
import { useCrud } from '@/hooks/use-crud';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types';

const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Confirmed', 'In Transit', 'Delivered', 'Completed', 'Cancelled'];

interface Props {
  /** Filter orders by type. 'all' shows everything. */
  typeFilter?: 'all' | 'medicine' | 'lab';
  title?: string;
  description?: string;
}

export function OrdersAdminPage({ typeFilter = 'all', title = 'Orders Overview', description }: Props) {
  const { items, loading, update } = useCrud<Order>({ endpoint: '/api/admin/orders' });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let list = items;
    if (typeFilter !== 'all') list = list.filter((o) => o.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [items, search, typeFilter]);

  const openEdit = (o: Order) => {
    setEditing(o);
    setNewStatus(o.status);
  };

  const saveStatus = async () => {
    if (!editing) return;
    setSaving(true);
    const result = await update(editing.id, { status: newStatus });
    setSaving(false);
    if (result) {
      setEditing(null);
      toast.success(`Order #${editing.id} marked as ${newStatus}`);
    }
  };

  const stats = [
    { label: 'Total Orders', value: filtered.length, icon: 'receipt_long', tone: 'teal' as const },
    { label: 'Pending', value: filtered.filter((o) => o.status === 'Pending').length, icon: 'pending', tone: 'gold' as const },
    { label: 'In Transit', value: filtered.filter((o) => o.status === 'In Transit').length, icon: 'local_shipping', tone: 'blue' as const },
    { label: 'Delivered', value: filtered.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length, icon: 'check_circle', tone: 'teal' as const },
  ];

  return (
    <AdminLayout title={title}>
      <div className="mb-6">
        <h2 className="text-[24px] font-extrabold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-[#3e494a]">
          {description ?? 'Review and process customer orders. Update status to keep customers informed.'}
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <SectionCard
        title={title}
        action={<Toolbar placeholder="Search orders..." value={search} onChange={setSearch} />}
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <AdminTable
            headers={['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date']}
            rows={filtered.map((_) => ['', '', '', '', '', ''])}
            onAction={(i) => openEdit(filtered[i])}
            renderRow={(_row, ri) => {
              const o = filtered[ri];
              return (
                <>
                  <td className="px-3 py-3 text-[12px] font-bold text-[#006872]">{o.id}</td>
                  <td className="px-3 py-3 text-[12px]">
                    <p className="font-bold">{o.customerName}</p>
                    <p className="text-[10px] text-[#6e797b]">{o.customerEmail}</p>
                  </td>
                  <td className="px-3 py-3 text-[12px]">{o.items?.length ?? 0} item(s)</td>
                  <td className="px-3 py-3 text-[12px] font-bold">${Number(o.total).toFixed(2)}</td>
                  <td className="px-3 py-3"><StatusPill value={o.status} /></td>
                  <td className="px-3 py-3 text-[11px] text-[#6e797b]">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                  </td>
                </>
              );
            }}
          />
        )}
      </SectionCard>

      {/* Edit order status modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Order ${editing.id}` : ''}
        description={editing ? `Customer: ${editing.customerName} (${editing.customerEmail})` : ''}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-[#bdc9ca] bg-white px-4 py-2.5 text-[12px] font-bold text-[#3e494a] hover:bg-[#f5f3f3]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={saveStatus}
              className="rounded-lg bg-[#006872] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Status'}
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="rounded-lg bg-[#f5f3f3] p-3">
              <p className="text-[11px] font-bold uppercase text-[#6e797b]">Order Details</p>
              <p className="mt-1 text-[13px]">Type: <span className="font-bold capitalize">{editing.type}</span></p>
              <p className="text-[13px]">Total: <span className="font-bold">${Number(editing.total).toFixed(2)}</span></p>
              <p className="text-[13px]">Payment: <span className="font-bold">{editing.paymentMethod ?? 'COD'}</span></p>
              {editing.shippingAddress && <p className="text-[13px]">Address: <span className="font-bold">{editing.shippingAddress}</span></p>}
              {editing.scheduledAt && (
                <p className="text-[13px]">Scheduled: <span className="font-bold">{new Date(editing.scheduledAt).toLocaleString()}</span></p>
              )}
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-[#6e797b]">Items</p>
              <div className="space-y-1">
                {editing.items?.map((it, i) => (
                  <div key={i} className="flex justify-between rounded bg-white p-2 text-[12px]">
                    <span>{it.name}</span>
                    <span className="text-[#6e797b]">×{it.qty} · ${Number(it.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {editing.prescriptionUrl && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase text-[#6e797b]">Prescription</p>
                <a
                  href={editing.prescriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-[#bdc9ca] bg-white p-2 text-[12px] font-bold text-[#006872] hover:bg-[#f5f3f3]"
                >
                  <Icon name="description" className="text-[18px]" /> View Prescription
                </a>
                <p className="mt-1 text-[10px] text-[#6e797b]">
                  Verified: {editing.prescriptionVerified ? 'Yes' : 'No'}
                </p>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-[11px] font-bold text-[#3e494a]">Update Status</p>
              <Select
                options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              />
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
