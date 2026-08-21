import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('users');
export const POST = makeCrudHandler('users');
export const PATCH = makeCrudHandler('users');
export const DELETE = makeCrudHandler('users');
