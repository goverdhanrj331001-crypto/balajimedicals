'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { LabPackage } from '@/types';

const columns: Column<LabPackage>[] = [
  {
    key: 'name',
    label: 'Package',
    render: (p) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#d9eeee]">
          <span className="material-symbols-outlined text-[18px] text-[#006872]">{p.icon}</span>
        </div>
        <div>
          <p className="text-[12px] font-bold">{p.name}</p>
          <p className="text-[10px] text-[#6e797b]">{p.detail}</p>
        </div>
      </div>
    ),
  },
  { key: 'price', label: 'Price', render: (p) => <span className="font-bold">${Number(p.price).toFixed(2)}</span> },
  { key: 'badge', label: 'Badge', render: (p) => p.badge ? <code className="rounded bg-[#f0eded] px-2 py-0.5 text-[11px]">{p.badge}</code> : '—' },
  { key: 'visibility', label: 'Visibility', render: (p) => <StatusPill value={p.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Package Name', type: 'text', wide: true, placeholder: 'Full Body Checkup' },
  { name: 'detail', label: 'Detail', type: 'textarea', wide: true, placeholder: 'Includes 85 tests: CBC, Thyroid, Lipid, Liver & more.' },
  { name: 'price', label: 'Price ($)', type: 'number', placeholder: '149' },
  { name: 'icon', label: 'Icon (Material Symbol)', type: 'text', placeholder: 'favorite' },
  { name: 'badge', label: 'Badge', type: 'text', placeholder: '50% OFF', hint: 'Optional' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<LabPackage> = {
  title: 'Lab Packages',
  description: 'Manage curated health checkup packages shown on the lab tests page.',
  endpoint: '/api/admin/lab-packages',
  columns,
  fields,
  searchKeys: ['name', 'detail'],
  makeDefault: () => ({
    name: '',
    detail: '',
    price: 0,
    icon: 'science',
    badge: '',
    visibility: 'active',
  }),
  stats: (items) => [
    { label: 'Total Packages', value: items.length, icon: 'science', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
  ],
};

export default function AdminLabPackagesPage() {
  return <CrudPage config={config} />;
}
