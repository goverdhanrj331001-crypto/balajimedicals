import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/store/repo';
import { getSessionUser } from '@/lib/auth/session';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

// GET: list approved reviews for a product
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const productId = url.searchParams.get('productId');
  if (!productId) return NextResponse.json({ items: [] });

  const all = await repo.list('reviews', {
    where: [
      { field: 'productId', op: '==', value: productId },
      { field: 'status', op: '==', value: 'approved' },
    ],
  });
  // Sort by newest first
  all.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return NextResponse.json({ items: all });
}

// POST: submit a review (only if user has a delivered order for this product)
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Login required to write a review' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, productName, orderId, rating, title, comment } = body;

    if (!productId || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Verify the user has a delivered order containing this product
    const orders = await repo.list('orders', {
      where: [{ field: 'userId', op: '==', value: user.uid }],
    });
    const deliveredOrder = orders.find(
      (o) =>
        (o.status === 'Delivered' || o.status === 'Completed') &&
        o.id === orderId &&
        o.items?.some((item: any) => item.productId === productId),
    );

    if (!deliveredOrder) {
      return NextResponse.json(
        { error: 'You can only review products from delivered orders' },
        { status: 403 },
      );
    }

    // Check if already reviewed
    const existing = await repo.list('reviews', {
      where: [
        { field: 'productId', op: '==', value: productId },
        { field: 'userId', op: '==', value: user.uid },
        { field: 'orderId', op: '==', value: orderId },
      ],
    });
    if (existing.length > 0) {
      return NextResponse.json({ error: 'You have already reviewed this product for this order' }, { status: 400 });
    }

    const review = await repo.create('reviews', {
      id: 'rev-' + randomUUID().slice(0, 8),
      productId,
      productName,
      userId: user.uid,
      userName: user.name,
      userEmail: user.email,
      orderId,
      rating: Number(rating),
      title: String(title).trim(),
      comment: String(comment).trim(),
      status: 'approved', // auto-approve for now; admin can reject later
      createdAt: Date.now(),
    });

    return NextResponse.json({ item: review }, { status: 201 });
  } catch (e: any) {
    console.error('[reviews POST]', e);
    return NextResponse.json({ error: e.message ?? 'Failed to submit review' }, { status: 500 });
  }
}
