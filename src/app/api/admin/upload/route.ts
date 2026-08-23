import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/r2/storage';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Admin-only: upload any image (banners, product thumbnails, category icons, etc.)
export async function POST(req: NextRequest) {
  try {
    // Ensure caller is authorized admin
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: 'Unauthorized. Please login as admin.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const name = (file.name || '').toLowerCase();
    const isAllowed = file.type?.startsWith('image/') || file.type === 'application/pdf' || /\.(jpg|jpeg|png|webp|gif|svg|avif|jfif|bmp|pdf)$/i.test(name);

    if (!isAllowed) {
      return NextResponse.json({ error: 'Only image files (JPG, PNG, WEBP, GIF, SVG) and PDF documents are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
    }

    const result = await uploadFile(file);
    return NextResponse.json({ url: result.url, key: result.key });
  } catch (e: any) {
    console.error('[admin/upload]', e);
    return NextResponse.json({ error: e.message ?? 'Upload failed' }, { status: 500 });
  }
}
