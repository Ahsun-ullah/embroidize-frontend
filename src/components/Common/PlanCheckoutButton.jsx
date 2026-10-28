'use client';

import { startSubscriptionCheckout } from '@/lib/subscriptions/startCheckout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * A landing-page plan button that goes straight to the gateway's checkout for
 * `plan` (logging in first if needed) and fires the `subscription_checkout`
 * GTM event on the way, the same as the /subscriptions page's PurchaseButton.
 *
 * Falls back to a plain link to /subscriptions when there is no plan to buy
 * (the API could not be read, or the plan isn't sold on the live gateway), and
 * sends the visitor there if the checkout cannot be created — that page shows
 * an active plan and the other ways to pay.
 */
export default function PlanCheckoutButton({ plan, className, children }) {
  const [busy, setBusy] = useState(false);
  const pathName = usePathname();

  // Same purchasability rule as PurchaseButton.
  const purchasable =
    plan &&
    !(
      plan.purchasable === false ||
      (plan.purchasable == null && !plan.stripePriceId)
    );

  if (!purchasable) {
    return (
      <Link className={className} href='/subscriptions'>
        {children}
      </Link>
    );
  }

  const handleClick = async () => {
    setBusy(true);
    try {
      await startSubscriptionCheckout(plan, pathName);
      // Leaving the page — keep the button disabled until it goes.
    } catch (err) {
      console.error('Checkout error:', err);
      window.location.href = '/subscriptions';
    }
  };

  return (
    <button
      type='button'
      className={className}
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy}
    >
      {children}
    </button>
  );
}
