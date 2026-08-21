import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { repo } from '@/lib/store/repo';
import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Import products from an Excel file
export async function POST(req: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(ws);

    if (!rows.length) {
      return NextResponse.json({ error: 'No data found in Excel file' }, { status: 400 });
    }

    let created = 0;
    let errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name = String(row.name ?? '').trim();
        if (!name) {
          errors.push(`Row ${i + 2}: Missing product name`);
          continue;
        }

        const product = {
          id: 'prod-' + randomUUID().slice(0, 8),
          name,
          shortName: String(row.shortName ?? name).trim(),
          brand: String(row.brand ?? '').trim(),
          price: Number(row.price ?? 0),
          oldPrice: row.oldPrice ? Number(row.oldPrice) : undefined,
          stock: Number(row.stock ?? 0),
          reorderLevel: Number(row.reorderLevel ?? 10),
          sku: String(row.sku ?? 'SKU-' + randomUUID().slice(0, 6)).trim(),
          note: String(row.note ?? '').trim(),
          badge: String(row.badge ?? '').trim() || undefined,
          shortDescription: String(row.shortDescription ?? '').trim() || undefined,
          fullDescription: String(row.fullDescription ?? '').trim() || undefined,
          productType: String(row.productType ?? 'Medicine').trim(),
          manufacturer: String(row.manufacturer ?? '').trim() || undefined,
          dosageForm: String(row.dosageForm ?? '').trim() || undefined,
          storageCondition: String(row.storageCondition ?? 'Room Temperature').trim(),
          status: String(row.status ?? 'active').trim(),
          composition: row.composition ? [{ salt: String(row.composition).split(' ')[0] ?? '', strength: String(row.composition) }] : [],
          thumbnail: '',
          gallery: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await repo.create('products', product);
        created++;
      } catch (e: any) {
        errors.push(`Row ${i + 2}: ${e.message ?? 'Failed'}`);
      }
    }

    return NextResponse.json({
      success: true,
      created,
      total: rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e: any) {
    console.error('[import]', e);
    return NextResponse.json({ error: e.message ?? 'Import failed' }, { status: 500 });
  }
}
