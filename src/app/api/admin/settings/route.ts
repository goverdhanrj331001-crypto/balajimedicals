import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('settings');
export const POST = makeCrudHandler('settings');
export const PATCH = makeCrudHandler('settings');
export const DELETE = makeCrudHandler('settings');
