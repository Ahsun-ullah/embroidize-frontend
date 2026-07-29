import { FinanceGate } from '@/features/admin/FinanceGate';
import { FinanceUnlockedBar } from '@/features/admin/FinanceUnlockedBar';
import SubscribersTableWrapper from '@/features/users/SubscribersTableWrapper';
import { checkFinanceUnlocked } from '@/lib/apis/protected/financeAuth';
import { getRevenueStats, getSubscribedUsers } from '@/lib/apis/protected/subscriptions';

export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
  if (!(await checkFinanceUnlocked())) {
    return <FinanceGate title='Subscribers' />;
  }

  const [subscribers, revenue] = await Promise.all([
    getSubscribedUsers(),
    getRevenueStats(),
  ]);

  // Stat-card counts and revenue amounts are recomputed client-side from the
  // active filters (see SubscribersTableWrapper), so no server-side stats are
  // passed here — only the raw rows and the all-time revenue figures.
  return (
    <div className='space-y-6'>
      <FinanceUnlockedBar />
      <SubscribersTableWrapper subscribers={subscribers} revenue={revenue} />
    </div>
  );
}
