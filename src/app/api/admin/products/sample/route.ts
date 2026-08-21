import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

// Download a sample Excel template for product import
export async function GET(_req: NextRequest) {
  try {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sampleData = [
      {
        name: 'Dolo 650 Tablet',
        shortName: 'Dolo 650',
        brand: 'Micro Labs',
        productType: 'Medicine',
        price: 9.99,
        oldPrice: 14.99,
        stock: 200,
        reorderLevel: 50,
        sku: 'DOLO-650-001',
        note: '15 Tablets',
        badge: 'BESTSELLER',
        shortDescription: 'Effective relief from fever and pain',
        fullDescription: 'Dolo 650 Tablet contains Paracetamol 650mg for effective relief from fever, headache, and body pain.',
        manufacturer: 'Micro Labs Ltd',
        composition: 'Paracetamol 650 mg',
        dosageForm: 'Tablet',
        storageCondition: 'Room Temperature',
        status: 'active',
      },
      {
        name: 'Vitamin C 1000mg Tablet',
        shortName: 'Vitamin C 1000',
        brand: 'HealthKart',
        productType: 'Vitamins & Supplements',
        price: 12.99,
        oldPrice: '',
        stock: 150,
        reorderLevel: 30,
        sku: 'VC-1000-001',
        note: '60 Tablets',
        badge: '',
        shortDescription: 'Immunity booster with 1000mg Vitamin C',
        fullDescription: 'High potency Vitamin C supplement for immune support and antioxidant protection.',
        manufacturer: 'HealthKart',
        composition: 'Ascorbic Acid 1000 mg',
        dosageForm: 'Tablet',
        storageCondition: 'Room Temperature',
        status: 'active',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="product-import-sample.xlsx"',
      },
    });
  } catch (e: any) {
    console.error('[sample]', e);
    return NextResponse.json({ error: e.message ?? 'Failed' }, { status: 500 });
  }
}
