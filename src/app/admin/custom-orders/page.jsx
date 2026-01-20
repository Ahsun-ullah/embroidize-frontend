import CustomOrdersTableWrapper from '@/features/products/components/CustomOrdersTableWrapper';
import { CustomOrderStatsClient } from '@/features/products/components/CustomOrderStatsClient';
import {
  getAllCustomOrdersForDashboard,
  getCustomOrderStats,
} from '@/lib/apis/protected/customOrders';

export default async function CustomOrdersPage({ searchParams }) {
  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const status = params?.status || 'all';
  const perPage = 20;

  const [{ orders, pagination }, { stats }] = await Promise.all([
    getAllCustomOrdersForDashboard(search, page, perPage, status),
    getCustomOrderStats(),
  ]);

  const columns = [
    { name: 'ORDER NUMBER', uid: 'orderNumber' },
    { name: 'CUSTOMER', uid: 'name' },
    { name: 'SIZE', uid: 'size' },
    { name: 'FORMAT', uid: 'fileFormat' },
    { name: 'TURNAROUND', uid: 'turnaround' },
    { name: 'COMPLEXITY', uid: 'complexity' },
    { name: 'STATUS', uid: 'status' },
    { name: 'CREATED AT', uid: 'createdAt' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='space-y-10'>
      <CustomOrderStatsClient stats={stats} />
      <CustomOrdersTableWrapper
        initialData={orders}
        pagination={pagination}
        columns={columns}
      />
    </div>
  );
}
