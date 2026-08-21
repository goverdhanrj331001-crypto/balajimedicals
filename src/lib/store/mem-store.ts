// ─── In-memory data store (mock Firestore) ───────────────────────
// Used when real Firebase credentials are not configured.
// Provides the same CRUD API surface as the real Firestore layer so that
// the rest of the app can be written against a single interface.

import { randomUUID } from 'crypto';
import { seedData } from './seed';

type Doc = Record<string, any>;

class MemCollection {
  private docs = new Map<string, Doc>();

  constructor(private initial: Doc[] = []) {
    for (const d of initial) {
      const id = String(d.id ?? randomUUID());
      this.docs.set(id, { ...d, id });
    }
  }

  async list(opts?: { where?: { field: string; op: '==' | '!=' | 'in'; value: any }[]; orderBy?: string; orderDir?: 'asc' | 'desc'; limit?: number }) {
    let items = Array.from(this.docs.values());
    if (opts?.where) {
      for (const cond of opts.where) {
        items = items.filter((d) => {
          const v = d[cond.field];
          if (cond.op === '==') return v === cond.value;
          if (cond.op === '!=') return v !== cond.value;
          if (cond.op === 'in') return Array.isArray(cond.value) && cond.value.includes(v);
          return true;
        });
      }
    }
    if (opts?.orderBy) {
      items.sort((a, b) => {
        const av = a[opts.orderBy!];
        const bv = b[opts.orderBy!];
        if (av === bv) return 0;
        const r = av > bv ? 1 : -1;
        return opts.orderDir === 'desc' ? -r : r;
      });
    }
    if (opts?.limit) items = items.slice(0, opts.limit);
    return items.map((d) => ({ ...d }));
  }

  async get(id: string) {
    const d = this.docs.get(id);
    return d ? { ...d } : null;
  }

  async create(data: Doc) {
    const id = String(data.id ?? randomUUID());
    const doc = { ...data, id, createdAt: data.createdAt ?? Date.now(), updatedAt: Date.now() };
    this.docs.set(id, doc);
    return { ...doc };
  }

  async update(id: string, patch: Doc) {
    const existing = this.docs.get(id);
    if (!existing) throw new Error('Not found: ' + id);
    const updated = { ...existing, ...patch, updatedAt: Date.now() };
    this.docs.set(id, updated);
    return { ...updated };
  }

  async delete(id: string) {
    this.docs.delete(id);
    return true;
  }

  async count() {
    return this.docs.size;
  }
}

class MemStore {
  products = new MemCollection(seedData.products);
  categories = new MemCollection(seedData.categories);
  brands = new MemCollection(seedData.brands);
  offers = new MemCollection(seedData.offers);
  banners = new MemCollection(seedData.banners);
  healthConcerns = new MemCollection(seedData.healthConcerns);
  labPackages = new MemCollection(seedData.labPackages);
  labTests = new MemCollection(seedData.labTests);
  orders = new MemCollection(seedData.orders);
  users = new MemCollection(seedData.users);
  employees = new MemCollection(seedData.employees);
  supportTickets = new MemCollection(seedData.supportTickets);
  transactions = new MemCollection(seedData.transactions);
  settings = new MemCollection(seedData.settings);

  // Auth users (email/password) — only used in mock mode.
  authUsers = new MemCollection(seedData.authUsers);
  reviews = new MemCollection([]);
}

// Singleton — survives across hot reloads in dev.
const g = globalThis as unknown as { __memStore?: MemStore };
export const memStore = g.__memStore ?? new MemStore();
if (!g.__memStore) g.__memStore = memStore;

export const mem = memStore;
