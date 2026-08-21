'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import type { LabPackage, LabTest } from '@/types';

function ScheduleLabTestPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const pkgId = params.get('pkg');
  const testId = params.get('test');

  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/public/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setPackages(d.labPackages ?? []);
        setTests(d.labTests ?? []);
        setSettings(d.settings ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedPkg = packages.find((p) => p.id === pkgId);
  const selectedTest = tests.find((t) => t.id === testId);
  const selectedItem = selectedPkg ?? selectedTest;
  const totalPrice = selectedPkg ? Number(selectedPkg.price) : selectedTest ? Number(selectedTest.price) : 0;
  const itemName = selectedPkg?.name ?? selectedTest?.name ?? '';

  // ─── Booking logic ─────────────────────────────────────────────
  const serviceStart = settings?.labTestServiceStart ?? '09:00';
  const serviceEnd = settings?.labTestServiceEnd ?? '21:00';
  const maxPerDay = settings?.labTestMaxBookingsPerDay ?? 1;

  // Generate today and tomorrow dates
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const availableDates = [
    { value: today.toISOString().slice(0, 10), label: 'Today', day: today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
    { value: tomorrow.toISOString().slice(0, 10), label: 'Tomorrow', day: tomorrow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
  ];

  // Check if booking is currently open (current time within service hours)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const startHour = parseInt(serviceStart.split(':')[0]);
  const startMin = parseInt(serviceStart.split(':')[1]);
  const endHour = parseInt(serviceEnd.split(':')[0]);
  const endMin = parseInt(serviceEnd.split(':')[1]);
  const currentMinutes = currentHour * 60 + currentMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const isBookingOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

  // Generate time slots based on service hours (every 30 min)
  const timeSlots: string[] = [];
  for (let m = startMinutes; m <= endMinutes; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const slot = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    // For today, only show future slots
    if (selectedDate === availableDates[0].value) {
      if (m > currentMinutes) {
        timeSlots.push(slot);
      }
    } else {
      timeSlots.push(slot);
    }
  }

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const onBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a lab test');
      router.push('/login?redirect=/lab-tests/schedule');
      return;
    }
    if (!selectedItem) {
      toast.error('No test or package selected');
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    if (!address) {
      toast.error('Please enter your address');
      return;
    }
    if (!isBookingOpen && selectedDate === availableDates[0].value) {
      toast.error('Booking is currently closed. Please try during service hours.');
      return;
    }
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).getTime();
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ name: itemName, qty: 1, price: totalPrice }],
          total: totalPrice,
          shippingAddress: address,
          type: 'lab',
          paymentMethod: 'COD',
          scheduledAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Booking failed');
      toast.success('Lab test booked successfully!');
      router.push('/orders');
    } catch (e: any) {
      toast.error(e.message ?? 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">Schedule Lab Test</h1>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : !selectedItem ? (
          <div className="mt-6 rounded-lg bg-[#fff4f2] p-4 text-center">
            <Icon name="error" className="text-[#910816]" />
            <p className="mt-2 text-[13px] font-bold text-[#910816]">No test or package selected.</p>
            <a href="/lab-tests" className="mt-2 inline-block text-[12px] font-bold text-[#006872]">Browse lab tests →</a>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
            <form onSubmit={onBook} className="space-y-4">
              {/* Booking status banner */}
              <div className={`rounded-lg p-4 ${isBookingOpen ? 'bg-[#d9eeee]' : 'bg-[#ffdad7]'}`}>
                <div className="flex items-center gap-2">
                  <Icon
                    name={isBookingOpen ? 'check_circle' : 'cancel'}
                    className={`text-[20px] ${isBookingOpen ? 'text-[#006872]' : 'text-[#910816]'}`}
                  />
                  <div>
                    <p className={`text-[13px] font-bold ${isBookingOpen ? 'text-[#006872]' : 'text-[#910816]'}`}>
                      {isBookingOpen ? 'Booking is Open Now' : 'Booking is Currently Closed'}
                    </p>
                    <p className="text-[11px] text-[#3e494a]">
                      Service Hours: {formatTime(serviceStart)} to {formatTime(serviceEnd)}
                      {!isBookingOpen && ' — Please try again during service hours'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="soft-card rounded-xl p-4">
                <h2 className="text-[14px] font-bold">Select Date</h2>
                <p className="mt-1 text-[11px] text-[#6e797b]">You can book for Today or Tomorrow only</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {availableDates.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.value);
                        setSelectedTime('');
                      }}
                      className={`rounded-lg border-2 p-3 text-left transition ${
                        selectedDate === d.value
                          ? 'border-[#006872] bg-[#d9eeee]'
                          : 'border-[#bdc9ca] bg-white hover:border-[#006872]/50'
                      }`}
                    >
                      <p className="text-[14px] font-bold text-[#006872]">{d.label}</p>
                      <p className="text-[11px] text-[#6e797b]">{d.day}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="soft-card rounded-xl p-4">
                  <h2 className="text-[14px] font-bold">Select Time Slot</h2>
                  <p className="mt-1 text-[11px] text-[#6e797b]">
                    Available: {formatTime(serviceStart)} – {formatTime(serviceEnd)}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {timeSlots.length === 0 ? (
                      <p className="col-span-3 rounded-lg bg-[#ffdad7] p-3 text-center text-[11px] font-bold text-[#910816]">
                        No slots available for today. Please book for tomorrow.
                      </p>
                    ) : (
                      timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-lg border p-2 text-[12px] font-bold transition ${
                            selectedTime === slot
                              ? 'border-[#006872] bg-[#006872] text-white'
                              : 'border-[#bdc9ca] bg-white text-[#3e494a] hover:bg-[#f5f3f3]'
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="soft-card rounded-xl p-4">
                <h2 className="text-[14px] font-bold">Collection Address</h2>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Full Address *</span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address with city and postal code"
                    required
                    className="min-h-20 w-full resize-y rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">Notes (optional)</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for the phlebotomist"
                    className="min-h-16 w-full resize-y rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedDate || !selectedTime || !address || (!isBookingOpen && selectedDate === availableDates[0].value)}
                className="w-full rounded-lg bg-[#006872] py-3 text-[13px] font-bold text-white shadow-sm hover:bg-[#00535b] disabled:opacity-50"
              >
                {submitting ? 'Booking…' : `Confirm Booking · $${totalPrice.toFixed(2)}`}
              </button>
            </form>

            {/* Summary */}
            <div className="space-y-3">
              <div className="soft-card rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase text-[#6e797b]">Booking Summary</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#d9eeee]">
                    <Icon name={selectedPkg?.icon ?? 'biotech'} className="text-[24px] text-[#006872]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold">{itemName}</p>
                    <p className="text-[11px] text-[#6e797b]">{selectedPkg?.detail ?? selectedTest?.detail}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 border-t border-[#f0eded] pt-3 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#6e797b]">Subtotal</span>
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6e797b]">Home collection</span>
                    <span className="font-bold text-[#006872]">FREE</span>
                  </div>
                  <div className="flex justify-between border-t border-[#f0eded] pt-1">
                    <span className="font-bold">Total</span>
                    <span className="text-[16px] font-extrabold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="soft-card rounded-xl p-4">
                <p className="text-[12px] font-bold">Service Hours</p>
                <p className="mt-1 text-[11px] text-[#6e797b]">
                  {formatTime(serviceStart)} – {formatTime(serviceEnd)}
                </p>
                <p className="mt-2 text-[12px] font-bold">Max Bookings / Day</p>
                <p className="mt-1 text-[11px] text-[#6e797b]">{maxPerDay} per customer</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}


export default function ScheduleLabTestPage(props: any) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" /></div>}>
      <ScheduleLabTestPageInner {...props} />
    </Suspense>
  );
}
