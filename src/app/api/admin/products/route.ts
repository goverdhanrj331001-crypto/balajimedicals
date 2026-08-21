import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('products');
export const POST = makeCrudHandler('products');
export const PATCH = makeCrudHandler('products');
export const DELETE = makeCrudHandler('products');
