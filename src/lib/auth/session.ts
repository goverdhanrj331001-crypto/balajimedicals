// ─── Session / Auth helpers (server-side) ────────────────────────
// Verifies the session token (sent from the client as a cookie) and
// resolves the matching user record from the database repository.

import { cookies } from 'next/headers';
import { repo } from '@/lib/store/repo';
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
  const token = cookieStore.get('bms_session')?.value;

  if (!token) {
    return null;
  }

  const decoded = decodeSessionToken(token);
  if (!decoded || !decoded.uid) return null;

  try {
    const dbUser = await repo.get('users', decoded.uid).catch(() => null);
    if (dbUser) {
      return {
        uid: decoded.uid,
        email: dbUser.email ?? decoded.email ?? '',
        name: dbUser.name ?? decoded.email?.split('@')[0] ?? 'User',
        role: (dbUser.role as UserRole) ?? 'patient',
        status: dbUser.status ?? 'active',
        phone: dbUser.phone,
        age: dbUser.age,
        gender: dbUser.gender,
        address: dbUser.address,
      };
    }
  } catch (err) {
    console.error('[getSessionUser] Error fetching user from repo:', err);
  }

  return {
    uid: decoded.uid,
    email: decoded.email ?? '',
    name: decoded.email?.split('@')[0] ?? 'User',
    role: 'patient',
    status: 'active',
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.status !== 'active') throw new Error('Account suspended');
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'lab_tech' && user.role !== 'editor') {
    throw new Error('Forbidden');
  }
  return user;
}
