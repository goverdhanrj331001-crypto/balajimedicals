'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Brand } from '@/types';

const columns: Column<Brand>[] = [
  {
    key: 'name',
    label: 'Brand',
    render: (b) => (
      <div className="flex items-center gap-3">
        {b.logo || b.imageUrl ? (
          <img
            src={b.logo || b.imageUrl}
            alt={b.name}
            className="h-10 w-10 rounded-lg object-cover border border-[#e4e2e1]"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9eeee] text-[#006872] font-bold">
            {b.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="font-bold">{b.name}</span>
      </div>
    ),
  },
  { key: 'visibility', label: 'Visibility', render: (b) => <StatusPill value={b.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Brand Name', type: 'text', wide: true, placeholder: 'Himalaya' },
  { name: 'logo', label: 'Brand Logo Image', type: 'image', wide: true, hint: 'Upload a logo image. Will be displayed in the Featured brands section on home page.' },
  { name: 'imageUrl', label: 'Cover/Banner Image (optional)', type: 'image', wide: true, hint: 'Optional larger banner image for brand detail page.' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<Brand> = {
  title: 'Brands',
  description: 'Manage featured brands shown on the storefront home page. Upload a logo image for each brand.',
  endpoint: '/api/admin/brands',
  columns,
  fields,
  searchKeys: ['name'],
  makeDefault: () => ({ name: '', logo: '', imageUrl: '', visibility: 'active' }),
  stats: (items) => [
    { label: 'Total Brands', value: items.length, icon: 'storefront', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
    { label: 'With Logo', value: items.filter((i) => i.logo || i.imageUrl).length, icon: 'image', tone: 'gold' },
  ],
};

export default function AdminBrandsPage() {
  return <CrudPage config={config} />;
}
