import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security';
import { signupWithEmail } from '@/lib/auth/api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 5 signup attempts per minute
    const rl = rateLimit({ maxRequests: 5 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
    }
    const { email, password, name } = await req.json();
    const result = await signupWithEmail(email, password, name);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Signup failed' }, { status: 400 });
  }
}
