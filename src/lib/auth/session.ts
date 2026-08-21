// ─── Session / Auth helpers (server-side) ────────────────────────
// Verifies the session token (sent from the client as a cookie) and
// resolves the matching user record.
//
// Token types:
//   - Firebase mode: a base64-encoded JSON { uid, email, ts } that we
//     minted ourselves after verifying the password via Firebase Auth
//     REST API. We then look up custom claims (role) via Admin SDK.
//     This avoids the verifyIdToken-vs-custom-token mismatch issue.
//   - Mock mode: same base64-encoded JSON payload.

import { cookies } from 'next/headers';
import { isAdminSdkConfigured, getAdminAuth } from '@/lib/firebase/admin';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { mem } from '@/lib/store/mem-store';
import type { SessionUser, UserRole } from '@/types';

interface DecodedSession {
  uid: string;
  email?: string;
  ts?: number;
}

function decodeSessionToken(token: string): DecodedSession | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decoded && decoded.uid) return decoded as DecodedSession;
    return null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('medidemo-session')?.value;

  if (!token) {
    // Default admin bypass only in mock mode (no Firebase configured).
    if (!isFirebaseConfigured) {
      const admin = (await mem.authUsers.list()).find((u: any) => u.role === 'admin');
      if (admin) {
        return {
          uid: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin' as UserRole,
          status: admin.status,
        };
      }
    }
    return null;
  }

  const decoded = decodeSessionToken(token);
  if (!decoded || !decoded.uid) return null;

  if (isFirebaseConfigured && isAdminSdkConfigured) {
    // Look up the user record + custom claims via Admin SDK.
    const adminAuth = await getAdminAuth();
    if (!adminAuth) return null;
    try {
      const userRecord = await (adminAuth as any).getUser(decoded.uid);
      const role = (userRecord.customClaims?.role ?? 'patient') as UserRole;
      const status = userRecord.customClaims?.status ?? 'active';
      const name = userRecord.displayName ?? decoded.email ?? 'User';
      const email = userRecord.email ?? decoded.email ?? '';
      return { uid: decoded.uid, email, name, role, status };
    } catch (e) {
      console.error('[session] user lookup failed:', (e as Error).message);
      return null;
    }
  }

  // Mock mode: look up in mem store.
  const found = (await mem.authUsers.list()).find((u: any) => u.id === decoded.uid);
  if (!found) return null;
  return {
    uid: found.id,
    email: found.email,
    name: found.name,
    role: found.role as UserRole,
    status: found.status,
  };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    throw new Error('Unauthorized: admin role required');
  }
  return user;
}

export async function requireCustomer(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized: login required');
  return user;
}
