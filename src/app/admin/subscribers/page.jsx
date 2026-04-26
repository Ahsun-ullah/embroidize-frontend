import SubscribersTableWrapper from '@/features/users/SubscribersTableWrapper';
import { getRevenueStats, getSubscribedUsers } from '@/lib/apis/protected/subscriptions';

export default async function SubscribersPage() {
  const [subscribers, revenue] = await Promise.all([
    getSubscribedUsers(),
    getRevenueStats(),
  ]);

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((u) => u.subscription?.status === 'active').length,
    canceled: subscribers.filter((u) => u.subscription?.status === 'canceled').length,
    pastDue: subscribers.filter((u) => u.subscription?.status === 'past_due').length,
    trialing: subscribers.filter((u) => u.subscription?.status === 'trialing').length,
    expired: subscribers.filter((u) => u.subscription?.status === 'expired').length,
  };

  return (
    <div className='space-y-6'>
      <SubscribersTableWrapper subscribers={subscribers} stats={stats} revenue={revenue} />
    </div>
  );
}
