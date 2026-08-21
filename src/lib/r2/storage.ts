// ─── Cloudflare R2 storage helper (server-side only) ────────────
// Used by API routes to upload files to R2.
// Falls back to local file storage in /public/uploads when R2 is not
// configured, so the UI works in dev without credentials.

import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { r2Config, isR2Configured } from '@/lib/firebase/config';

export interface UploadResult {
  url: string;
  key: string;
  bucket?: string;
}

// ─── Local fallback storage ─────────────────────────────────────
async function saveToLocal(buffer: Buffer, ext: string): Promise<UploadResult> {
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(dir, { recursive: true });
  const key = `${randomUUID()}${ext}`;
  await fs.writeFile(path.join(dir, key), buffer);
  return { url: `/uploads/${key}`, key };
}

// ─── R2 upload via S3 SDK ───────────────────────────────────────
async function saveToR2(buffer: Buffer, ext: string, contentType: string): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: r2Config.accessKeyId, secretAccessKey: r2Config.secretAccessKey },
  });
  const key = `medidemo/${randomUUID()}${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  const publicUrl = r2Config.publicUrl
    ? `${r2Config.publicUrl.replace(/\/$/, '')}/${key}`
    : `https://${r2Config.bucket}.${r2Config.accountId}.r2.cloudflarestorage.com/${key}`;
  return { url: publicUrl, key, bucket: r2Config.bucket };
}

export async function uploadFile(file: File | Blob, fallbackExt = '.png'): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = (file as File).name ?? '';
  const ext = path.extname(name) || fallbackExt;
  const contentType = file.type || 'application/octet-stream';
  if (isR2Configured) {
    try {
      return await saveToR2(buffer, ext, contentType);
    } catch (e) {
      console.error('[r2] upload failed, falling back to local:', e);
      return saveToLocal(buffer, ext);
    }
  }
  return saveToLocal(buffer, ext);
}

export async function deleteFile(urlOrKey: string): Promise<boolean> {
  // Best-effort delete; ignore errors.
  if (!urlOrKey) return false;
  try {
    if (urlOrKey.startsWith('/uploads/')) {
      const p = path.join(process.cwd(), 'public', urlOrKey);
      await fs.unlink(p);
      return true;
    }
    if (isR2Configured && (urlOrKey.includes('r2.cloudflarestorage.com') || urlOrKey.startsWith('medidemo/'))) {
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const client = new S3Client({
        region: 'auto',
        endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: r2Config.accessKeyId, secretAccessKey: r2Config.secretAccessKey },
      });
      const key = urlOrKey.includes('medidemo/') ? urlOrKey.slice(urlOrKey.indexOf('medidemo/')) : urlOrKey;
      await client.send(new DeleteObjectCommand({ Bucket: r2Config.bucket, Key: key }));
      return true;
    }
  } catch (e) {
    console.error('[r2] delete failed:', e);
  }
  return false;
}
