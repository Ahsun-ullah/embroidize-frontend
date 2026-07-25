import { FinanceGate } from '@/features/admin/FinanceGate';
import { FinanceUnlockedBar } from '@/features/admin/FinanceUnlockedBar';
import CreemConfigWrapper from '@/features/settings/CreemConfigWrapper';
import { checkFinanceUnlocked } from '@/lib/apis/protected/financeAuth';
import { getPaymentGatewaySettings, getCreemSettings } from '@/lib/apis/protected/creemConfig';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Payment Gateway (Creem)',
};

export default async function CreemSettingsPage() {
  if (!(await checkFinanceUnlocked())) {
    return <FinanceGate title='Payment Gateway' />;
  }

  const [settings, gatewaySettings] = await Promise.all([
    getCreemSettings(),
    getPaymentGatewaySettings(),
  ]);

  return (
    <div className='space-y-6'>
      <FinanceUnlockedBar />
      <CreemConfigWrapper
        settings={settings}
        activeGateway={gatewaySettings.activePaymentGateway}
        checkoutDisabledMessage={gatewaySettings.checkoutDisabledMessage}
      />
    </div>
  );
}
