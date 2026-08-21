import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('banners');
export const POST = makeCrudHandler('banners');
export const PATCH = makeCrudHandler('banners');
export const DELETE = makeCrudHandler('banners');
