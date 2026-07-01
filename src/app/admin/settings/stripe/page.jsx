import { FinanceGate } from '@/features/admin/FinanceGate';
import { FinanceUnlockedBar } from '@/features/admin/FinanceUnlockedBar';
import StripeConfigWrapper from '@/features/settings/StripeConfigWrapper';
import { checkFinanceUnlocked } from '@/lib/apis/protected/financeAuth';
import { getStripeSettings } from '@/lib/apis/protected/stripeConfig';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Payment Keys (Stripe)',
};

export default async function StripeSettingsPage() {
  if (!(await checkFinanceUnlocked())) {
    return <FinanceGate title='Payment Keys' />;
  }

  const settings = await getStripeSettings();

  return (
    <div className='space-y-6'>
      <FinanceUnlockedBar />
      <StripeConfigWrapper settings={settings} />
    </div>
  );
}
