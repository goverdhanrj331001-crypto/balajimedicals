'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  /** Endpoint to upload to. Defaults to /api/admin/upload (admin-only). */
  endpoint?: string;
}

export function ImageUpload({ value, onChange, label = 'Image', endpoint = '/api/admin/upload' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(endpoint, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      onChange(data.url);
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">{label}</span>
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[#bdc9ca] bg-[#f5f3f3]">
          {value ? (
            <img src={value} alt="Preview" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon name="image" className="text-[28px] text-[#bdc9ca]" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
            </div>
          )}
        </div>

        {/* Upload area */}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition ${
              dragOver
                ? 'border-[#006872] bg-[#d9eeee]/30'
                : 'border-[#bdc9ca] bg-[#f5f3f3] hover:border-[#006872] hover:bg-[#fbf9f8]'
            }`}
          >
            <Icon name="cloud_upload" className="mx-auto text-[24px] text-[#006872]" />
            <p className="mt-1 text-[11px] font-bold text-[#3e494a]">
              {value ? 'Replace Image' : 'Click or drag to upload'}
            </p>
            <p className="mt-0.5 text-[10px] text-[#6e797b]">JPG, PNG, WEBP · Max 10MB</p>
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="mt-2 rounded-lg border border-[#bdc9ca] bg-white px-3 py-1.5 text-[11px] font-bold text-[#910816] hover:bg-[#ffdad7]"
            >
              <Icon name="delete" className="mr-1 text-[14px]" /> Remove
            </button>
          )}
          {error && <p className="mt-1 text-[10px] font-semibold text-[#910816]">{error}</p>}
        </div>
      </div>
    </div>
  );
}
