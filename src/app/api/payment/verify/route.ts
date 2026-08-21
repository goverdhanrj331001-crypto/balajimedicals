import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/store/repo';
import { getSessionUser } from '@/lib/auth/session';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Verify Razorpay payment signature and confirm the order
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Load settings for secret
    const settings = await repo.list('settings');
    const s = settings[0];
    if (!s || !s.razorpayKeySecret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 400 });
    }

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', s.razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment verified — update order to Confirmed
    const updated = await repo.update('orders', orderId, {
      status: 'Confirmed',
      paymentStatus: 'Completed',
      paymentMethod: 'Razorpay',
      razorpayPaymentId,
      razorpayOrderId,
      paidAt: Date.now(),
    });

    // Update transaction record if exists
    const txns = await repo.list('transactions', {
      where: [{ field: 'orderId', op: '==', value: orderId }],
    });
    if (txns.length > 0) {
      await repo.update('transactions', txns[0].id, {
        status: 'Completed',
        method: 'Razorpay',
      });
    }

    return NextResponse.json({ ok: true, order: updated });
  } catch (e: any) {
    console.error('[payment/verify]', e);
    return NextResponse.json({ error: e.message ?? 'Payment verification failed' }, { status: 500 });
  }
}
