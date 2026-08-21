// ─── Firestore repository ────────────────────────────────────────
// Used when real Firebase Admin SDK credentials are configured.
// Mirrors the in-memory store's API.
//
// firebase-admin v14 uses @google-cloud/firestore under the hood, where
// methods like collection(), doc(), query() live on the Firestore instance
// itself — not as top-level exports.

import { getAdminFirestore } from '@/lib/firebase/admin';
import type { QueryOpts } from './repo';

const colNames: Record<string, string> = {
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  offers: 'offers',
  banners: 'banners',
  healthConcerns: 'health_concerns',
  labPackages: 'lab_packages',
  labTests: 'lab_tests',
  orders: 'orders',
  users: 'users',
  employees: 'employees',
  supportTickets: 'support_tickets',
  transactions: 'transactions',
  settings: 'settings',
  reviews: 'reviews',
};

const opMap: Record<string, '<' | '<=' | '==' | '!=' | '>=' | '>' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any'> = {
  '==': '==',
  '!=': '!=',
  in: 'in',
};

// Firestore rejects `undefined` values. Recursively strip them.
function stripUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = stripUndefined(v);
  }
  return out;
}

export const firestoreRepo = {
  async list(col: string, opts?: QueryOpts) {
    const fs = await getAdminFirestore();
    if (!fs) return [];
    const colRef = (fs as any).collection(colNames[col] ?? col);
    let q: any = colRef;
    if (opts?.where) {
      for (const c of opts.where) {
        const op = opMap[c.op];
        if (!op) continue;
        q = q.where(c.field, op, c.value);
      }
    }
    if (opts?.orderBy) q = q.orderBy(opts.orderBy, opts.orderDir ?? 'asc');
    if (opts?.limit) q = q.limit(opts.limit);
    const snap = await q.get();
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  },
  async get(col: string, id: string) {
    const fs = await getAdminFirestore();
    if (!fs) return null;
    const snap = await (fs as any).collection(colNames[col] ?? col).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  },
  async create(col: string, data: any) {
    const fs = await getAdminFirestore();
    if (!fs) throw new Error('Firestore not configured');
    const payload = stripUndefined({ ...data, createdAt: Date.now(), updatedAt: Date.now() });
    if (data.id) {
      await (fs as any).collection(colNames[col] ?? col).doc(String(data.id)).set(payload);
      return { ...payload, id: data.id };
    }
    const ref = await (fs as any).collection(colNames[col] ?? col).add(payload);
    return { ...payload, id: ref.id };
  },
  async update(col: string, id: string, patch: any) {
    const fs = await getAdminFirestore();
    if (!fs) throw new Error('Firestore not configured');
    const cleanPatch = stripUndefined({ ...patch, updatedAt: Date.now() });
    await (fs as any).collection(colNames[col] ?? col).doc(id).update(cleanPatch);
    return this.get(col, id);
  },
  async delete(col: string, id: string) {
    const fs = await getAdminFirestore();
    if (!fs) throw new Error('Firestore not configured');
    await (fs as any).collection(colNames[col] ?? col).doc(id).delete();
    return true;
  },
  async count(col: string) {
    const list = await this.list(col);
    return list.length;
  },
};
