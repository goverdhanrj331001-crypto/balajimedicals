import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('healthConcerns');
export const POST = makeCrudHandler('healthConcerns');
export const PATCH = makeCrudHandler('healthConcerns');
export const DELETE = makeCrudHandler('healthConcerns');
