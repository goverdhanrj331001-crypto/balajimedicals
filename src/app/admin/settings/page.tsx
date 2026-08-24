'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { SectionCard } from '@/components/admin/admin-ui';
import { Field, TextInput, PrimaryButton } from '@/components/admin/ui/form';
import { ToggleSwitch } from '@/components/admin/ui/toggle-switch';
import { Icon } from '@/components/ui/icon';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setSettings(d.items?.[0] ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings?id=${settings.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Save failed');
      setSettings(json.item);
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="System Settings">
      <div className="mb-6">
        <h2 className="text-[24px] font-extrabold tracking-tight">System Settings</h2>
        <p className="mt-1 text-[13px] text-[#3e494a]">Configure storefront branding, contact info, and operational thresholds.</p>
      </div>

      {loading || !settings ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
      ) : (
        <form onSubmit={onSave} className="max-w-4xl space-y-5">
          <SectionCard title="Storefront Branding">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Site Name">
                <TextInput value={settings.siteName ?? ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
              </Field>
              <Field label="Tagline">
                <TextInput value={settings.tagline ?? ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Contact Information">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Support Phone">
                <TextInput value={settings.supportPhone ?? ''} onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })} />
              </Field>
              <Field label="Support Email">
                <TextInput value={settings.supportEmail ?? ''} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Commerce">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Currency Code">
                <TextInput value={settings.currency ?? ''} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
              </Field>
              <Field label="Currency Symbol">
                <TextInput value={settings.currencySymbol ?? ''} onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })} />
              </Field>
              <Field label="Free Shipping Threshold (₹)
">
                <TextInput type="number" value={settings.freeShippingThreshold ?? 0} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })} />
              </Field>
              <Field label="Prescription Discount (%)">
                <TextInput type="number" value={settings.prescriptionDiscountPct ?? 0} onChange={(e) => setSettings({ ...settings, prescriptionDiscountPct: Number(e.target.value) })} />
              </Field>
            </div>
          </SectionCard>

          {/* Lab Test Booking Settings */}
          <SectionCard title="Lab Test Booking Settings">
            <p className="mb-4 text-[12px] text-[#6e797b]">
              Configure when lab testing service is available and how many times a customer can book per day.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Service Start Time" hint="e.g. 09:00 (9 AM)">
                <TextInput
                  type="time"
                  value={settings.labTestServiceStart ?? '09:00'}
                  onChange={(e) => setSettings({ ...settings, labTestServiceStart: e.target.value })}
                />
              </Field>
              <Field label="Service End Time" hint="e.g. 21:00 (9 PM)">
                <TextInput
                  type="time"
                  value={settings.labTestServiceEnd ?? '21:00'}
                  onChange={(e) => setSettings({ ...settings, labTestServiceEnd: e.target.value })}
                />
              </Field>
              <Field label="Max Bookings Per Customer / Day" hint="How many lab tests a customer can book per day">
                <TextInput
                  type="number"
                  value={settings.labTestMaxBookingsPerDay ?? 1}
                  onChange={(e) => setSettings({ ...settings, labTestMaxBookingsPerDay: Number(e.target.value) })}
                />
              </Field>
            </div>
            <div className="mt-3 rounded-lg bg-[#d9eeee] p-3 text-[11px] text-[#006872]">
              <Icon name="info" className="mr-1 align-middle text-[16px]" />
              Users can only book for <b>Today</b> and <b>Tomorrow</b>. Booking is available only between service hours.
              If current time is outside service hours, users will see "Booking Closed" message.
            </div>
          </SectionCard>

          {/* Payment Gateway */}
          <SectionCard title="Payment Gateway Settings">
            <p className="mb-4 text-[12px] text-[#6e797b]">
              Configure payment methods for checkout. Enable Razorpay for online payments, or keep COD only.
            </p>

            {/* Razorpay */}
            <div className="space-y-3 rounded-lg border border-[#e4e2e1] bg-[#fbf9f8] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0c2451] text-white">
                    <Icon name="credit_card" className="text-[18px]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold">Razorpay</p>
                    <p className="text-[10px] text-[#6e797b]">Online payment gateway (Cards, UPI, NetBanking)</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.razorpayEnabled ?? false}
                  onChange={(v) => setSettings({ ...settings, razorpayEnabled: v })}
                />
              </div>
              {settings.razorpayEnabled && (
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Razorpay Key ID">
                    <TextInput
                      value={settings.razorpayKeyId ?? ''}
                      onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                      placeholder="rzp_test_xxxxxxxxxxxx"
                    />
                  </Field>
                  <Field label="Razorpay Key Secret">
                    <TextInput
                      type="password"
                      value={settings.razorpayKeySecret ?? ''}
                      onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                      placeholder="••••••••••••••••"
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* Other methods */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-[#e4e2e1] bg-white p-3">
                <div className="flex items-center gap-2">
                  <Icon name="payments" className="text-[20px] text-[#006872]" />
                  <div>
                    <p className="text-[13px] font-bold">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-[#6e797b]">Pay when you receive the order</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.codEnabled ?? true}
                  onChange={(v) => setSettings({ ...settings, codEnabled: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#e4e2e1] bg-white p-3">
                <div className="flex items-center gap-2">
                  <Icon name="account_balance_wallet" className="text-[20px] text-[#006872]" />
                  <div>
                    <p className="text-[13px] font-bold">UPI / Wallet</p>
                    <p className="text-[10px] text-[#6e797b]">Direct UPI payment (requires Razorpay)</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.upiEnabled ?? false}
                  onChange={(v) => setSettings({ ...settings, upiEnabled: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#e4e2e1] bg-white p-3">
                <div className="flex items-center gap-2">
                  <Icon name="credit_card" className="text-[20px] text-[#006872]" />
                  <div>
                    <p className="text-[13px] font-bold">Credit / Debit Card</p>
                    <p className="text-[10px] text-[#6e797b]">Card payment (requires Razorpay)</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.cardEnabled ?? false}
                  onChange={(v) => setSettings({ ...settings, cardEnabled: v })}
                />
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end gap-2 pt-2">
            <PrimaryButton type="submit" loading={saving}>
              <Icon name="save" className="text-[18px]" /> Save Settings
            </PrimaryButton>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
