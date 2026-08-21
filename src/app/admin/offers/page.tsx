'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Offer } from '@/types';

const columns: Column<Offer>[] = [
  { key: 'text', label: 'Offer Text', render: (o) => <span className="font-bold">{o.text}</span> },
  { key: 'code', label: 'Code', render: (o) => <code className="rounded bg-[#f0eded] px-2 py-0.5 text-[11px] font-bold">{o.code}</code> },
  { key: 'visibility', label: 'Visibility', render: (o) => <StatusPill value={o.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'text', label: 'Offer Text', type: 'text', wide: true, placeholder: 'Flat 25% off + up to $10 cashback' },
  { name: 'code', label: 'Coupon Code', type: 'text', placeholder: 'MEDI25' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<Offer> = {
  title: 'Offers',
  description: 'Manage promotional offers and coupon codes shown on the storefront.',
  endpoint: '/api/admin/offers',
  columns,
  fields,
  searchKeys: ['text', 'code'],
  makeDefault: () => ({ text: '', code: '', visibility: 'active' }),
  stats: (items) => [
    { label: 'Total Offers', value: items.length, icon: 'local_offer', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
  ],
};

export default function AdminOffersPage() {
  return <CrudPage config={config} />;
}
