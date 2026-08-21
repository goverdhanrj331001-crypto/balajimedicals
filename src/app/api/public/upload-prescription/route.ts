import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/r2/storage';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Customer-facing: upload a prescription file.
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
    }
    const result = await uploadFile(file);
    return NextResponse.json({ url: result.url, key: result.key });
  } catch (e: any) {
    console.error('[upload-prescription]', e);
    return NextResponse.json({ error: e.message ?? 'Upload failed' }, { status: 500 });
  }
}
