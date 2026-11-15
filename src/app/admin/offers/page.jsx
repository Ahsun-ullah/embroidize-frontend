import OffersAdmin from '@/features/offers/OffersAdmin';
import { getSubscriptionPlans } from '@/lib/apis/public/subscriptionPlans';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Offers & Campaigns',
};

// The list itself is fetched in the browser (it refreshes after every save);
// the plans are the sellable ones the offer can be attached to.
export default async function OffersPage() {
  const plans = await getSubscriptionPlans();
  return (
    <div className='space-y-6'>
      <OffersAdmin plans={plans.filter((p) => p.type === 'recurring' || p.billingInterval)} />
    </div>
  );
}
