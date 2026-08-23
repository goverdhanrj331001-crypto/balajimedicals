'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { StoreHeader } from '@/components/layout/store-header';
import { DesktopFooter } from '@/components/layout/desktop-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setProfileImage(data.url);
      // Save to user record
      if (user?.uid) {
        await fetch(`/api/admin/users?id=${user.uid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImage: data.url }),
        });
      }
      toast.success('Profile image updated');
    } catch (e: any) {
      toast.error(e.message ?? 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;
    fetch('/api/public/orders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setOrders(d.items ?? []))
      .catch(() => setOrders([]));
  }, [userId]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhone(user.phone ?? '');
      setAge(user.age ? String(user.age) : '');
      setGender(user.gender ?? 'Male');
      setAddress(user.address ?? '');
      if (user.profileImage) setProfileImage(user.profileImage);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="app-root min-h-screen pb-16 md:pb-0">
        <DesktopHeader />
      <StoreHeader search={false} />
        <div className="flex h-96 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
        </div>
        <DesktopFooter />
      <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-root min-h-screen pb-16 md:pb-0">
        <DesktopHeader />
      <StoreHeader search={false} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon name="person" className="text-[64px] text-[#bdc9ca]" />
          <p className="mt-3 text-[14px] font-bold">You are not logged in</p>
          <p className="text-[12px] text-[#6e797b]">Login to view your profile and orders.</p>
          <Link href="/login?redirect=/profile" className="mt-4 rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white">
            Login
          </Link>
        </div>
        <DesktopFooter />
      <BottomNav />
      </div>
    );
  }

  const recentOrders = orders.slice(0, 3);
  const completedOrders = orders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;
  const pendingOrders = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'In Transit',
  ).length;
  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'Completed' || o.paymentMethod === 'COD')
    .reduce((s, o) => s + Number(o.total ?? 0), 0);

  const onLogout = async () => {
    await logout();
    router.push('/');
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/admin/users?id=${user.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, age, gender, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Update failed');
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message ?? 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const labOrders = orders.filter((o) => o.type === 'lab');

  const menuItems = [
    { icon: 'shopping_bag', label: 'My Orders', desc: `${orders.length} orders placed`, href: '/orders' },
    { icon: 'science', label: 'My Lab Tests', desc: `${labOrders.length} lab tests booked`, href: '/lab-tests' },
    { icon: 'favorite', label: 'Wishlist', desc: 'Saved products', href: '/products' },
    { icon: 'local_offer', label: 'Offers & Coupons', desc: 'Available discounts', href: '/products' },
    { icon: 'support_agent', label: 'Help & Support', desc: 'Get help with orders', href: '/products' },
    { icon: 'privacy_tip', label: 'Privacy & Security', desc: 'Manage your data', href: '/products' },
    { icon: 'info', label: 'About Us', desc: 'Learn more about us', href: '/products' },
  ];

  return (
    <div className="app-root min-h-screen pb-16 md:pb-0">
      <DesktopHeader />
      <StoreHeader search={false} />
      <main className="desktop-canvas px-3 md:px-8 py-4">
        {/* Profile Header Card */}
        <div className="soft-card overflow-hidden rounded-2xl">
          <div className="h-24 bg-gradient-to-r from-[#006872] to-[#00838f]" />
          <div className="px-5 pb-5">
            <div className="-mt-12 flex items-end justify-between">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#006872] text-[32px] font-bold text-white shadow-lg">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    user.name?.slice(0, 1).toUpperCase() ?? 'U'
                  )}
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#006872] text-white shadow-md hover:bg-[#00535b]"
                  title="Upload profile photo"
                >
                  <Icon name="photo_camera" className="text-[16px]" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setEditing(!editing)}
                className="mb-2 flex items-center gap-1 rounded-lg border border-[#bdc9ca] bg-white px-3 py-2 text-[11px] font-bold text-[#006872] hover:bg-[#d9eeee]"
              >
                <Icon name={editing ? 'close' : 'edit'} className="text-[16px]" />
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="mt-3">
              {editing ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Full Name</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Phone</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Age</span>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 35"
                        min="1"
                        max="120"
                        className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Gender</span>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-[#3e494a]">Delivery / Home Address</span>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your full delivery & home address"
                      className="min-h-16 w-full resize-y rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="w-full rounded-lg bg-[#006872] py-2.5 text-[12px] font-bold text-white hover:bg-[#00535b] disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-[20px] font-extrabold">{user.name}</h1>
                  <p className="text-[12px] text-[#6e797b]">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#d9eeee] px-2 py-0.5 text-[10px] font-bold uppercase text-[#006872]">
                      {user.role}
                    </span>
                    <span className="rounded-full bg-[#d9eeee] px-2 py-0.5 text-[10px] font-bold text-[#006872]">
                      Active
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="soft-card rounded-xl p-4 text-center">
            <p className="text-[20px] font-extrabold text-[#006872]">{orders.length}</p>
            <p className="text-[10px] text-[#6e797b]">Total Orders</p>
          </div>
          <div className="soft-card rounded-xl p-4 text-center">
            <p className="text-[20px] font-extrabold text-[#4caf50]">{completedOrders}</p>
            <p className="text-[10px] text-[#6e797b]">Delivered</p>
          </div>
          <div className="soft-card rounded-xl p-4 text-center">
            <p className="text-[20px] font-extrabold text-[#ff9800]">{pendingOrders}</p>
            <p className="text-[10px] text-[#6e797b]">In Progress</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold">Recent Orders</h2>
            <Link href="/orders" className="text-[12px] font-bold text-[#006872]">View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="soft-card rounded-xl p-6 text-center">
              <Icon name="shopping_bag" className="text-[36px] text-[#bdc9ca]" />
              <p className="mt-2 text-[12px] font-bold">No orders yet</p>
              <Link href="/products" className="mt-2 inline-block text-[12px] font-bold text-[#006872]">Start shopping →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href="/orders"
                  className="soft-card flex items-center justify-between rounded-xl p-3 hover:bg-[#fbf9f8]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9eeee]">
                      <Icon name="receipt_long" className="text-[20px] text-[#006872]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold">#{o.id}</p>
                      <p className="text-[11px] text-[#6e797b]">
                        {o.items?.length ?? 0} items · {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold">₹{Number(o.total).toLocaleString('en-IN')}</p>
                    <span
                      className={`text-[10px] font-bold ${
                        o.status === 'Delivered' || o.status === 'Completed'
                          ? 'text-[#006872]'
                          : o.status === 'Cancelled'
                          ? 'text-[#910816]'
                          : 'text-[#ff9800]'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Lab Tests — status of booked lab reports */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold">My Lab Tests</h2>
            <Link href="/lab-tests" className="text-[12px] font-bold text-[#006872]">Book New →</Link>
          </div>
          {labOrders.length === 0 ? (
            <div className="soft-card rounded-xl p-6 text-center">
              <Icon name="science" className="text-[36px] text-[#bdc9ca]" />
              <p className="mt-2 text-[12px] font-bold">No lab tests booked yet</p>
              <Link href="/lab-tests" className="mt-2 inline-block text-[12px] font-bold text-[#006872]">Book a lab test →</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {labOrders.slice(0, 5).map((o) => {
                const testName = o.items?.[0]?.name ?? 'Lab Test';
                const isCompleted = o.status === 'Completed' || o.status === 'Delivered';
                const isPending = o.status === 'Pending' || o.status === 'Processing' || o.status === 'Confirmed';
                return (
                  <div
                    key={o.id}
                    className="soft-card flex flex-col gap-2 rounded-2xl p-3.5 sm:flex-row sm:items-center sm:justify-between border border-[#e2e8f0]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isCompleted ? 'bg-[#d9eeee] text-[#006872]' : isPending ? 'bg-[#ffddb5] text-[#835400]' : 'bg-[#ffdad7] text-[#910816]'
                      }`}>
                        <Icon name="science" className="text-[22px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[13.5px] font-bold text-[#0f172a]">{testName}</p>
                          {o.collectionMode && (
                            <span className={`rounded px-1.5 py-0.2 text-[9.5px] font-bold ${
                              o.collectionMode === 'home' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#e0e7ff] text-[#4338ca]'
                            }`}>
                              {o.collectionMode === 'home' ? '🏠 Home' : '🏥 Lab'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[#64748b]">
                          #{o.id} · {o.scheduledAt ? new Date(o.scheduledAt).toLocaleDateString() : new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9]">
                      <div className="text-left sm:text-right">
                        <p className="text-[13px] font-bold text-[#0f172a]">₹{Number(o.total).toLocaleString('en-IN')}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-[#dcfce7] text-[#15803d]'
                              : isPending
                              ? 'bg-[#fef3c7] text-[#b45309]'
                              : 'bg-[#fee2e2] text-[#b91c1c]'
                          }`}
                        >
                          {isCompleted ? 'Report Ready' : o.status}
                        </span>
                      </div>

                      {o.reportUrl && (
                        <a
                          href={o.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-[#006872] px-3 py-1.5 text-[11.5px] font-bold text-white shadow-2xs hover:bg-[#00535b]"
                        >
                          <Icon name="description" className="text-[14px]" />
                          <span>View Report</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Menu List */}
        <div className="mt-5">
          <h2 className="mb-3 text-[16px] font-bold">Account</h2>
          <div className="soft-card overflow-hidden rounded-xl">
            {menuItems.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 p-4 hover:bg-[#fbf9f8] ${
                  i !== menuItems.length - 1 ? 'border-b border-[#f0eded]' : ''
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d9eeee]">
                  <Icon name={item.icon} className="text-[18px] text-[#006872]" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold">{item.label}</p>
                  <p className="text-[11px] text-[#6e797b]">{item.desc}</p>
                </div>
                <Icon name="chevron_right" className="text-[18px] text-[#bdc9ca]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#ffdad7] bg-white py-3 text-[13px] font-bold text-[#910816] hover:bg-[#ffdad7]"
        >
          <Icon name="logout" className="text-[18px]" />
          Logout
        </button>

        {/* App version */}
        <p className="mt-5 text-center text-[10px] text-[#bdc9ca]">
          Balaji Medical Store v1.0.0
        </p>
      </main>
      <DesktopFooter />
      <BottomNav />
    </div>
  );
}
