'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { LabTest } from '@/types';

const columns: Column<LabTest>[] = [
  { key: 'name', label: 'Test Name', render: (t) => <span className="font-bold">{t.name}</span> },
  { key: 'detail', label: 'Detail', render: (t) => <span>{t.detail}</span> },
  { key: 'price', label: 'Price', render: (t) => <span className="font-bold">₹{Number(t.price).toLocaleString('en-IN')}</span> },
  {
    key: 'collectionType',
    label: 'Collection Mode',
    render: (t) => {
      const mode = t.collectionType || 'both';
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
  { key: 'visibility', label: 'Visibility', render: (t) => <StatusPill value={t.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Test Name', type: 'text', wide: true, placeholder: 'Complete Blood Count (CBC)' },
  { name: 'detail', label: 'Detail', type: 'text', wide: true, placeholder: 'Results in 24 hrs' },
  { name: 'price', label: 'Price (₹)', type: 'number', placeholder: '15' },
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
  { name: 'imageUrl', label: 'Test Image', type: 'image', wide: true, hint: 'Optional test icon or banner' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<LabTest> = {
  title: 'Lab Tests',
  description: 'Manage individual lab tests and configure home vs. lab collection modes.',
  endpoint: '/api/admin/lab-tests',
  columns,
  fields,
  searchKeys: ['name', 'detail'],
  makeDefault: () => ({ name: '', detail: '', price: 0, collectionType: 'both', visibility: 'active' }),
  stats: (items) => [
    { label: 'Total Tests', value: items.length, icon: 'biotech', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
    { label: 'Home Eligible', value: items.filter((i) => (i.collectionType || 'both') !== 'lab').length, icon: 'home', tone: 'gold' },
  ],
};

export default function AdminLabTestsPage() {
  return <CrudPage config={config} />;
}
