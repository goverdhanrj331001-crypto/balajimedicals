import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('reviews' as any);
export const POST = makeCrudHandler('reviews' as any);
export const PATCH = makeCrudHandler('reviews' as any);
export const DELETE = makeCrudHandler('reviews' as any);
