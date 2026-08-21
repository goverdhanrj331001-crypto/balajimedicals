// ─── Firebase Admin SDK (server-side) ────────────────────────────
// Used in API routes / server components for privileged operations.
// Falls back to a no-op when credentials are missing.
//
// IMPORTANT: this file imports `firebase-admin/*` which is a Node-only
// package. It must NEVER be imported from a client component. To check
// admin-SKU availability from the client, use the dedicated lightweight
// helper in `src/lib/firebase/admin-status.ts`.

import { isFirebaseConfigured } from './config';

let adminApp: unknown = null;
let adminAuth: unknown = null;
let adminFirestore: unknown = null;
let adminInitError: string | null = null;

// Whether the Admin SDK has the credentials it needs to actually run.
// Requires both the client config (NEXT_PUBLIC_*) AND the service-account
// credentials (FIREBASE_ADMIN_*).
export const isAdminSdkConfigured = isFirebaseConfigured &&
  Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  );

export async function getAdminApp() {
  if (!isAdminSdkConfigured) return null;
  if (adminApp) return adminApp;
  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    if (getApps().length) {
      adminApp = getApps()[0];
    } else {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
        }),
      });
    }
    return adminApp;
  } catch (e: any) {
    adminInitError = e.message ?? String(e);
    console.error('[firebase-admin] init failed:', adminInitError);
    return null;
  }
}

export async function getAdminAuth() {
  if (!isAdminSdkConfigured) return null;
  if (adminAuth) return adminAuth;
  const app = await getAdminApp();
  if (!app) return null;
  const { getAuth } = await import('firebase-admin/auth');
  adminAuth = getAuth(app as never);
  return adminAuth;
}

export async function getAdminFirestore() {
  if (!isAdminSdkConfigured) return null;
  if (adminFirestore) return adminFirestore;
  const app = await getAdminApp();
  if (!app) return null;
  const { getFirestore } = await import('firebase-admin/firestore');
  adminFirestore = getFirestore(app as never);
  return adminFirestore;
}

export function getAdminInitError() {
  return adminInitError;
}
