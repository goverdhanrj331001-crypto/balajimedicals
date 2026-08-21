// ─── Client-safe admin-SDK status check ─────────────────────────
// Use this in client components. It does NOT import firebase-admin,
// so it won't break the browser bundle.
//
// The actual value comes from a NEXT_PUBLIC_ env var that mirrors
// whether the server-side FIREBASE_ADMIN_* credentials are set.
// Set NEXT_PUBLIC_FIREBASE_ADMIN_READY=true on the server when you
// provide all three FIREBASE_ADMIN_* env vars.

export const isAdminSdkConfiguredClient =
  process.env.NEXT_PUBLIC_FIREBASE_ADMIN_READY === 'true';
