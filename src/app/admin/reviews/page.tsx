'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Review } from '@/types';

const columns: Column<Review>[] = [
  {
    key: 'productName',
    label: 'Product',
    render: (r) => (
      <div className="max-w-[200px]">
        <p className="truncate text-[12px] font-bold">{r.productName}</p>
        <p className="text-[10px] text-[#6e797b]">#{r.productId.slice(0, 12)}</p>
      </div>
    ),
  },
  {
    key: 'userName',
    label: 'Customer',
    render: (r) => (
      <div>
        <p className="text-[12px] font-bold">{r.userName}</p>
        <p className="text-[10px] text-[#6e797b]">{r.userEmail}</p>
      </div>
    ),
  },
  {
    key: 'rating',
    label: 'Rating',
    render: (r) => (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`material-symbols-outlined text-[14px] ${s <= r.rating ? 'text-[#ffc107]' : 'text-[#bdc9ca]'}`}
            style={{ fontVariationSettings: s <= r.rating ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        ))}
      </div>
    ),
  },
  {
    key: 'title',
    label: 'Review',
    render: (r) => (
      <div className="max-w-[250px]">
        <p className="text-[12px] font-bold">{r.title}</p>
        <p className="truncate text-[11px] text-[#3e494a]">{r.comment}</p>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (r) => <StatusPill value={r.status === 'approved' ? 'Active' : r.status === 'pending' ? 'Pending' : 'Cancelled'} />,
  },
];

const fields: FieldDef[] = [
  { name: 'productName', label: 'Product Name', type: 'text', wide: true, placeholder: 'Product name' },
  { name: 'productId', label: 'Product ID', type: 'text', placeholder: 'Product ID' },
  { name: 'userName', label: 'Customer Name', type: 'text', placeholder: 'John Doe' },
  { name: 'rating', label: 'Rating (1-5)', type: 'number', placeholder: '5' },
  { name: 'title', label: 'Review Title', type: 'text', wide: true, placeholder: 'Great product!' },
  { name: 'comment', label: 'Review Comment', type: 'textarea', wide: true, placeholder: 'Detailed review...' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'approved', label: 'Approved' },
      { value: 'pending', label: 'Pending' },
      { value: 'rejected', label: 'Rejected' },
    ],
  },
];

const config: CrudPageConfig<Review> = {
  title: 'Reviews',
  description: 'Manage customer product reviews. Approve, reject, edit, or delete reviews.',
  endpoint: '/api/admin/reviews',
  columns,
  fields,
  searchKeys: ['productName', 'userName', 'title', 'comment'],
  makeDefault: () => ({
    productId: '',
    productName: '',
    userId: 'admin',
    userName: 'Admin',
    userEmail: '',
    orderId: '',
    rating: 5,
    title: '',
    comment: '',
    status: 'approved',
  }),
  stats: (items) => [
    { label: 'Total Reviews', value: items.length, icon: 'reviews', tone: 'teal' },
    { label: 'Approved', value: items.filter((i) => i.status === 'approved').length, icon: 'check_circle', tone: 'blue' },
    { label: 'Pending', value: items.filter((i) => i.status === 'pending').length, icon: 'pending', tone: 'gold' },
    { label: 'Avg Rating', value: items.length > 0 ? (items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1) : '—', icon: 'star', tone: 'red' },
  ],
};

export default function AdminReviewsPage() {
  return <CrudPage config={config} />;
}
