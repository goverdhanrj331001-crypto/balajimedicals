'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { HealthConcern } from '@/types';

const columns: Column<HealthConcern>[] = [
  {
    key: 'name',
    label: 'Health Concern',
    render: (h) => (
      <div className="flex items-center gap-3">
        {h.imageUrl ? (
          <img
            src={h.imageUrl}
            alt={h.name}
            className="h-10 w-10 rounded-lg object-cover border border-[#e4e2e1]"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded" style={{ background: h.tint }}>
            <span className="material-symbols-outlined text-[20px] text-[#006872]">{h.icon}</span>
          </div>
        )}
        <span className="font-bold">{h.name}</span>
      </div>
    ),
  },
  { key: 'visibility', label: 'Visibility', render: (h) => <StatusPill value={h.visibility === 'active' || !h.visibility ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Name', type: 'text', wide: true, placeholder: 'Diabetes care' },
  { name: 'imageUrl', label: 'Image', type: 'image', wide: true, hint: 'Upload an image for this health concern. Will be displayed in the Shop by health concerns section on home page.' },
  { name: 'icon', label: 'Fallback Icon (Material Symbol)', type: 'text', placeholder: 'bloodtype', hint: 'Used only when no image is uploaded' },
  { name: 'tint', label: 'Fallback Tint Color', type: 'text', placeholder: '#eadff3', hint: 'Background color when no image is uploaded' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<HealthConcern> = {
  title: 'Health Concerns',
  description: 'Manage the "Shop by health concerns" section on the storefront home page. Upload an image for each concern.',
  endpoint: '/api/admin/health-concerns',
  columns,
  fields,
  searchKeys: ['name'],
  makeDefault: () => ({ name: '', icon: 'favorite', tint: '#d9eeee', imageUrl: '', visibility: 'active' }),
  stats: (items) => [
    { label: 'Total Concerns', value: items.length, icon: 'health_and_safety', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active' || !i.visibility).length, icon: 'check_circle', tone: 'blue' },
    { label: 'With Image', value: items.filter((i) => i.imageUrl).length, icon: 'image', tone: 'gold' },
  ],
};

export default function AdminHealthConcernsPage() {
  return <CrudPage config={config} />;
}
