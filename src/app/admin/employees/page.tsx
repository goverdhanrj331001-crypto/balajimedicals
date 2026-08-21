'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Employee } from '@/types';

const columns: Column<Employee>[] = [
  {
    key: 'name',
    label: 'Employee',
    render: (e) => (
      <div>
        <p className="font-bold">{e.name}</p>
        <p className="text-[10px] text-[#6e797b]">{e.email}</p>
      </div>
    ),
  },
  { key: 'department', label: 'Department', render: (e) => <span>{e.department}</span> },
  { key: 'phone', label: 'Phone', render: (e) => <span>{e.phone ?? '—'}</span> },
  { key: 'status', label: 'Status', render: (e) => <StatusPill value={e.status === 'active' ? 'Active' : e.status === 'pending' ? 'Pending' : 'Inactive'} /> },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Full Name', type: 'text', wide: true, placeholder: 'Sarah Jenkins' },
  { name: 'email', label: 'Email', type: 'text', placeholder: 'sarah@example.com' },
  { name: 'phone', label: 'Phone', type: 'text', placeholder: '+1 555-0200' },
  {
    name: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { value: 'Pharmacists', label: 'Pharmacists' },
      { value: 'Lab Technicians', label: 'Lab Technicians' },
      { value: 'Delivery Partners', label: 'Delivery Partners' },
      { value: 'Admin', label: 'Admin' },
    ],
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  { name: 'joinedAt', label: 'Join Date', type: 'text', placeholder: '2024-01-12' },
];

const config: CrudPageConfig<Employee> = {
  title: 'Employee Management',
  description: 'Manage the teams that keep Balaji Medical Store running — pharmacists, lab techs, delivery partners, and admin staff.',
  endpoint: '/api/admin/employees',
  columns,
  fields,
  searchKeys: ['name', 'email', 'department'],
  makeDefault: () => ({
    name: '',
    email: '',
    phone: '',
    department: 'Pharmacists',
    status: 'active',
    joinedAt: new Date().toISOString().slice(0, 10),
  }),
  stats: (items) => [
    { label: 'Total Employees', value: items.length, icon: 'badge', tone: 'teal' },
    { label: 'Active', value: items.filter((i) => i.status === 'active').length, icon: 'check_circle', tone: 'blue' },
    { label: 'Pending', value: items.filter((i) => i.status === 'pending').length, icon: 'pending', tone: 'gold' },
  ],
};

export default function AdminEmployeesPage() {
  return <CrudPage config={config} />;
}
