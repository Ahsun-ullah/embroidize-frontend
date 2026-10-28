import PlanCheckoutButton from '@/components/Common/PlanCheckoutButton';
import { getLandingPlans } from '@/lib/apis/public/subscriptionPlans';
import { planTerm } from '@/lib/subscriptions/planPricing';
import Link from 'next/link';
import { Suspense } from 'react';

async function TermButton({ term, className, children }) {
  const plans = await getLandingPlans();
  const plan = plans.find((p) => planTerm(p) === term);

  return (
    <PlanCheckoutButton plan={plan} className={className}>
      {children}
    </PlanCheckoutButton>
  );
}

/**
 * A landing-page CTA for one billing term ('month', 'year', …) that sits
 * outside the plan cards — e.g. "Choose Yearly" or the final "Start Monthly".
 * It checks out that term's live plan directly; until the plans have loaded,
 * and whenever there is no such plan, it is the old link to /subscriptions.
 */
export default function PlanTermCta({ term, className, children }) {
  return (
    <Suspense
      fallback={
        <Link className={className} href='/subscriptions'>
          {children}
        </Link>
      }
    >
      <TermButton term={term} className={className}>
        {children}
      </TermButton>
    </Suspense>
  );
}
