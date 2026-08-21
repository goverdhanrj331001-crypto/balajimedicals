'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Category } from '@/types';

const columns: Column<Category>[] = [
  {
    key: 'name',
    label: 'Category',
    render: (c) => (
      <div className="flex items-center gap-2">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt={c.name} loading="lazy" decoding="async" className="h-10 w-10 rounded-lg object-cover border border-[#e4e2e1]" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f3f3]">
            <span className="material-symbols-outlined text-[18px] text-[#bdc9ca]">image</span>
          </div>
        )}
        <span className="text-[12px] font-bold">{c.name}</span>
      </div>
    ),
  },
  { key: 'visibility', label: 'Visibility', render: (c) => <StatusPill value={c.visibility === 'active' ? 'Active' : 'Hidden'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Category Name', type: 'text', wide: true, placeholder: 'Vitamins & Supplements' },
  { name: 'imageUrl', label: 'Category Image', type: 'image', wide: true, hint: 'Upload an image for this category. It will be displayed on the storefront.' },
  { name: 'visibility', label: 'Visibility', type: 'toggle' },
];

const config: CrudPageConfig<Category> = {
  title: 'Categories',
  description: 'Organize the store catalog into customer-facing categories. Upload an image for each category.',
  endpoint: '/api/admin/categories',
  columns,
  fields,
  searchKeys: ['name'],
  makeDefault: () => ({
    name: '',
    icon: 'category',
    tint: '#d9eeee',
    imageUrl: '',
    visibility: 'active',
  }),
  stats: (items) => [
    { label: 'Total Categories', value: items.length, icon: 'category', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.visibility === 'active').length, icon: 'check_circle', tone: 'blue' },
    { label: 'With Image', value: items.filter((i) => i.imageUrl).length, icon: 'image', tone: 'gold' },
  ],
};

export default function AdminCategoriesPage() {
  return <CrudPage config={config} />;
}
