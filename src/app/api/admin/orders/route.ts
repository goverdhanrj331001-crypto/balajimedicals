import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('orders');
export const POST = makeCrudHandler('orders');
export const PATCH = makeCrudHandler('orders');
export const DELETE = makeCrudHandler('orders');
