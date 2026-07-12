import { FinanceGate } from '@/features/admin/FinanceGate';
import { FinanceUnlockedBar } from '@/features/admin/FinanceUnlockedBar';
import CustomOrdersTableWrapper from '@/features/products/components/CustomOrdersTableWrapper';
import { CustomOrderStatsClient } from '@/features/products/components/CustomOrderStatsClient';
import { PaypalSummaryClient } from '@/features/products/components/PaypalSummaryClient';
import { checkFinanceUnlocked } from '@/lib/apis/protected/financeAuth';
import {
  getAllCustomOrdersForDashboard,
  getCustomOrderStats,
  getPaypalSummary,
} from '@/lib/apis/protected/customOrders';

export const dynamic = 'force-dynamic';

export default async function CustomOrdersPage({ searchParams }) {
  if (!(await checkFinanceUnlocked())) {
    return <FinanceGate title='Custom Orders' />;
  }

  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const status = params?.status || 'all';
  const paymentTag = params?.paymentTag || 'all';
  const needsAction = params?.needsAction === '1';
  const perPage = 20;

  const [{ orders, pagination }, { stats }, { summary }] = await Promise.all([
    getAllCustomOrdersForDashboard(
      search,
      page,
      perPage,
      status,
      'createdAt',
      'desc',
      paymentTag,
      needsAction,
    ),
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
    { name: 'PAID', uid: 'amountPaid' },
    { name: 'ETA', uid: 'estimatedDelivery' },
    { name: 'STATUS', uid: 'status' },
    { name: 'CREATED AT', uid: 'createdAt' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='space-y-10'>
      <FinanceUnlockedBar />
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
