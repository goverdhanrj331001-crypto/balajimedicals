// ─── Auth API (server-side) ──────────────────────────────────────
// Handles login, signup, and logout using Firebase Auth REST API (for zero ESM bundler issues)
// and repository/Firestore for user profiles and roles.

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
// Verifies email+password and returns user details.
// Uses Google's official REST endpoints — 100% serverless/edge/Node compatible.
async function verifyPasswordWithFirebase(
  email: string,
  password: string,
): Promise<{ uid: string; displayName?: string; email: string }> {
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
    if (
      msg.includes('INVALID_LOGIN_CREDENTIALS') ||
      msg.includes('EMAIL_NOT_FOUND') ||
      msg.includes('INVALID_PASSWORD')
    ) {
      throw new Error('Invalid email or password');
    }
    if (msg.includes('USER_DISABLED')) {
      throw new Error('This account has been disabled');
    }
    throw new Error(msg);
  }
  return {
    uid: data.localId as string,
    displayName: data.displayName || undefined,
    email: data.email || email,
  };
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

  return uid;
}

// ─── Public API ─────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  if (!email || !password) throw new Error('Email and password are required');

  if (isFirebaseConfigured) {
    // Step 1: Verify password via Firebase Auth REST API (fast, reliable, no ESM issues)
    const fbUser = await verifyPasswordWithFirebase(email, password);
    const uid = fbUser.uid;

    // Step 2: Get user profile & role from database
    let dbUser: any = null;
    try {
      dbUser = await repo.get('users', uid);
    } catch {
      // ignore
    }

    if (!dbUser) {
      try {
        const users = await repo.list('users');
        dbUser = users.find((x: any) => x.email?.toLowerCase() === email.toLowerCase());
        if (!dbUser) {
          dbUser = {
            id: uid,
            name: fbUser.displayName || email.split('@')[0],
            email: fbUser.email,
            role: 'patient',
            status: 'active',
            createdAt: Date.now(),
            lastLogin: Date.now(),
          };
          await repo.create('users', dbUser);
        }
      } catch {
        // ignore
      }
    }

    const role = (dbUser?.role as UserRole) || 'patient';
    const status = dbUser?.status || 'active';
    if (status !== 'active') {
      throw new Error(`Account is ${status}`);
    }

    const name = dbUser?.name || fbUser.displayName || email.split('@')[0];

    // Step 3: Mint a session token (base64-encoded JSON)
    const token = Buffer.from(
      JSON.stringify({ uid, email: fbUser.email, ts: Date.now() }),
      'utf-8',
    ).toString('base64');

    return {
      token,
      user: {
        uid,
        email: fbUser.email,
        name,
        role,
        status,
        phone: dbUser?.phone,
        age: dbUser?.age,
        gender: dbUser?.gender,
        address: dbUser?.address,
      },
    };
  }

  // Mock auth: match against seeded users
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

    // Step 2: Persist user record in database
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
  await repo.create('users', {
    id,
    name,
    email,
    role: 'patient',
    status: 'active',
    lastLogin: Date.now(),
  });
  const token = Buffer.from(
    JSON.stringify({ uid: id, email, ts: Date.now() }),
    'utf-8',
  ).toString('base64');
  return {
    token,
    user: { uid: id, email, name, role: 'patient' as UserRole, status: 'active' },
  };
}
