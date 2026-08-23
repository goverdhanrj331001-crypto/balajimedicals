'use client';

import { useMemo, useState, useRef } from 'react';
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
  const [reportUrl, setReportUrl] = useState<string>('');
  const [uploadingReport, setUploadingReport] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let list = items;
    if (typeFilter !== 'all') list = list.filter((o) => o.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.patientName && o.patientName.toLowerCase().includes(q)) ||
        (o.patientPhone && o.patientPhone.includes(q))
      );
    }
    return list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [items, search, typeFilter]);

  const openEdit = (o: Order) => {
    setEditing(o);
    setNewStatus(o.status);
    setReportUrl(o.reportUrl ?? '');
  };

  const handleReportUpload = async (file: File) => {
    setUploadingReport(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Report upload failed');
      setReportUrl(data.url);
      toast.success('Lab test report uploaded successfully');
    } catch (e: any) {
      toast.error(e.message ?? 'Report upload failed');
    } finally {
      setUploadingReport(false);
    }
  };

  const saveStatus = async () => {
    if (!editing) return;
    setSaving(true);
    const patch: Partial<Order> = { status: newStatus };
    if (reportUrl !== (editing.reportUrl ?? '')) {
      patch.reportUrl = reportUrl;
      patch.reportUploadedAt = Date.now();
    }
    const result = await update(editing.id, patch);
    setSaving(false);
    if (result) {
      setEditing(null);
      toast.success(`Order #${editing.id} updated successfully`);
    }
  };

  const stats = [
    { label: 'Total Orders', value: filtered.length, icon: 'receipt_long', tone: 'teal' as const },
    { label: 'Pending', value: filtered.filter((o) => o.status === 'Pending').length, icon: 'pending', tone: 'gold' as const },
    { label: 'In Transit / Scheduled', value: filtered.filter((o) => o.status === 'In Transit' || o.status === 'Confirmed').length, icon: 'local_shipping', tone: 'blue' as const },
    { label: 'Completed', value: filtered.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length, icon: 'check_circle', tone: 'teal' as const },
  ];

  return (
    <AdminLayout title={title}>
      <div className="mb-6">
        <h2 className="text-[24px] font-extrabold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-[#3e494a]">
          {description ?? 'Review and process customer orders. Update status and attach digital lab reports.'}
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <SectionCard
        title={title}
        action={<Toolbar placeholder="Search by Order ID, Name, Phone..." value={search} onChange={setSearch} />}
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <AdminTable
            headers={['Order ID', 'Customer / Patient', 'Type & Mode', 'Items', 'Total', 'Status', 'Report']}
            rows={filtered.map((_) => ['', '', '', '', '', '', ''])}
            onAction={(i) => openEdit(filtered[i])}
            renderRow={(_row, ri) => {
              const o = filtered[ri];
              const isLab = o.type === 'lab';
              return (
                <>
                  <td className="px-3 py-3 text-[12px] font-bold text-[#006872]">
                    #{o.id}
                    <p className="text-[10px] font-normal text-[#6e797b]">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-[12px]">
                    <p className="font-bold text-[#1b1c1c]">{o.patientName || o.customerName}</p>
                    <p className="text-[11px] text-[#6e797b]">
                      {o.patientPhone || o.customerEmail}
                      {o.patientAge ? ` · Age: ${o.patientAge}` : ''}
                      {o.patientGender ? ` (${o.patientGender})` : ''}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-[12px]">
                    <div className="flex flex-col gap-1">
                      <span className="inline-block w-fit rounded bg-[#f0eded] px-2 py-0.5 text-[10px] font-bold uppercase text-[#3e494a]">
                        {o.type}
                      </span>
                      {isLab && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          o.collectionMode === 'home'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : 'bg-[#e0e7ff] text-[#4338ca]'
                        }`}>
                          {o.collectionMode === 'home' ? '🏠 Home Collection' : '🏥 Lab Visit'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12px]">
                    <p className="font-medium text-[#1b1c1c] truncate max-w-[180px]">
                      {o.items?.[0]?.name ?? '—'}
                    </p>
                    {(o.items?.length ?? 0) > 1 && (
                      <p className="text-[10px] text-[#6e797b]">+{o.items.length - 1} more item(s)</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[12px] font-bold">₹{Number(o.total).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3"><StatusPill value={o.status} /></td>
                  <td className="px-3 py-3 text-[12px]">
                    {o.reportUrl ? (
                      <a
                        href={o.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#d9eeee] px-2.5 py-1 text-[11px] font-bold text-[#006872] hover:bg-[#bce4e4] transition"
                      >
                        <Icon name="description" className="text-[14px]" />
                        <span>View</span>
                      </a>
                    ) : isLab ? (
                      <span className="text-[11px] text-[#94a3b8]">Pending</span>
                    ) : (
                      <span className="text-[11px] text-[#94a3b8]">—</span>
                    )}
                  </td>
                </>
              );
            }}
          />
        )}
      </SectionCard>

      {/* Edit order status & Upload report modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Order #${editing.id}` : ''}
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
              disabled={saving || uploadingReport}
              onClick={saveStatus}
              className="rounded-lg bg-[#006872] px-5 py-2.5 text-[12px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            {/* Order & Patient Details Banner */}
            <div className="rounded-xl bg-[#f5f3f3] p-3.5 border border-[#e4e2e1] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e797b]">Order Information</span>
                <span className="rounded bg-[#006872] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  {editing.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[12.5px]">
                <p><span className="text-[#6e797b]">Total:</span> <span className="font-bold">₹{Number(editing.total).toLocaleString('en-IN')}</span></p>
                <p><span className="text-[#6e797b]">Payment:</span> <span className="font-bold">{editing.paymentMethod ?? 'COD'}</span></p>
                {editing.patientName && (
                  <p className="col-span-2"><span className="text-[#6e797b]">Patient:</span> <span className="font-bold">{editing.patientName}</span></p>
                )}
                {editing.patientPhone && (
                  <p><span className="text-[#6e797b]">Phone:</span> <span className="font-bold">{editing.patientPhone}</span></p>
                )}
                {(editing.patientAge || editing.patientGender) && (
                  <p><span className="text-[#6e797b]">Age/Gender:</span> <span className="font-bold">{editing.patientAge ?? '—'} / {editing.patientGender ?? '—'}</span></p>
                )}
                {editing.type === 'lab' && (
                  <p className="col-span-2">
                    <span className="text-[#6e797b]">Collection Mode:</span>{' '}
                    <span className="font-bold text-[#006872]">
                      {editing.collectionMode === 'home' ? '🏠 Home Sample Collection' : '🏥 Lab / Store Visit'}
                    </span>
                  </p>
                )}
                {editing.shippingAddress && (
                  <p className="col-span-2"><span className="text-[#6e797b]">Address:</span> <span className="font-medium">{editing.shippingAddress}</span></p>
                )}
                {editing.scheduledAt && (
                  <p className="col-span-2"><span className="text-[#6e797b]">Scheduled Time:</span> <span className="font-bold text-[#006872]">{new Date(editing.scheduledAt).toLocaleString()}</span></p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-[#6e797b]">Ordered Items</p>
              <div className="space-y-1.5">
                {editing.items?.map((it, i) => (
                  <div key={i} className="flex justify-between rounded-lg border border-[#ededed] bg-white p-2.5 text-[12px]">
                    <span className="font-medium">{it.name}</span>
                    <span className="text-[#6e797b]">×{it.qty} · <strong className="text-[#1b1c1c]">₹{Number(it.price).toLocaleString('en-IN')}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Status */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Update Status</label>
              <Select
                options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              />
            </div>

            {/* Lab Test Report Upload Section */}
            {(editing.type === 'lab' || newStatus === 'Completed' || newStatus === 'Delivered') && (
              <div className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Icon name="science" className="text-[18px] text-[#006872]" />
                      <span>Lab Test Report (Digital Result)</span>
                    </h4>
                    <p className="text-[11px] text-[#64748b]">Upload test report image or PDF for patient to download</p>
                  </div>
                  {reportUrl && (
                    <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[10px] font-bold text-[#15803d]">
                      Report Attached
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleReportUpload(f);
                  }}
                />

                {reportUrl ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-white p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d9eeee] text-[#006872]">
                        <Icon name="description" className="text-[22px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-[#0f172a] truncate">Lab_Report_Ready</p>
                        <a
                          href={reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-[#006872] hover:underline"
                        >
                          View / Download Uploaded Report ↗
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg border border-[#cbd5e1] px-2.5 py-1 text-[11px] font-bold text-[#3e494a] hover:bg-[#f1f5f9]"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportUrl('')}
                        className="rounded-lg border border-[#fca5a5] px-2 py-1 text-[11px] font-bold text-[#dc2626] hover:bg-[#fef2f2]"
                        title="Remove report"
                      >
                        <Icon name="delete" className="text-[14px]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploadingReport}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#006872]/40 bg-white p-4 transition hover:border-[#006872] hover:bg-[#f0fdfa] cursor-pointer"
                  >
                    {uploadingReport ? (
                      <div className="flex items-center gap-2 text-[12px] font-bold text-[#006872]">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
                        <span>Uploading Report…</span>
                      </div>
                    ) : (
                      <>
                        <Icon name="upload_file" className="text-[28px] text-[#006872]" />
                        <span className="mt-1 text-[12px] font-bold text-[#006872]">+ Click to Upload Patient Lab Report</span>
                        <span className="text-[10.5px] text-[#94a3b8]">Supports PNG, JPG, WEBP, PDF (Max 10MB)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
