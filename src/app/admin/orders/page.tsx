import { OrdersAdminPage } from '@/components/admin/orders-page';

export default function AdminOrdersPage() {
  return <OrdersAdminPage typeFilter="all" title="Orders Overview" description="Review and process all customer orders across medicines and lab tests." />;
}
