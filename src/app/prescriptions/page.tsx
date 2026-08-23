'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<{ url: string; name: string; time: number }[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace('/login?redirect=/prescriptions');
    }
  }, [user, router]);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/public/upload-prescription', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setUploaded((prev) => [{ url: data.url, name: file.name, time: Date.now() }, ...prev]);
      toast.success('Prescription uploaded successfully');
    } catch (e: any) {
      toast.error(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="app-root min-h-screen pb-16">
      <main className="desktop-canvas px-3 md:px-8 py-4">
        <h1 className="text-[24px] font-extrabold tracking-tight">My Prescriptions</h1>
        <p className="text-[13px] text-[#3e494a]">Upload prescriptions for faster order processing.</p>

        <div className="mt-5 soft-card rounded-xl p-5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#bdc9ca] bg-[#f5f3f3] p-8 text-center hover:border-[#006872] hover:bg-[#d9eeee]/30 disabled:opacity-60"
          >
            {uploading ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
            ) : (
              <>
                <Icon name="upload_file" className="text-[48px] text-[#006872]" />
                <p className="mt-2 text-[14px] font-bold">Click to upload prescription</p>
                <p className="mt-1 text-[11px] text-[#6e797b]">PNG, JPG, or PDF · Max 10MB</p>
              </>
            )}
          </button>
        </div>

        {/* Uploaded list */}
        <div className="mt-5">
          <h2 className="mb-3 text-[16px] font-bold">Uploaded Prescriptions</h2>
          {uploaded.length === 0 ? (
            <div className="soft-card rounded-xl p-6 text-center">
              <Icon name="description" className="text-[36px] text-[#bdc9ca]" />
              <p className="mt-2 text-[12px] text-[#6e797b]">No prescriptions uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {uploaded.map((u, i) => (
                <div key={i} className="soft-card flex items-center gap-3 rounded-xl p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff3e0]">
                    <Icon name="description" className="text-[#a46a00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[12px] font-bold">{u.name}</p>
                    <p className="text-[10px] text-[#6e797b]">{new Date(u.time).toLocaleString()}</p>
                  </div>
                  <a
                    href={u.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[#bdc9ca] px-3 py-1.5 text-[11px] font-bold text-[#006872] hover:bg-[#d9eeee]"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 rounded-lg bg-[#fff3e0] p-4 text-[12px] text-[#643f00]">
          <p className="font-bold">Need help?</p>
          <p className="mt-1">
            Call us at <a href="tel:+919521000000" className="font-bold underline">+91 95210-00000</a> or email{' '}
            <a href="mailto:support@balajimedical.com" className="font-bold underline">support@balajimedical.com</a> for assistance with prescriptions.
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
