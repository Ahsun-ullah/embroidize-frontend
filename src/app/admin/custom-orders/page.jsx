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
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

// The three panels on this page are fetched independently and streamed, so the
// table no longer waits on the stats + PayPal summary endpoints (both of which
// sweep the whole CustomOrder collection). Awaiting them together in one
// Promise.all meant a refresh showed nothing until the SLOWEST of the three
// finished, even though the table needs none of their data.
async function OrdersSection({ params, needsActionPromise }) {
  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const status = params?.status || 'all';
  const paymentTag = params?.paymentTag || 'all';
  const needsAction = params?.needsAction === '1';

  const { orders, pagination } = await getAllCustomOrdersForDashboard(
    search,
    page,
    20,
    status,
    'createdAt',
    'desc',
    paymentTag,
    needsAction,
  );

  return (
    <CustomOrdersTableWrapper
      initialData={orders}
      pagination={pagination}
      needsActionPromise={needsActionPromise}
    />
  );
}

async function StatsSection({ statsPromise }) {
  const { stats } = await statsPromise;
  return <CustomOrderStatsClient stats={stats} />;
}

async function PaypalSection() {
  const { summary } = await getPaypalSummary();
  return <PaypalSummaryClient summary={summary} />;
}

function StatsSkeleton() {
  return (
    <div className='space-y-4 animate-pulse'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='h-24 rounded-xl border border-gray-200 bg-gray-100'
          />
        ))}
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className='h-16 rounded-xl border border-gray-200 bg-gray-100'
          />
        ))}
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className='h-28 rounded-xl border border-gray-200 bg-gray-100 animate-pulse' />
  );
}

// Mirrors the real table's card + toolbar so the swap from skeleton to rows
// doesn't shift the layout.
function TableSkeleton() {
  return (
    <div className='animate-pulse rounded-2xl border border-gray-200 bg-white'>
      <div className='flex flex-wrap items-center gap-2 border-b border-gray-100 p-3'>
        <div className='h-8 min-w-[200px] flex-1 rounded-md bg-gray-100' />
        <div className='h-8 w-32 rounded-md bg-gray-100' />
        <div className='h-8 w-24 rounded-md bg-gray-100' />
        <div className='h-8 w-28 rounded-md bg-gray-100' />
      </div>
      {Array.from({ length: 8 }).map((_, r) => (
        <div
          key={r}
          className='flex items-center gap-4 border-b border-gray-50 px-3 py-3 last:border-b-0'
        >
          <div className='h-10 w-10 shrink-0 rounded-lg bg-gray-100' />
          <div className='h-3.5 w-24 rounded bg-gray-100' />
          <div className='h-3.5 w-40 rounded bg-gray-100' />
          <div className='h-3.5 w-32 rounded bg-gray-100' />
          <div className='h-3.5 w-20 rounded bg-gray-100' />
          <div className='ml-auto h-5 w-24 rounded bg-gray-100' />
        </div>
      ))}
    </div>
  );
}

export default async function CustomOrdersPage({ searchParams }) {
  if (!(await checkFinanceUnlocked())) {
    return <FinanceGate title='Custom Orders' />;
  }

  const params = await searchParams;

  // Started, deliberately NOT awaited. The stats panel awaits it; the table
  // only needs the needs-action badge count out of it, which it resolves in its
  // own Suspense boundary so a slow /stats never holds the rows back.
  const statsPromise = getCustomOrderStats();

  // Re-key the table boundary on the filters so changing a filter shows the
  // skeleton again instead of freezing the previous page's rows.
  const tableKey = `${params?.page || 1}|${params?.search || ''}|${
    params?.status || 'all'
  }|${params?.paymentTag || 'all'}|${params?.needsAction || ''}`;

  return (
    <div className='space-y-10'>
      <FinanceUnlockedBar />
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection statsPromise={statsPromise} />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <PaypalSection />
      </Suspense>
      <Suspense key={tableKey} fallback={<TableSkeleton />}>
        <OrdersSection params={params} needsActionPromise={statsPromise} />
      </Suspense>
    </div>
  );
}
