import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/store/repo';
import { getSessionUser } from '@/lib/auth/session';
import { randomUUID } from 'crypto';
import { rateLimit, sanitizeInput, isValidPrice, isValidQuantity } from '@/lib/security';

export const dynamic = 'force-dynamic';

// Customer-facing: list user's own orders OR place a new order.
export async function GET(_req: NextRequest) {
  // Rate limit
  const rl = rateLimit({ maxRequests: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ items: [] });
  const all = await repo.list('orders');
  const mine = all.filter(
    (o) => o.userId === user.uid || (user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase()),
  );
  return NextResponse.json({ items: mine });
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 10 orders per minute
    const rl = rateLimit({ maxRequests: 10 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Login required to place an order' }, { status: 401 });
    }

    const raw = await req.json();
    const body = sanitizeInput(raw);
    const { items, total, shippingAddress, type = 'medicine', paymentMethod = 'COD', scheduledAt, prescriptionUrl } = body;

    // Validate items
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    if (!Array.isArray(items) || items.length > 100) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || typeof item.name !== 'string') {
        return NextResponse.json({ error: 'Invalid item name' }, { status: 400 });
      }
      if (!isValidPrice(item.price)) {
        return NextResponse.json({ error: 'Invalid item price' }, { status: 400 });
      }
      if (!isValidQuantity(item.qty)) {
        return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 });
      }
    }

    // Validate total
    if (!isValidPrice(total)) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    // Validate payment method
    const validMethods = ['COD', 'Razorpay', 'UPI', 'Card'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // COD orders → Pending, Online payments → will be Confirmed after payment verification
    const isOnlinePayment = paymentMethod === 'Razorpay' || paymentMethod === 'Online';
    const orderStatus = 'Pending';
    const paymentStatus = 'Pending';

    const order = await repo.create('orders', {
      id: 'MD-' + randomUUID().slice(0, 6).toUpperCase(),
      userId: user.uid,
      customerName: user.name ?? body.customerName ?? 'Guest',
      customerEmail: user.email ?? body.customerEmail ?? 'guest@medidemo.com',
      items,
      total,
      shippingAddress,
      status: orderStatus,
      type,
      paymentMethod,
      paymentStatus,
      scheduledAt,
      prescriptionUrl,
      prescriptionVerified: false,
      createdAt: Date.now(),
    });

    // Also create a matching transaction record.
    await repo.create('transactions', {
      id: 'TXN-' + randomUUID().slice(0, 6).toUpperCase(),
      orderId: order.id,
      customerName: order.customerName,
      method: paymentMethod,
      amount: total,
      status: paymentStatus,
      createdAt: Date.now(),
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e: any) {
    console.error('[orders POST]', e);
    return NextResponse.json({ error: e.message ?? 'Failed to place order' }, { status: 500 });
  }
}
