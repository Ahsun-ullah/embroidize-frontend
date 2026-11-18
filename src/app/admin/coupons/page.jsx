import { FinanceGate } from '@/features/admin/FinanceGate';
import { FinanceUnlockedBar } from '@/features/admin/FinanceUnlockedBar';
import CouponReport from '@/features/users/CouponReport';
import { checkFinanceUnlocked } from '@/lib/apis/protected/financeAuth';
import { getCouponReport } from '@/lib/apis/protected/subscriptions';

export const dynamic = 'force-dynamic';

export default async function CouponsPage({ searchParams }) {
  if (!(await checkFinanceUnlocked())) {
    return <FinanceGate title='Coupons & Offers' />;
  }

  const params = await searchParams;
  const from = typeof params?.from === 'string' ? params.from : '';
  const to = typeof params?.to === 'string' ? params.to : '';
  const report = await getCouponReport({ from, to });

  return (
    <div className='space-y-6'>
      <FinanceUnlockedBar />
      <CouponReport report={report} from={from} to={to} />
    </div>
  );
}
