import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('categories');
export const POST = makeCrudHandler('categories');
export const PATCH = makeCrudHandler('categories');
export const DELETE = makeCrudHandler('categories');
