import { FinanceGate } from '@/features/admin/FinanceGate';
import { FinanceUnlockedBar } from '@/features/admin/FinanceUnlockedBar';
import ManualRequestsWrapper from '@/features/settings/ManualRequestsWrapper';
import { checkFinanceUnlocked } from '@/lib/apis/protected/financeAuth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manual Requests',
};

// Finance-gated like Subscribers and Payment Keys — this queue exposes customer
// contact details and leads directly to granting paid access.
export default async function ManualRequestsPage() {
  if (!(await checkFinanceUnlocked())) {
    return <FinanceGate title='Manual Requests' />;
  }

  return (
    <div className='space-y-6'>
      <FinanceUnlockedBar />
      <ManualRequestsWrapper />
    </div>
  );
}
