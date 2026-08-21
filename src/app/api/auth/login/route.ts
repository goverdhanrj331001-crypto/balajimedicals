import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security';
import { loginWithEmail } from '@/lib/auth/api';
import { repo } from '@/lib/store/repo';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 5 login attempts per minute
    const rl = rateLimit({ maxRequests: 5 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }
    const { email, password } = await req.json();
    const result = await loginWithEmail(email, password);
    // Update lastLogin timestamp on the user record.
    try {
      const users = await repo.list('users');
      const u = users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
      if (u) await repo.update('users', u.id, { lastLogin: Date.now() });
    } catch {
      // ignore
    }
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Login failed' }, { status: 401 });
  }
}
