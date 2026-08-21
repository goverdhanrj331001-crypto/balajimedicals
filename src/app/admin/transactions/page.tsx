'use client';

import { CrudPage, StatusPill, type Column, type FieldDef, type CrudPageConfig } from '@/components/admin/crud-page';
import type { Transaction } from '@/types';

const columns: Column<Transaction>[] = [
  { key: 'id', label: 'Transaction ID', render: (t) => <span className="font-bold text-[#006872]">{t.id}</span> },
  { key: 'orderId', label: 'Order', render: (t) => <span>{t.orderId}</span> },
  { key: 'customerName', label: 'Customer', render: (t) => <span>{t.customerName}</span> },
  { key: 'method', label: 'Payment Method', render: (t) => <span>{t.method}</span> },
  { key: 'amount', label: 'Amount', render: (t) => <span className="font-bold">${Number(t.amount).toFixed(2)}</span> },
  { key: 'status', label: 'Status', render: (t) => <StatusPill value={t.status} /> },
];

const fields: FieldDef[] = [
  { name: 'id', label: 'Transaction ID', type: 'text', placeholder: 'TXN-78421' },
  { name: 'orderId', label: 'Order ID', type: 'text', placeholder: 'MD-8492-X' },
  { name: 'customerName', label: 'Customer Name', type: 'text', placeholder: 'John Doe' },
  { name: 'method', label: 'Payment Method', type: 'text', placeholder: 'Visa •••• 4242' },
  { name: 'amount', label: 'Amount ($)', type: 'number', placeholder: '142.50' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Pending', label: 'Pending' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Refunded', label: 'Refunded' },
      { value: 'Failed', label: 'Failed' },
    ],
  },
];

const config: CrudPageConfig<Transaction> = {
  title: 'Transaction History',
  description: 'Track payments, refunds, and settlement activity.',
  endpoint: '/api/admin/transactions',
  columns,
  fields,
  searchKeys: ['id', 'orderId', 'customerName'],
  makeDefault: () => ({
    id: '',
    orderId: '',
    customerName: '',
    method: 'COD',
    amount: 0,
    status: 'Pending',
  }),
  stats: (items) => [
    { label: 'Total Transactions', value: items.length, icon: 'receipt_long', tone: 'teal' },
    {
      label: 'Revenue',
      value: `$${items.filter((i) => i.status === 'Completed').reduce((s, i) => s + Number(i.amount), 0).toFixed(0)}`,
      icon: 'payments',
      tone: 'blue',
    },
    { label: 'Pending', value: items.filter((i) => i.status === 'Pending').length, icon: 'pending', tone: 'gold' },
    { label: 'Refunded', value: items.filter((i) => i.status === 'Refunded').length, icon: 'undo', tone: 'red' },
  ],
};

export default function AdminTransactionsPage() {
  return <CrudPage config={config} />;
}
