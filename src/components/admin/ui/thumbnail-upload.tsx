'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { uploadFile } from '@/lib/r2/storage';

interface ThumbnailUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ThumbnailUpload({ value, onChange, label = 'Thumbnail Image' }: ThumbnailUploadProps) {
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
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      onChange(data.url);
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">
        {label} <span className="text-[#910816]">*</span>
      </span>
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-[#bdc9ca] bg-[#f5f3f3]">
          {value ? (
            <img src={value} alt="Thumbnail" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-[#bdc9ca]">
              <Icon name="image" className="text-[32px]" />
              <span className="text-[9px]">No image</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
            </div>
          )}
        </div>

        {/* Actions */}
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
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition ${
              dragOver
                ? 'border-[#006872] bg-[#d9eeee]/30'
                : 'border-[#bdc9ca] bg-[#f5f3f3] hover:border-[#006872] hover:bg-[#fbf9f8]'
            }`}
          >
            <Icon name="cloud_upload" className="mx-auto text-[28px] text-[#006872]" />
            <p className="mt-1 text-[12px] font-bold text-[#3e494a]">
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
          <p className="mt-2 text-[10px] text-[#6e797b]">
            Recommended: Square image, high-quality product/packaging shot
          </p>
        </div>
      </div>
    </div>
  );
}
