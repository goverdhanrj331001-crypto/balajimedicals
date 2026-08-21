import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/store/repo';

export const dynamic = 'force-dynamic';

// Returns the entire storefront catalog in a single response.
// Used by the home page, products page, categories page, lab tests page.
export async function GET(_req: NextRequest) {
  const [products, categories, healthConcerns, brands, offers, banners, labPackages, labTests, settingsArr] = await Promise.all([
    repo.list('products', { where: [{ field: 'status', op: '==', value: 'active' }] }),
    repo.list('categories', { where: [{ field: 'visibility', op: '==', value: 'active' }] }),
    repo.list('healthConcerns'),
    repo.list('brands', { where: [{ field: 'visibility', op: '==', value: 'active' }] }),
    repo.list('offers', { where: [{ field: 'visibility', op: '==', value: 'active' }] }),
    repo.list('banners', { where: [{ field: 'visibility', op: '==', value: 'active' }] }),
    repo.list('labPackages', { where: [{ field: 'visibility', op: '==', value: 'active' }] }),
    repo.list('labTests', { where: [{ field: 'visibility', op: '==', value: 'active' }] }),
    repo.list('settings'),
  ]);

  const settingsRaw = settingsArr[0] ?? null;
  // Only expose safe (non-secret) settings to the client
  const settings = settingsRaw
    ? {
        ...settingsRaw,
        razorpayKeySecret: undefined, // never expose secret to client
        razorpayKeyId: settingsRaw.razorpayEnabled ? settingsRaw.razorpayKeyId : undefined,
      }
    : null;

  return NextResponse.json({
    products,
    categories,
    healthConcerns,
    brands,
    offers,
    banners,
    labPackages,
    labTests,
    settings,
  });
}
