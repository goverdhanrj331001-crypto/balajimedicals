'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { LabPackage } from '@/types';

const columns: Column<LabPackage>[] = [
  {
    key: 'name',
    label: 'Package',
    render: (p) => (
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-[#d9eeee] overflow-hidden">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[20px] text-[#006872]">{p.icon || 'science'}</span>
          )}
        </div>
        <div>
          <p className="text-[12px] font-bold">{p.name}</p>
          <p className="text-[10px] text-[#6e797b] max-w-[200px] truncate">{p.detail}</p>
        </div>
      </div>
    ),
  },
  { key: 'price', label: 'Price', render: (p) => <span className="font-bold">₹{Number(p.price).toLocaleString('en-IN')}</span> },
  {
    key: 'collectionType',
    label: 'Collection Mode',
    render: (p) => {
      const mode = p.collectionType || 'both';
      return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
          mode === 'home'
            ? 'bg-[#dcfce7] text-[#15803d]'
            : mode === 'lab'
            ? 'bg-[#e0e7ff] text-[#4338ca]'
            : 'bg-[#d9eeee] text-[#006872]'
        }`}>
          {mode === 'home' ? '🏠 Home Only' : mode === 'lab' ? '🏥 Lab Visit Only' : '✨ Home & Lab Both'}
        </span>
      );
    },
  },
  { key: 'badge', label: 'Badge', render: (p) => p.badge ? <code className="rounded bg-[#f0eded] px-2 py-0.5 text-[11px] font-bold text-[#006872]">{p.badge}</code> : '—' },
  { key: 'visibility', label: 'Visibility', render: (p) => <StatusPill value={p.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Package Name', type: 'text', wide: true, placeholder: 'Full Body Checkup' },
  { name: 'detail', label: 'Detail', type: 'textarea', wide: true, placeholder: 'Includes 85 tests: CBC, Thyroid, Lipid, Liver & more.' },
  { name: 'price', label: 'Price (₹)', type: 'number', placeholder: '149' },
  {
    name: 'collectionType',
    label: 'Sample Collection Mode',
    type: 'select',
    options: [
      { value: 'both', label: 'Home Collection & Lab Visit (Both)' },
      { value: 'home', label: 'Home Collection Only' },
      { value: 'lab', label: 'Physical Visit / Lab Store Only' },
    ],
    hint: 'Determines if patients can book home pickup, lab visit, or choose either',
  },
  { name: 'imageUrl', label: 'Package Image / Banner', type: 'image', wide: true, hint: 'Optional package artwork' },
  { name: 'icon', label: 'Icon (Material Symbol fallback)', type: 'text', placeholder: 'science' },
  { name: 'badge', label: 'Badge', type: 'text', placeholder: '50% OFF', hint: 'Optional promotion tag' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<LabPackage> = {
  title: 'Lab Packages',
  description: 'Manage curated health checkup packages and configure home vs. lab collection modes.',
  endpoint: '/api/admin/lab-packages',
  columns,
  fields,
  searchKeys: ['name', 'detail'],
  makeDefault: () => ({
    name: '',
    detail: '',
    price: 0,
    icon: 'science',
    imageUrl: '',
    collectionType: 'both',
    badge: '',
    visibility: 'active',
  }),
  stats: (items) => [
    { label: 'Total Packages', value: items.length, icon: 'science', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
    { label: 'Home Eligible', value: items.filter((i) => (i.collectionType || 'both') !== 'lab').length, icon: 'home', tone: 'gold' },
  ],
};

export default function AdminLabPackagesPage() {
  return <CrudPage config={config} />;
}
