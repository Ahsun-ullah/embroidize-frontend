import { FinanceGate } from '@/features/admin/FinanceGate';
import { FinanceUnlockedBar } from '@/features/admin/FinanceUnlockedBar';
import CreditCustomersWrapper from '@/features/users/CreditCustomersWrapper';
import { checkFinanceUnlocked } from '@/lib/apis/protected/financeAuth';
import { getCreditCustomers } from '@/lib/apis/protected/subscriptions';

export const dynamic = 'force-dynamic';

export default async function CreditCustomersPage() {
  if (!(await checkFinanceUnlocked())) {
    return <FinanceGate title='Credit Customers' />;
  }

  const { customers, totals } = await getCreditCustomers();

  return (
    <div className='space-y-6'>
      <FinanceUnlockedBar />
      <CreditCustomersWrapper customers={customers} totals={totals} />
    </div>
  );
}
