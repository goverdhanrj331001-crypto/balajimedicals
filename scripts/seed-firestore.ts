// ─── Firestore Seed Script ───────────────────────────────────────
// Run: bun run scripts/seed-firestore.ts
//
// This script:
//   1. Creates the admin user in Firebase Auth (admin@balajimedical.com / admin123)
//   2. Sets custom claims { role: 'admin', status: 'active' } on that user
//   3. Creates a demo customer user (user@balajimedical.com / user123)
//   4. Seeds all 14 Firestore collections with demo data
//
// Re-runnable: idempotent — uses doc IDs from seed.ts so re-runs upsert.

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { seedData } from '../src/lib/store/seed';

// ─── Load env ────────────────────────────────────────────────────
const envPath = new URL('../.env', import.meta.url);
const envText = readFileSync(envPath, 'utf-8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) {
    let v = m[2];
    // Strip surrounding quotes
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[m[1]] = v;
  }
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n');

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});
const auth = getAuth(app);
const db = getFirestore(app);

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
};

async function seedCollection(name: string, items: any[]) {
  const col = db.collection(colNames[name] ?? name);
  let count = 0;
  for (const item of items) {
    const id = String(item.id);
    const docRef = col.doc(id);
    const snap = await docRef.get();
    const payload = { ...item, updatedAt: Date.now() };
    if (snap.exists) {
      await docRef.set({ ...payload, createdAt: snap.get('createdAt') ?? Date.now() }, { merge: true });
    } else {
      await docRef.set({ ...payload, createdAt: payload.createdAt ?? Date.now() });
    }
    count++;
  }
  console.log(`  ✓ ${name}: ${count} docs`);
}

async function ensureUser(email: string, password: string, name: string, role: string) {
  let uid: string;
  try {
    const u = await auth.getUserByEmail(email);
    uid = u.uid;
    console.log(`  • User ${email} already exists (uid=${uid})`);
  } catch {
    const u = await auth.createUser({ email, password, displayName: name });
    uid = u.uid;
    console.log(`  ✓ Created user ${email} (uid=${uid})`);
  }
  await auth.setCustomUserClaims(uid, { role, status: 'active' });
  console.log(`  ✓ Set custom claims { role: '${role}' } on ${email}`);
  return uid;
}

async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log('  Firestore + Auth Seed Script');
  console.log('  Project:', projectId);
  console.log('════════════════════════════════════════════════════════\n');

  console.log('▸ Step 1: Create / update Auth users...');
  const adminUid = await ensureUser('admin@medidemo.com', 'admin123', 'Admin User', 'admin');
  const customerUid = await ensureUser('user@medidemo.com', 'user123', 'Health User', 'patient');
  console.log('');

  console.log('▸ Step 2: Seed Firestore collections...');
  await seedCollection('products', seedData.products);
  await seedCollection('categories', seedData.categories);
  await seedCollection('brands', seedData.brands);
  await seedCollection('offers', seedData.offers);
  await seedCollection('banners', seedData.banners);
  await seedCollection('healthConcerns', seedData.healthConcerns);
  await seedCollection('labPackages', seedData.labPackages);
  await seedCollection('labTests', seedData.labTests);
  await seedCollection('orders', seedData.orders);
  await seedCollection('employees', seedData.employees);
  await seedCollection('supportTickets', seedData.supportTickets);
  await seedCollection('transactions', seedData.transactions);
  await seedCollection('settings', seedData.settings);

  // Users collection — link to auth UIDs
  console.log('  • users (linking to auth UIDs)...');
  const usersCol = db.collection('users');
  for (const u of seedData.users) {
    let uid: string;
    if (u.email === 'admin@medidemo.com') uid = adminUid;
    else if (u.email === 'user@medidemo.com') uid = customerUid;
    else uid = u.id;
    await usersCol.doc(uid).set(
      {
        ...u,
        id: uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  }
  console.log(`  ✓ users: ${seedData.users.length} docs`);

  console.log('');
  console.log('════════════════════════════════════════════════════════');
  console.log('  ✅ Seeding complete!');
  console.log('');
  console.log('  Admin login:    admin@medidemo.com / admin123');
  console.log('  Customer login: user@medidemo.com / user123');
  console.log('════════════════════════════════════════════════════════');
}

main().catch((e) => {
  console.error('✗ Seed failed:', e);
  process.exit(1);
});
