import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('transactions');
export const POST = makeCrudHandler('transactions');
export const PATCH = makeCrudHandler('transactions');
export const DELETE = makeCrudHandler('transactions');
