'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { StatCard, SectionCard, Toolbar, StatusPill } from '@/components/admin/admin-ui';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { Icon } from '@/components/ui/icon';
import { useCrud } from '@/hooks/use-crud';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const router = useRouter();
  const { items, loading, remove } = useCrud<Product>({ endpoint: '/api/admin/products' });
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.shortName?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q),
    );
  }, [items, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 on search change
  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await remove(deleteTarget.id);
    setDeleting(false);
    if (ok) setDeleteTarget(null);
  };

  const [importing, setImporting] = useState(false);
  const fileImportRef = useRef<HTMLInputElement>(null);

  const downloadSample = async () => {
    window.open('/api/admin/products/sample', '_blank');
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/products/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Import failed');
      toast.success(`Imported ${data.created} of ${data.total} products`);
      if (data.errors?.length) {
        toast.error(`${data.errors.length} rows had errors`);
      }
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message ?? 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const stats = [
    { label: 'Total Products', value: items.length, icon: 'inventory_2', tone: 'teal' as const },
    { label: 'Active', value: items.filter((i) => i.status === 'active').length, icon: 'check_circle', tone: 'blue' as const },
    { label: 'Low Stock', value: items.filter((i) => i.stock > 0 && i.stock <= i.reorderLevel).length, icon: 'warning', tone: 'gold' as const },
    { label: 'Out of Stock', value: items.filter((i) => i.stock === 0).length, icon: 'error', tone: 'red' as const },
  ];

  return (
    <AdminLayout title="Products">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight">Products</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-[#3e494a]">
            Manage medicines, healthcare products, supplements, and devices. Add variants, manage inventory, upload images.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Add New */}
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-[#006872] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-[#00535b]"
          >
            <Icon name="add" className="text-[18px]" /> Add New Product
          </Link>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <SectionCard title="Products" action={<Toolbar placeholder="Search products..." value={search} onChange={setSearch} />}>
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e4e2e1]">
                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">Product</th>
                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">Brand</th>
                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">Type</th>
                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">Price</th>
                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">Stock</th>
                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">Status</th>
                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-[12px] text-[#6e797b]">Loading…</td></tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-[12px] text-[#6e797b]">
                      No products found. Click “Add New Product” to create one.
                    </td>
                  </tr>
                ) : null}
                {paginated.map((p) => {
                  const stockStatus = p.stock === 0 ? 'Out of Stock' : p.stock <= p.reorderLevel ? 'Low Stock' : 'In Stock';
                  return (
                    <tr key={p.id} className="border-b border-[#f0eded] transition hover:bg-[#fbf9f8]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {p.thumbnail || p.imageUrl ? (
                            <img
                              src={p.thumbnail || p.imageUrl}
                              alt={p.shortName}
                              className="h-10 w-10 rounded-lg border border-[#e4e2e1] object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f3f3]">
                              <Icon name="image" className="text-[18px] text-[#bdc9ca]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-bold">{p.shortName || p.name}</p>
                            <p className="truncate text-[10px] text-[#6e797b]">{p.sku} · {p.note}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[12px]">{p.brand}</td>
                      <td className="px-3 py-3 text-[12px]">{p.productType || '—'}</td>
                      <td className="px-3 py-3 text-[12px] font-bold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-3 text-[12px]">{p.stock}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <StatusPill value={stockStatus} />
                          <StatusPill value={p.status === 'active' ? 'Active' : 'Hidden'} />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="rounded p-1 text-[#006872] hover:bg-[#d9eeee]"
                            title="Edit"
                          >
                            <Icon name="edit" className="text-[18px]" />
                          </Link>
                          <button
                            type="button"
                            className="rounded p-1 text-[#910816] hover:bg-[#ffdad7]"
                            onClick={() => setDeleteTarget(p)}
                            title="Delete"
                          >
                            <Icon name="delete" className="text-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-[11px] text-[#6e797b]">
          <span>Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} products</span>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-[#bdc9ca] bg-white px-3 py-1.5 text-[11px] font-bold text-[#3e494a] hover:bg-[#f5f3f3] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Icon name="chevron_left" className="text-[15px]" /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dots');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'dots' ? (
                    <span key={`dots-${idx}`} className="px-0.5 text-[#94a3b8] text-[11px]">…</span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrentPage(item as number)}
                      className={`h-7 w-7 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        currentPage === item
                          ? 'bg-[#006872] text-white'
                          : 'border border-[#bdc9ca] bg-white text-[#3e494a] hover:bg-[#f5f3f3]'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-[#bdc9ca] bg-white px-3 py-1.5 text-[11px] font-bold text-[#3e494a] hover:bg-[#f5f3f3] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next <Icon name="chevron_right" className="text-[15px]" />
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
        message={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
