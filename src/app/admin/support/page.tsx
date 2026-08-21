'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { SupportTicket } from '@/types';

const columns: Column<SupportTicket>[] = [
  { key: 'id', label: 'Ticket', render: (t) => <span className="font-bold text-[#006872]">{t.id}</span> },
  {
    key: 'customerName',
    label: 'Customer',
    render: (t) => (
      <div>
        <p className="font-bold">{t.customerName}</p>
        <p className="text-[10px] text-[#6e797b]">{t.subject}</p>
      </div>
    ),
  },
  { key: 'priority', label: 'Priority', render: (t) => <StatusPill value={t.priority} /> },
  { key: 'status', label: 'Status', render: (t) => <StatusPill value={t.status} /> },
];

const fields: FieldDef[] = [
  { name: 'id', label: 'Ticket ID', type: 'text', placeholder: 'SUP-2201', hint: 'Leave blank to auto-generate' },
  { name: 'customerName', label: 'Customer Name', type: 'text', placeholder: 'John Doe' },
  { name: 'subject', label: 'Subject', type: 'text', wide: true, placeholder: 'Subject of the ticket' },
  { name: 'message', label: 'Message', type: 'textarea', wide: true },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' },
    ],
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Open', label: 'Open' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Pending', label: 'Pending' },
      { value: 'Closed', label: 'Closed' },
    ],
  },
  { name: 'response', label: 'Response / Notes', type: 'textarea', wide: true },
];

const config: CrudPageConfig<SupportTicket> = {
  title: 'Support Tickets',
  description: 'Resolve patient questions and service issues.',
  endpoint: '/api/admin/support',
  columns,
  fields,
  searchKeys: ['id', 'customerName', 'subject'],
  makeDefault: () => ({
    id: '',
    customerName: '',
    subject: '',
    message: '',
    priority: 'Medium',
    status: 'Open',
    response: '',
  }),
  stats: (items) => [
    { label: 'Total Tickets', value: items.length, icon: 'support_agent', tone: 'teal' },
    { label: 'Open', value: items.filter((i) => i.status === 'Open').length, icon: 'error', tone: 'red' },
    { label: 'In Progress', value: items.filter((i) => i.status === 'In Progress').length, icon: 'pending', tone: 'gold' },
    { label: 'Closed', value: items.filter((i) => i.status === 'Closed').length, icon: 'check_circle', tone: 'blue' },
  ],
};

export default function AdminSupportPage() {
  return <CrudPage config={config} />;
}
