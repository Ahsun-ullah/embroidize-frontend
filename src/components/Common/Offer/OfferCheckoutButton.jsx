'use client';

import { startSubscriptionCheckout } from '@/lib/subscriptions/startCheckout';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * Buys the plan THROUGH an offer: the backend checks the offer's dates, applies
 * its discount code and the webhook grants its add-ons. Logged-out visitors go
 * to login and come back to this page.
 *
 * GTM's subscription_checkout is reported at the price actually charged today.
 */
export default function OfferCheckoutButton({ offer, source, className, children }) {
  const pathName = usePathname();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setBusy(true);
    setError('');
    try {
      const plan = {
        _id: offer.plan._id,
        name: `${offer.plan.name} (${offer.name})`,
        price: offer.offerPriceCents / 100,
      };
      const result = await startSubscriptionCheckout(plan, pathName, source, {
        offer: offer.slug,
      });
      if (result === 'login') return;
    } catch (err) {
      setError(err?.message || 'Could not start the checkout. Please try again.');
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type='button'
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
        className={`${className || ''} disabled:cursor-wait disabled:opacity-80`}
      >
        {busy ? 'Opening checkout…' : children}
      </button>
      {error && (
        <p role='alert' className='mt-2 text-center text-sm font-medium text-red-600'>
          {error}
        </p>
      )}
    </>
  );
}
