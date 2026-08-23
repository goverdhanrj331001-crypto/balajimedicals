'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { User } from '@/types';

const columns: Column<User>[] = [
  {
    key: 'name',
    label: 'User',
    render: (u) => (
      <div>
        <p className="font-bold">{u.name}</p>
        <p className="text-[10px] text-[#6e797b]">{u.email}</p>
      </div>
    ),
  },
  { key: 'role', label: 'Role', render: (u) => <code className="rounded bg-[#f0eded] px-2 py-0.5 text-[11px]">{u.role}</code> },
  { key: 'phone', label: 'Phone', render: (u) => <span>{u.phone ?? '—'}</span> },
  { key: 'status', label: 'Status', render: (u) => <StatusPill value={u.status === 'active' ? 'Active' : u.status === 'blocked' ? 'Blocked' : 'Pending'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Full Name', type: 'text', wide: true, placeholder: 'John Doe' },
  { name: 'email', label: 'Email', type: 'text', placeholder: 'john@example.com' },
  { name: 'phone', label: 'Phone', type: 'text', placeholder: '+91 98765 43210' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'patient', label: 'Patient' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'lab_tech', label: 'Lab Technician' },
      { value: 'admin', label: 'Admin' },
    ],
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'blocked', label: 'Blocked' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  { name: 'address', label: 'Address', type: 'textarea', wide: true },
];

const config: CrudPageConfig<User> = {
  title: 'User Management',
  description: 'Manage patients, doctors, lab technicians, and administrators.',
  endpoint: '/api/admin/users',
  columns,
  fields,
  searchKeys: ['name', 'email', 'phone'],
  makeDefault: () => ({
    name: '',
    email: '',
    role: 'patient',
    status: 'active',
    phone: '',
    address: '',
  }),
  stats: (items) => [
    { label: 'Total Users', value: items.length, icon: 'group', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.status === 'active').length, icon: 'check_circle', tone: 'blue' },
    { label: 'Blocked', value: items.filter((i) => i.status === 'blocked').length, icon: 'block', tone: 'red' },
    { label: 'Pending', value: items.filter((i) => i.status === 'pending').length, icon: 'pending', tone: 'gold' },
  ],
};

export default function AdminUsersPage() {
  return <CrudPage config={config} />;
}
