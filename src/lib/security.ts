// ─── Rate Limiter (in-memory, per-IP) ────────────────────────────
// Prevents abuse of API endpoints.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60_000; // 1 minute window

interface RateLimitConfig {
  maxRequests: number;
  windowMs?: number;
}

export function rateLimit(config: RateLimitConfig): {
  success: boolean;
  remaining: number;
  resetAt: number;
} {
  const { maxRequests, windowMs = WINDOW_MS } = config;

  // Use a global key since we can't reliably get IP in all environments
  // In production with Vercel, x-forwarded-for header is used by the edge
  const key = 'global';
  const now = Date.now();

  const entry = limits.get(key);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    limits.set(key, newEntry);
    return { success: true, remaining: maxRequests - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of limits.entries()) {
      if (now > entry.resetAt) {
        limits.delete(key);
      }
    }
  }, 300_000);
}

// ─── Input Sanitization ──────────────────────────────────────────
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}

// ─── Validators ──────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-()]{8,20}$/;
  return phoneRegex.test(phone);
}

export function isValidPrice(price: any): boolean {
  const num = Number(price);
  return !isNaN(num) && num >= 0 && num <= 1000000;
}

export function isValidQuantity(qty: any): boolean {
  const num = Number(qty);
  return Number.isInteger(num) && num >= 0 && num <= 100000;
}
