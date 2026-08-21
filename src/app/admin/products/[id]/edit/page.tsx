'use client';

import { useEffect, useState } from 'react';
import { ProductFormPage } from '@/components/admin/product-form-page';
import { AdminLayout } from '@/components/admin/admin-layout';
import type { Product } from '@/types';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (params && typeof params.then === 'function') {
      params.then((p) => {
        if (!cancelled) setId(p.id);
      });
    } else if (params) {
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => {
        if (!cancelled) setId((params as any).id);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch('/api/admin/products', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const found = (d.items ?? []).find((p: Product) => p.id === id);
        setProduct(found ?? null);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex h-96 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <p className="text-[14px] font-bold">Product not found</p>
          <p className="mt-1 text-[12px] text-[#6e797b]">The product you're trying to edit doesn't exist.</p>
        </div>
      </AdminLayout>
    );
  }

  return <ProductFormPage initial={product} />;
}
