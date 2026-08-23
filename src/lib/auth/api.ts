// ─── Auth API (server-side) ──────────────────────────────────────
// Handles login, signup, and logout.
//
// In Firebase mode:
//   - Uses Firebase Auth REST API to verify password (Admin SDK can't verify passwords)
//   - Then issues a Firebase custom token via Admin SDK for the client to use as session
// In Mock mode:
//   - Validates against seeded in-memory users
//   - Issues a base64-encoded session token

import { isAdminSdkConfigured, getAdminAuth } from '@/lib/firebase/admin';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { mem } from '@/lib/store/mem-store';
import { repo } from '@/lib/store/repo';
import { randomUUID } from 'crypto';
import type { SessionUser, UserRole } from '@/types';

export interface LoginResult {
  token: string;
  user: SessionUser;
}

// ─── Firebase Auth REST API call ────────────────────────────────
// Verifies email+password and returns the user's Firebase UID.
// We can't use Admin SDK for this — it doesn't expose password verification.
async function verifyPasswordWithFirebase(email: string, password: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message ?? 'Login failed';
    if (msg.includes('INVALID_LOGIN_CREDENTIALS')) {
      throw new Error('Invalid email or password');
    }
    throw new Error(msg);
  }
  return data.localId as string;
}

async function createFirebaseUser(email: string, password: string, name: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message ?? 'Signup failed';
    if (msg.includes('EMAIL_EXISTS')) throw new Error('Email already registered');
    throw new Error(msg);
  }
  const uid = data.localId as string;

  // Update display name via REST API
  try {
    const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
    await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: data.idToken,
        displayName: name,
        returnSecureToken: false,
      }),
    });
  } catch {
    // Non-fatal
  }

  // Set custom claims via Admin SDK
  if (isAdminSdkConfigured) {
    const adminAuth = await getAdminAuth();
    if (adminAuth) {
      await (adminAuth as any).setCustomUserClaims(uid, { role: 'patient', status: 'active' });
    }
  }

  return uid;
}

// ─── Public API ─────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  if (!email || !password) throw new Error('Email and password are required');

  if (isFirebaseConfigured) {
    // Step 1: Verify password via Firebase Auth REST API
    const uid = await verifyPasswordWithFirebase(email, password);

    // Step 2: Get user info + role via Admin SDK & Firestore
    if (isAdminSdkConfigured) {
      const adminAuth = await getAdminAuth();
      if (!adminAuth) throw new Error('Auth not initialized');
      const userRecord = await (adminAuth as any).getUser(uid);
      let role = userRecord.customClaims?.role as UserRole | undefined;
      let status = userRecord.customClaims?.status as string | undefined;

      // Fallback: Check Firestore /users collection if custom claims are not set yet
      if (!role) {
        try {
          const dbUser = await repo.get('users', uid);
          if (dbUser?.role) {
            role = dbUser.role as UserRole;
            status = dbUser.status || 'active';
            // Sync custom claims to Firebase Auth for instant future checks
            await (adminAuth as any).setCustomUserClaims(uid, { role, status });
          }
        } catch (err) {
          console.error('[loginWithEmail] Firestore role fallback error:', err);
        }
      }

      if (!role) role = 'patient';
      if (!status) status = 'active';
      const name = userRecord.displayName ?? email;

      // Step 3: Mint a session token (base64-encoded JSON).
      // We don't use Firebase custom tokens because verifyIdToken()
      // rejects them — they're meant for client-side signInWithCustomToken.
      const token = Buffer.from(
        JSON.stringify({ uid, email, ts: Date.now() }),
        'utf-8',
      ).toString('base64');
      return {
        token,
        user: { uid, email: userRecord.email ?? email, name, role, status },
      };
    }
    throw new Error('Admin SDK not configured');
  }

  // Mock auth: match against seeded users.
  const users = await mem.authUsers.list();
  const u = users.find(
    (x: any) => x.email.toLowerCase() === email.toLowerCase() && x.password === password,
  );
  if (!u) throw new Error('Invalid email or password');
  if (u.status !== 'active') throw new Error('Account is ' + u.status);
  const token = Buffer.from(
    JSON.stringify({ uid: u.id, email: u.email, ts: Date.now() }),
    'utf-8',
  ).toString('base64');
  return {
    token,
    user: { uid: u.id, email: u.email, name: u.name, role: u.role as UserRole, status: u.status },
  };
}

export async function signupWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<LoginResult> {
  if (!email || !password || !name) throw new Error('All fields are required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  if (isFirebaseConfigured) {
    // Step 1: Create user in Firebase Auth via REST API
    const uid = await createFirebaseUser(email, password, name);

    // Step 2: Persist user record in Firestore
    try {
      await repo.create('users', {
        id: uid,
        name,
        email,
        role: 'patient',
        status: 'active',
        lastLogin: Date.now(),
        createdAt: Date.now(),
      });
    } catch (e) {
      // Non-fatal — user was created in Auth already
      console.error('[signup] failed to persist user record:', e);
    }

    // Step 3: Mint session token
    const token = Buffer.from(
      JSON.stringify({ uid, email, ts: Date.now() }),
      'utf-8',
    ).toString('base64');
    return {
      token,
      user: { uid, email, name, role: 'patient' as UserRole, status: 'active' },
    };
  }

  // Mock: create user in mem store.
  const existing = (await mem.authUsers.list()).find(
    (u: any) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) throw new Error('Email already registered');
  const id = 'u-' + randomUUID().slice(0, 8);
  const newUser = {
    id,
    email,
    password,
    name,
    role: 'patient' as UserRole,
    status: 'active' as const,
  };
  await mem.authUsers.create(newUser);
  await repo.create('users', { id, name, email, role: 'patient', status: 'active', lastLogin: Date.now() });
  const token = Buffer.from(
    JSON.stringify({ uid: id, email, ts: Date.now() }),
    'utf-8',
  ).toString('base64');
  return {
    token,
    user: { uid: id, email, name, role: 'patient' as UserRole, status: 'active' },
  };
}
