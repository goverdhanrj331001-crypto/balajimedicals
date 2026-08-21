'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { LabTest } from '@/types';

const columns: Column<LabTest>[] = [
  { key: 'name', label: 'Test Name', render: (t) => <span className="font-bold">{t.name}</span> },
  { key: 'detail', label: 'Detail', render: (t) => <span>{t.detail}</span> },
  { key: 'price', label: 'Price', render: (t) => <span className="font-bold">${Number(t.price).toFixed(2)}</span> },
  { key: 'visibility', label: 'Visibility', render: (t) => <StatusPill value={t.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Test Name', type: 'text', wide: true, placeholder: 'Complete Blood Count (CBC)' },
  { name: 'detail', label: 'Detail', type: 'text', wide: true, placeholder: 'Results in 24 hrs' },
  { name: 'price', label: 'Price ($)', type: 'number', placeholder: '15' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<LabTest> = {
  title: 'Lab Tests',
  description: 'Manage individual lab tests available for booking.',
  endpoint: '/api/admin/lab-tests',
  columns,
  fields,
  searchKeys: ['name', 'detail'],
  makeDefault: () => ({ name: '', detail: '', price: 0, visibility: 'active' }),
  stats: (items) => [
    { label: 'Total Tests', value: items.length, icon: 'biotech', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
  ],
};

export default function AdminLabTestsPage() {
  return <CrudPage config={config} />;
}
