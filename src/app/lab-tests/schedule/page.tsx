'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
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
  const { user, loading: authLoading } = useAuth();
  const pkgId = params.get('pkg');
  const testId = params.get('test');

  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Patient & Collection Details (auto pre-filled from user profile)
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [collectionMode, setCollectionMode] = useState<'home' | 'lab'>('home');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Authentication gate: User must be logged in to book a lab test
  useEffect(() => {
    if (!authLoading && !user) {
      const currentQuery = params.toString();
      const redirectUrl = currentQuery ? `/lab-tests/schedule?${currentQuery}` : '/lab-tests/schedule';
      toast.info('Please log in to book a lab test');
      router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [user, authLoading, router, params]);

  // Pre-fill profile details if available
  useEffect(() => {
    if (user) {
      if (user.name) setPatientName(user.name);
      if (user.phone) setPatientPhone(user.phone);
      if (user.age) setPatientAge(String(user.age));
      if (user.gender) setPatientGender(user.gender);
      if (user.address) setAddress(user.address);
    }
  }, [user]);

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

  const allowedMode = selectedItem?.collectionType || 'both';

  // Automatically enforce mode if test only allows one
  useEffect(() => {
    if (allowedMode === 'home') {
      setCollectionMode('home');
    } else if (allowedMode === 'lab') {
      setCollectionMode('lab');
    }
  }, [allowedMode]);

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
    if (!patientName.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    if (!patientPhone.trim()) {
      toast.error('Please enter patient mobile number');
      return;
    }
    if (!patientAge) {
      toast.error('Please enter patient age');
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    if (collectionMode === 'home' && !address.trim()) {
      toast.error('Please enter your home address for sample collection');
      return;
    }
    if (!isBookingOpen && selectedDate === availableDates[0].value) {
      toast.error('Booking is currently closed. Please try during service hours.');
      return;
    }
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).getTime();
      const finalAddress = collectionMode === 'home' ? address : 'Balaji Medical Store - In-Clinic Walk-in';

      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ name: itemName, qty: 1, price: totalPrice }],
          total: totalPrice,
          shippingAddress: finalAddress,
          type: 'lab',
          collectionMode,
          patientName,
          patientPhone,
          patientAge,
          patientGender,
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

  if (authLoading || !user) {
    return (
      <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
        <DesktopHeader />
        <div className="flex h-96 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0 bg-[#f8fafc]">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas mx-auto max-w-7xl px-4 md:px-8 py-5">
        {/* ─── Breadcrumb ─── */}
        <nav className="mb-4 flex items-center gap-2 text-[12.5px] text-[#64748b]" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-[#006872]">Home</Link>
          <span>/</span>
          <Link href="/lab-tests" className="transition hover:text-[#006872]">Lab Tests</Link>
          <span>/</span>
          <span className="font-semibold text-[#0f172a]">Book Test</span>
        </nav>

        <h1 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-[#0f172a]">Schedule Diagnostic Test</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Enter patient details and select sample collection mode.</p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
          </div>
        ) : !selectedItem ? (
          <div className="mt-6 rounded-2xl border border-[#fee2e2] bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]">
              <Icon name="error" className="text-[32px]" />
            </div>
            <h3 className="mt-3 text-[16px] font-bold text-[#0f172a]">No test or package selected</h3>
            <p className="mt-1 text-[13px] text-[#64748b]">Please choose a test or health package from our diagnostic catalog.</p>
            <Link href="/lab-tests" className="mt-4 inline-block rounded-xl bg-[#006872] px-5 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-[#00535b]">
              Browse Lab Tests →
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form onSubmit={onBook} className="space-y-5">
              {/* Service Status banner */}
              <div className={`rounded-2xl p-4 border ${isBookingOpen ? 'bg-[#f0fdfa] border-[#ccfbf1]' : 'bg-[#fff1f2] border-[#fecdd3]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isBookingOpen ? 'bg-[#006872] text-white' : 'bg-[#e11d48] text-white'}`}>
                    <Icon name={isBookingOpen ? 'check_circle' : 'schedule'} className="text-[22px]" />
                  </div>
                  <div>
                    <p className={`text-[13.5px] font-bold ${isBookingOpen ? 'text-[#006872]' : 'text-[#e11d48]'}`}>
                      {isBookingOpen ? 'Lab Booking Is Open Now' : 'Booking Hours Notice'}
                    </p>
                    <p className="text-[11.5px] text-[#64748b]">
                      Service Hours: {formatTime(serviceStart)} to {formatTime(serviceEnd)}
                      {!isBookingOpen && ' — You may still select tomorrow for advance booking'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── 1. Patient Details (Auto-prefilled from Profile) ─── */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                  <div>
                    <h2 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2">
                      <Icon name="person" className="text-[#006872] text-[18px]" />
                      <span>1. Patient Information</span>
                    </h2>
                    <p className="text-[11.5px] text-[#64748b]">Auto-filled from your profile. Update if booking for a family member.</p>
                  </div>
                  <span className="rounded-full bg-[#f0fdfa] px-2.5 py-0.5 text-[10.5px] font-bold text-[#006872]">
                    Profile Synced
                  </span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11.5px] font-bold text-[#334155]">Patient Full Name *</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#006872] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11.5px] font-bold text-[#334155]">Mobile Number *</label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                      className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#006872] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11.5px] font-bold text-[#334155]">Patient Age *</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Age in years (e.g. 35)"
                      min="1"
                      max="120"
                      required
                      className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#006872] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11.5px] font-bold text-[#334155]">Gender *</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#006872] focus:bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ─── 2. Sample Collection Mode Selection ─── */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
                <div className="border-b border-[#f1f5f9] pb-3">
                  <h2 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2">
                    <Icon name="biotech" className="text-[#006872] text-[18px]" />
                    <span>2. Sample Collection Mode</span>
                  </h2>
                  <p className="text-[11.5px] text-[#64748b]">Choose between doorstep home pickup or in-store lab walk-in.</p>
                </div>

                {allowedMode === 'both' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div
                      onClick={() => setCollectionMode('home')}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                        collectionMode === 'home'
                          ? 'border-[#006872] bg-[#f0fdfa] shadow-xs'
                          : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          collectionMode === 'home' ? 'bg-[#006872] text-white' : 'bg-[#f1f5f9] text-[#64748b]'
                        }`}>
                          <Icon name="home" className="text-[22px]" />
                        </div>
                        <div>
                          <p className={`text-[14px] font-bold ${collectionMode === 'home' ? 'text-[#006872]' : 'text-[#0f172a]'}`}>
                            Home Sample Collection
                          </p>
                          <p className="text-[11.5px] text-[#64748b] mt-0.5">
                            Certified phlebotomist visits your home address. Free collection.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setCollectionMode('lab')}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                        collectionMode === 'lab'
                          ? 'border-[#006872] bg-[#f0fdfa] shadow-xs'
                          : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          collectionMode === 'lab' ? 'bg-[#006872] text-white' : 'bg-[#f1f5f9] text-[#64748b]'
                        }`}>
                          <Icon name="local_hospital" className="text-[22px]" />
                        </div>
                        <div>
                          <p className={`text-[14px] font-bold ${collectionMode === 'lab' ? 'text-[#006872]' : 'text-[#0f172a]'}`}>
                            Visit Lab / Store
                          </p>
                          <p className="text-[11.5px] text-[#64748b] mt-0.5">
                            Walk-in directly to Balaji Medical Store diagnostic counter.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : allowedMode === 'home' ? (
                  <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3.5 flex items-center gap-3">
                    <Icon name="home" className="text-[24px] text-[#16a34a]" />
                    <div>
                      <p className="text-[13px] font-bold text-[#166534]">Home Collection Only</p>
                      <p className="text-[11.5px] text-[#15803d]">This specific test requires doorstep sample collection by our specialist.</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#c7d2fe] bg-[#eef2ff] p-3.5 flex items-center gap-3">
                    <Icon name="local_hospital" className="text-[24px] text-[#4f46e5]" />
                    <div>
                      <p className="text-[13px] font-bold text-[#3730a3]">In-Lab Physical Visit Only</p>
                      <p className="text-[11.5px] text-[#4338ca]">This specific test requires specialized lab equipment available only at the center.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── 3. Schedule Date & Time ─── */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
                <div className="border-b border-[#f1f5f9] pb-3">
                  <h2 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2">
                    <Icon name="calendar_today" className="text-[#006872] text-[18px]" />
                    <span>3. Select Date &amp; Time Slot</span>
                  </h2>
                  <p className="text-[11.5px] text-[#64748b]">Select your preferred appointment date and time.</p>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-3">
                    {availableDates.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => {
                          setSelectedDate(d.value);
                          setSelectedTime('');
                        }}
                        className={`rounded-xl border-2 p-3 text-left transition cursor-pointer ${
                          selectedDate === d.value
                            ? 'border-[#006872] bg-[#f0fdfa]'
                            : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                        }`}
                      >
                        <p className="text-[13.5px] font-bold text-[#006872]">{d.label}</p>
                        <p className="text-[11.5px] text-[#64748b]">{d.day}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className="pt-2">
                    <p className="mb-2 text-[12px] font-bold text-[#334155]">
                      Available Time Slots ({formatTime(serviceStart)} – {formatTime(serviceEnd)})
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.length === 0 ? (
                        <p className="col-span-full rounded-xl bg-[#fff1f2] border border-[#fecdd3] p-3 text-center text-[12px] font-bold text-[#e11d48]">
                          No slots available for today. Please select tomorrow.
                        </p>
                      ) : (
                        timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`rounded-xl border py-2.5 px-1 text-[12px] font-bold transition cursor-pointer text-center ${
                              selectedTime === slot
                                ? 'border-[#006872] bg-[#006872] text-white shadow-xs'
                                : 'border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc]'
                            }`}
                          >
                            {formatTime(slot)}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── 4. Collection Address (if Home Collection) ─── */}
              {collectionMode === 'home' ? (
                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-3">
                  <div className="border-b border-[#f1f5f9] pb-3">
                    <h2 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2">
                      <Icon name="location_on" className="text-[#006872] text-[18px]" />
                      <span>4. Doorstep Collection Address</span>
                    </h2>
                    <p className="text-[11.5px] text-[#64748b]">Where should our phlebotomist collect the sample?</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-bold text-[#334155]">Full Address (Street, Colony, City, Pin) *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. House No. 42, Main Market Road, City - 331001"
                      required
                      className="min-h-20 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#006872] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-bold text-[#334155]">Special Instructions (optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Fasting required, ring bell 2nd floor"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#006872] focus:bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-2">
                  <h2 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2">
                    <Icon name="storefront" className="text-[#006872] text-[18px]" />
                    <span>Lab Center Location</span>
                  </h2>
                  <p className="text-[13px] font-bold text-[#006872]">Balaji Medical Store &amp; Diagnostic Centre</p>
                  <p className="text-[12px] text-[#64748b]">Main Market, City Center — Open Daily 09:00 AM to 09:00 PM</p>
                  <p className="text-[11.5px] text-[#16a34a] font-medium">✓ No waiting queue for online appointment bookings.</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  !patientName.trim() ||
                  !patientPhone.trim() ||
                  !patientAge ||
                  !selectedDate ||
                  !selectedTime ||
                  (collectionMode === 'home' && !address.trim())
                }
                className="w-full rounded-2xl bg-[#006872] py-4 text-[14px] font-bold text-white shadow-md hover:bg-[#00535b] disabled:opacity-50 cursor-pointer transition active:scale-98"
              >
                {submitting ? 'Booking Test Appointment…' : `Confirm Booking · ₹${totalPrice.toLocaleString('en-IN')}`}
              </button>
            </form>

            {/* Right Summary Sticky Card */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Booking Summary</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0fdfa] text-[#006872]">
                    <Icon name={selectedPkg?.icon ?? 'science'} className="text-[26px]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#0f172a]">{itemName}</h3>
                    <p className="text-[11px] text-[#64748b] line-clamp-2">{selectedPkg?.detail ?? selectedTest?.detail}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[#f1f5f9] pt-3 text-[12.5px]">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Package Price</span>
                    <span className="font-bold text-[#0f172a]">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Sample Collection</span>
                    <span className="font-bold text-[#16a34a]">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Digital Report</span>
                    <span className="font-bold text-[#006872]">Included</span>
                  </div>
                  <div className="flex justify-between border-t border-[#f1f5f9] pt-2 text-[14px]">
                    <span className="font-extrabold text-[#0f172a]">Total Payable</span>
                    <span className="text-[18px] font-extrabold text-[#006872]">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#f8fafc] p-3 text-[11.5px] text-[#64748b] space-y-1">
                  <p className="font-bold text-[#0f172a]">📋 What happens next?</p>
                  <p>1. Appointment confirmed immediately.</p>
                  <p>2. Phlebotomist will call prior to sample collection.</p>
                  <p>3. Digital test report uploaded directly to your profile.</p>
                </div>
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
