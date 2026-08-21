import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('employees');
export const POST = makeCrudHandler('employees');
export const PATCH = makeCrudHandler('employees');
export const DELETE = makeCrudHandler('employees');
