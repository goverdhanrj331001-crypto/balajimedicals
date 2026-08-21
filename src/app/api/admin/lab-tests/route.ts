import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('labTests');
export const POST = makeCrudHandler('labTests');
export const PATCH = makeCrudHandler('labTests');
export const DELETE = makeCrudHandler('labTests');
