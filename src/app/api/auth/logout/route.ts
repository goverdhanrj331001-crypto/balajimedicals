import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // The cookie is cleared client-side; this endpoint exists to allow
  // any server-side cleanup if needed in the future.
  const res = NextResponse.json({ ok: true });
  res.cookies.set('medidemo-session', '', { maxAge: 0, path: '/' });
  return res;
}
