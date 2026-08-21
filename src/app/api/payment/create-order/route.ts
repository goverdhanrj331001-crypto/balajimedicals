import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/store/repo';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Create a Razorpay order for online payment
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, orderId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Load settings to get Razorpay credentials
    const settings = await repo.list('settings');
    const s = settings[0];
    if (!s || !s.razorpayEnabled || !s.razorpayKeyId || !s.razorpayKeySecret) {
      return NextResponse.json({ error: 'Online payments are not enabled. Please use Cash on Delivery.' }, { status: 400 });
    }

    // Create Razorpay order
    const Razorpay = (await import('razorpay')).default;
    const rzp = new Razorpay({
      key_id: s.razorpayKeyId,
      key_secret: s.razorpayKeySecret,
    });

    const rzpOrder = await rzp.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: s.currency || 'INR',
      receipt: orderId || `order_${Date.now()}`,
      notes: {
        orderId: orderId || '',
        userId: user.uid,
      },
    });

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: s.razorpayKeyId, // public key for client SDK
    });
  } catch (e: any) {
    console.error('[payment/create-order]', e);
    return NextResponse.json({ error: e.message ?? 'Failed to create payment order' }, { status: 500 });
  }
}
