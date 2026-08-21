// ─── Firebase Client SDK (browser-side) ──────────────────────────
// Used in client components for Auth + Firestore real-time.

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './config';

// Always initialize the app (even with empty config) so that hooks that
// reference it do not throw at import time. The actual auth/db calls will
// short-circuit when isFirebaseConfigured is false.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseApp = app;

export const auth = isFirebaseConfigured ? getAuth(app) : null;
export const db = isFirebaseConfigured ? getFirestore(app) : null;

// Analytics — lazy-loaded only in browser, only if measurementId is set.
// Avoids SSR issues and unnecessary bundle on server.
export let analytics: ReturnType<typeof import('firebase/analytics').getAnalytics> | null = null;

if (isFirebaseConfigured && typeof window !== 'undefined' && firebaseConfig.measurementId) {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) =>
      isSupported().then((ok) => {
        if (ok) analytics = getAnalytics(app);
      }),
    )
    .catch(() => {
      // Analytics blocked (e.g. ad blocker) — silently ignore.
    });
}
