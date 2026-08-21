import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('labPackages');
export const POST = makeCrudHandler('labPackages');
export const PATCH = makeCrudHandler('labPackages');
export const DELETE = makeCrudHandler('labPackages');
