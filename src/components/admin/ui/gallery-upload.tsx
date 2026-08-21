'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';

interface GalleryUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

export function GalleryUpload({ value = [], onChange, label = 'Product Images / Gallery' }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    setError('');
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) {
        setError(`Skipped "${file.name}" — too large (max 10MB)`);
        continue;
      }
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Upload failed');
        newUrls.push(data.url);
      } catch (e: any) {
        setError(e.message ?? 'Upload failed');
      }
    }
    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
    }
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const setPrimary = (idx: number) => {
    if (idx === 0) return;
    const reordered = [...value];
    const [img] = reordered.splice(idx, 1);
    reordered.unshift(img);
    onChange(reordered);
  };

  const onDragStart = (idx: number) => setDragIndex(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const reordered = [...value];
    const [img] = reordered.splice(dragIndex, 1);
    reordered.splice(idx, 0, img);
    onChange(reordered);
    setDragIndex(idx);
  };
  const onDragEnd = () => setDragIndex(null);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#3e494a]">
          {label} {value.length > 0 && <span className="text-[#6e797b]">({value.length})</span>}
        </span>
        {value.length > 0 && (
          <span className="text-[10px] text-[#6e797b]">
            First image = Primary (shown on product detail)
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
          dragOver
            ? 'border-[#006872] bg-[#d9eeee]/30'
            : 'border-[#bdc9ca] bg-[#f5f3f3] hover:border-[#006872] hover:bg-[#fbf9f8]'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#006872]/30 border-t-[#006872]" />
            <p className="text-[12px] font-bold text-[#3e494a]">Uploading…</p>
          </div>
        ) : (
          <>
            <Icon name="add_photo_alternate" className="mx-auto text-[32px] text-[#006872]" />
            <p className="mt-1 text-[12px] font-bold text-[#3e494a]">+ Upload Images</p>
            <p className="mt-0.5 text-[10px] text-[#6e797b]">Drag & drop or click · Multiple files supported</p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-[10px] font-semibold text-[#910816]">{error}</p>}

      {/* Gallery grid */}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {value.map((url, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              className={`group relative aspect-square cursor-move overflow-hidden rounded-lg border-2 bg-[#f5f3f3] ${
                idx === 0 ? 'border-[#006872]' : 'border-[#bdc9ca]'
              } ${dragIndex === idx ? 'opacity-50' : ''}`}
            >
              <img
                src={url}
                alt={`Image ${idx + 1}`}
                className="h-full w-full object-cover"
                onClick={() => setPreviewIdx(idx)}
              />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded bg-[#006872] px-1.5 py-0.5 text-[8px] font-bold text-white">
                  PRIMARY
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1 py-1 opacity-0 transition group-hover:opacity-100">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(idx);
                    }}
                    className="rounded bg-white/20 p-1 text-white hover:bg-white/40"
                    title="Set as primary"
                  >
                    <Icon name="star" className="text-[12px]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="rounded bg-white/20 p-1 text-white hover:bg-[#910816]"
                  title="Delete"
                >
                  <Icon name="delete" className="text-[12px]" />
                </button>
              </div>
              <span className="absolute right-1 top-1 text-[9px] font-bold text-white/80">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Full preview modal */}
      {previewIdx !== null && value[previewIdx] && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewIdx(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
            onClick={() => setPreviewIdx(null)}
          >
            <Icon name="close" />
          </button>
          <img
            src={value[previewIdx]}
            alt="Full preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
