import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('offers');
export const POST = makeCrudHandler('offers');
export const PATCH = makeCrudHandler('offers');
export const DELETE = makeCrudHandler('offers');
