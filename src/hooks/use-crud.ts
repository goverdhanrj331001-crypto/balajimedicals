'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseCrudOptions {
  /** URL of the admin collection, e.g. /api/admin/products */
  endpoint: string;
  /** Initial load */
  initialFetch?: boolean;
}

interface CrudState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string, patch: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
}

export function useCrud<T extends { id: string }>({ endpoint, initialFetch = true }: UseCrudOptions): CrudState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load');
      setItems(data.items ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
      toast.error(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Create failed');
      setItems((prev) => [json.item, ...prev]);
      toast.success('Created successfully');
      return json.item;
    } catch (e: any) {
      toast.error(e.message ?? 'Create failed');
      return null;
    }
  }, [endpoint]);

  const update = useCallback(async (id: string, patch: Partial<T>): Promise<T | null> => {
    try {
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Update failed');
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...json.item } : it)));
      toast.success('Updated successfully');
      return json.item;
    } catch (e: any) {
      toast.error(e.message ?? 'Update failed');
      return null;
    }
  }, [endpoint]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Delete failed');
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success('Deleted successfully');
      return true;
    } catch (e: any) {
      toast.error(e.message ?? 'Delete failed');
      return false;
    }
  }, [endpoint]);

  useEffect(() => {
    if (initialFetch) refetch();
  }, [refetch, initialFetch]);

  return { items, loading, error, refetch, create, update, remove };
}
