'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentSettings, setPaymentSettings] = useState({
    codEnabled: true,
    razorpayEnabled: false,
    upiEnabled: false,
    cardEnabled: false,
  });
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [uploadingRx, setUploadingRx] = useState(false);
  const [placing, setPlacing] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Load payment settings
  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings;
        if (s) {
          const ps = {
            codEnabled: s.codEnabled ?? true,
            razorpayEnabled: s.razorpayEnabled ?? false,
            upiEnabled: s.upiEnabled ?? false,
            cardEnabled: s.cardEnabled ?? false,
          };
          setPaymentSettings(ps);
          // Set default payment method to first enabled one
          if (ps.razorpayEnabled) setPaymentMethod('Razorpay');
          else if (ps.codEnabled) setPaymentMethod('COD');
          else if (ps.upiEnabled) setPaymentMethod('UPI');
          else if (ps.cardEnabled) setPaymentMethod('Card');
        }
      })
      .catch(() => {});
  }, []);

  // Pre-fill if user is logged in.
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  // Redirect if cart is empty.
  useEffect(() => {
    if (cart.length === 0) {
      router.replace('/cart');
    }
  }, [cart, router]);

  const needsPrescription = cart.some((i) => i.prescriptionRequired);

  const shipping = cartTotal >= 50 ? 0 : 5;
  const grandTotal = cartTotal + shipping;

  const onUploadRx = async (file: File) => {
    setUploadingRx(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/public/upload-prescription', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setPrescriptionUrl(data.url);
      toast.success('Prescription uploaded');
    } catch (e: any) {
      toast.error(e.message ?? 'Upload failed');
    } finally {
      setUploadingRx(false);
    }
  };

  const onPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      router.push('/login?redirect=/checkout');
      return;
    }
    if (needsPrescription && !prescriptionUrl) {
      toast.error('Please upload a prescription for the prescription-required items');
      return;
    }
    if (!name || !email || !address || !city || !postal) {
      toast.error('Please fill in all required fields');
      return;
    }
    setPlacing(true);
    try {
      // Step 1: Create the order first
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.id,
            name: i.shortName,
            qty: i.quantity,
            price: i.price,
          })),
          total: grandTotal,
          shippingAddress: `${address}, ${city}, ${postal}`,
          type: 'medicine',
          paymentMethod,
          prescriptionUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Order failed');
      const order = data.order;

      // Step 2: If online payment (Razorpay), initiate payment
      if (paymentMethod === 'Razorpay') {
        // Create Razorpay order
        const rzpRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal, orderId: order.id }),
        });
        const rzpData = await rzpRes.json();
        if (!rzpRes.ok) {
          toast.error(rzpData.error ?? 'Payment gateway error');
          setPlacing(false);
          return;
        }

        // Load Razorpay script
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load payment gateway'));
          document.body.appendChild(script);
        });

        // Open Razorpay checkout
        const rzp = new (window as any).Razorpay({
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'Balaji Medical Store',
          description: `Order ${order.id}`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name,
            email,
            contact: phone,
          },
          handler: async (response: any) => {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: order.id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.ok) {
              clearCart();
              toast.success('Payment successful! Order confirmed.');
              router.push('/orders');
            } else {
              toast.error(verifyData.error ?? 'Payment verification failed');
            }
            setPlacing(false);
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled. Your order is saved as pending.');
              clearCart();
              router.push('/orders');
              setPlacing(false);
            },
          },
        });
        rzp.open();
        return; // Don't proceed further — handler will redirect
      }

      // COD — just clear cart and go to orders
      clearCart();
      toast.success('Order placed successfully! Pay on delivery.');
      router.push('/orders');
    } catch (e: any) {
      toast.error(e.message ?? 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <Link href="/cart" className="mb-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#006872]">
          <Icon name="arrow_back" className="text-[16px]" /> Back to Cart
        </Link>
        <h1 className="text-[24px] font-extrabold tracking-tight">Checkout</h1>

        <form onSubmit={onPlaceOrder} className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {/* Contact */}
            <div className="soft-card rounded-xl p-4">
              <h2 className="text-[14px] font-bold">Contact Information</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Full Name *</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Email *</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Phone *</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+1 555-0100"
                    className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
              </div>
            </div>

            {/* Shipping */}
            <div className="soft-card rounded-xl p-4">
              <h2 className="text-[14px] font-bold">Shipping Address</h2>
              <div className="mt-3 grid gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Street Address *</span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="min-h-16 w-full resize-y rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">City *</span>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Postal Code *</span>
                    <input
                      type="text"
                      value={postal}
                      onChange={(e) => setPostal(e.target.value)}
                      required
                      className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Prescription (if needed) */}
            {needsPrescription && (
              <div className="soft-card rounded-xl p-4">
                <h2 className="text-[14px] font-bold">Prescription Upload *</h2>
                <p className="mt-1 text-[11px] text-[#6e797b]">
                  Your cart contains prescription-required items. Please upload a valid prescription.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadRx(f);
                  }}
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingRx}
                    className="rounded-lg border border-[#bdc9ca] bg-white px-3 py-2 text-[11px] font-bold text-[#3e494a] hover:bg-[#f5f3f3] disabled:opacity-60"
                  >
                    {uploadingRx ? 'Uploading…' : 'Upload Prescription'}
                  </button>
                  {prescriptionUrl && (
                    <a
                      href={prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-[#006872]"
                    >
                      <Icon name="check_circle" className="text-[16px]" /> View uploaded file
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="soft-card rounded-xl p-4">
              <h2 className="text-[14px] font-bold">Payment Method</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {/* COD */}
                {paymentSettings.codEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-[12px] font-bold transition ${
                      paymentMethod === 'COD'
                        ? 'border-[#006872] bg-[#d9eeee] text-[#006872]'
                        : 'border-[#bdc9ca] bg-white text-[#3e494a] hover:bg-[#f5f3f3]'
                    }`}
                  >
                    <Icon name="payments" className="text-[18px]" />
                    Cash on Delivery
                  </button>
                )}
                {/* Razorpay (Online) */}
                {paymentSettings.razorpayEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-[12px] font-bold transition ${
                      paymentMethod === 'Razorpay'
                        ? 'border-[#006872] bg-[#d9eeee] text-[#006872]'
                        : 'border-[#bdc9ca] bg-white text-[#3e494a] hover:bg-[#f5f3f3]'
                    }`}
                  >
                    <Icon name="credit_card" className="text-[18px]" />
                    Online Payment (Razorpay)
                  </button>
                )}
                {/* UPI */}
                {paymentSettings.upiEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-[12px] font-bold transition ${
                      paymentMethod === 'UPI'
                        ? 'border-[#006872] bg-[#d9eeee] text-[#006872]'
                        : 'border-[#bdc9ca] bg-white text-[#3e494a] hover:bg-[#f5f3f3]'
                    }`}
                  >
                    <Icon name="account_balance_wallet" className="text-[18px]" />
                    UPI / Wallet
                  </button>
                )}
                {/* Card */}
                {paymentSettings.cardEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-[12px] font-bold transition ${
                      paymentMethod === 'Card'
                        ? 'border-[#006872] bg-[#d9eeee] text-[#006872]'
                        : 'border-[#bdc9ca] bg-white text-[#3e494a] hover:bg-[#f5f3f3]'
                    }`}
                  >
                    <Icon name="credit_card" className="text-[18px]" />
                    Credit / Debit Card
                  </button>
                )}
              </div>
              <p className="mt-2 text-[10px] text-[#6e797b]">
                {paymentMethod === 'COD'
                  ? '💰 Pay when you receive your order. Order will be pending until delivery.'
                  : paymentMethod === 'Razorpay'
                  ? '💳 Pay securely online. Order will be confirmed instantly after payment.'
                  : 'Select a payment method to proceed.'}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <div className="soft-card rounded-xl p-4">
              <h2 className="text-[14px] font-bold">Order Summary</h2>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto fancy-scroll">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-[12px]">
                    <span className="text-[#3e494a]">{item.shortName} × {item.quantity}</span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 border-t border-[#f0eded] pt-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#6e797b]">Subtotal</span>
                  <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e797b]">Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-bold text-[#006872]">FREE</span>
                  ) : (
                    <span className="font-bold">${shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between border-t border-[#f0eded] pt-2">
                  <span className="font-bold">Total</span>
                  <span className="text-[18px] font-extrabold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={placing}
                className="mt-4 w-full rounded-lg bg-[#006872] py-3 text-[13px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
              >
                {placing ? 'Placing Order…' : `Place Order · $${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </form>
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
