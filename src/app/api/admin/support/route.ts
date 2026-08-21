import { makeCrudHandler } from '@/app/api/admin/_crud';
export const dynamic = 'force-dynamic';
export const GET = makeCrudHandler('supportTickets');
export const POST = makeCrudHandler('supportTickets');
export const PATCH = makeCrudHandler('supportTickets');
export const DELETE = makeCrudHandler('supportTickets');
