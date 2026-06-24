import CustomOrdersTableWrapper from '@/features/products/components/CustomOrdersTableWrapper';
import { CustomOrderStatsClient } from '@/features/products/components/CustomOrderStatsClient';
import { PaypalSummaryClient } from '@/features/products/components/PaypalSummaryClient';
import {
  getAllCustomOrdersForDashboard,
  getCustomOrderStats,
  getPaypalSummary,
} from '@/lib/apis/protected/customOrders';

export default async function CustomOrdersPage({ searchParams }) {
  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const status = params?.status || 'all';
  const perPage = 20;

  const [{ orders, pagination }, { stats }, { summary }] = await Promise.all([
    getAllCustomOrdersForDashboard(search, page, perPage, status),
    getCustomOrderStats(),
    getPaypalSummary(),
  ]);

  const columns = [
    { name: 'FILE', uid: 'preview' },
    { name: 'ORDER NUMBER', uid: 'orderNumber' },
    { name: 'CUSTOMER', uid: 'name' },
    { name: 'ORIGIN', uid: 'origin' },
    { name: 'SIZE', uid: 'size' },
    { name: 'FORMAT', uid: 'fileFormat' },
    { name: 'TURNAROUND', uid: 'turnaround' },
    { name: 'PREFERRED BUDGET', uid: 'preferredBudget' },
    { name: 'STATUS', uid: 'status' },
    { name: 'CREATED AT', uid: 'createdAt' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='space-y-10'>
      <CustomOrderStatsClient stats={stats} />
      <PaypalSummaryClient summary={summary} />
      <CustomOrdersTableWrapper
        initialData={orders}
        pagination={pagination}
        columns={columns}
      />
    </div>
  );
}
