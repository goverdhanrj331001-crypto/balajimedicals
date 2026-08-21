import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('brands');
export const POST = makeCrudHandler('brands');
export const PATCH = makeCrudHandler('brands');
export const DELETE = makeCrudHandler('brands');
