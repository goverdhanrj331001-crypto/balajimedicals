'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Banner } from '@/types';

const columns: Column<Banner>[] = [
  { key: 'slot', label: 'Slot', render: (b) => <code className="rounded bg-[#f0eded] px-2 py-0.5 text-[11px] font-bold">{b.slot}</code> },
  { key: 'title', label: 'Title', render: (b) => <span className="font-bold">{b.title}</span> },
  { key: 'ctaText', label: 'CTA', render: (b) => <span>{b.ctaText ?? '—'}</span> },
  { key: 'visibility', label: 'Visibility', render: (b) => <StatusPill value={b.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  {
    name: 'slot',
    label: 'Slot',
    type: 'select',
    options: [
      { value: 'hero', label: 'Hero Banner (Home Page)' },
      { value: 'products', label: 'All Products Page Banner' },
      { value: 'prescription', label: 'Prescription Banner' },
      { value: 'essentials', label: 'Essentials Banner' },
      { value: 'call', label: 'Call-to-Order Banner' },
    ],
  },
  { name: 'title', label: 'Banner Title', type: 'text', wide: true, placeholder: 'e.g. Boost your immunity' },
  { name: 'ctaHref', label: 'CTA Link (URL)', type: 'text', placeholder: '/products' },
  { name: 'imageUrl', label: 'Banner Image', type: 'image', wide: true },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<Banner> = {
  title: 'Banners',
  description: 'Control all promotional banners shown on the storefront home page.',
  endpoint: '/api/admin/banners',
  columns,
  fields,
  searchKeys: ['title', 'slot'],
  makeDefault: () => ({
    slot: 'hero',
    title: '',
    ctaHref: '/products',
    imageUrl: '',
    visibility: 'active',
  }),
  stats: (items) => [
    { label: 'Total Banners', value: items.length, icon: 'view_carousel', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
  ],
};

export default function AdminBannersPage() {
  return <CrudPage config={config} />;
}
