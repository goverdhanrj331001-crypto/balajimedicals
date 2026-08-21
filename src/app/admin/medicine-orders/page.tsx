import { OrdersAdminPage } from '@/components/admin/orders-page';

export default function AdminMedicineOrdersPage() {
  return <OrdersAdminPage typeFilter="medicine" title="Medicine Orders" description="Verify prescriptions and manage medicine fulfillment." />;
}
