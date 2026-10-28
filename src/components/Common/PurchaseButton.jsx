'use client';
import { startSubscriptionCheckout } from '@/lib/subscriptions/startCheckout';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function PurchaseButton({
  plan,
  isPopular,
  isActivePlan,
  ctaTitle,
  checkoutMessage,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pathName = usePathname();

  // The backend decides purchasability (a gateway is live AND this plan is
  // mapped to it). Fall back to the legacy "has a stripe price" check for older
  // API responses that don't include the flag.
  const isUnavailable =
    plan.purchasable === false ||
    (plan.purchasable == null && !plan.stripePriceId);

  const handlePurchase = async () => {
    // Set once we're leaving the page — the spinner stays on through the short
    // tracking wait so the button can't start a second checkout.
    let leaving = false;

    try {
      setIsLoading(true);
      setError(null);
      await startSubscriptionCheckout(plan, pathName);
      leaving = true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
      console.error('Checkout error:', err);
    } finally {
      if (!leaving) setIsLoading(false);
    }
  };

  // Active plan state — disabled button with checkmark
  if (isActivePlan === true) {
    return (
      <button
        disabled
        className='w-full py-3.5 px-4 rounded-xl bg-green-500 text-white cursor-not-allowed flex flex-col items-center justify-center gap-0.5'
      >
        <span className='font-semibold text-sm flex items-center gap-2'>
          <span className='text-white'>✓</span>
          Active Plan
        </span>
        <span className='text-xs text-green-100'>You are subscribed</span>
      </button>
    );
  }

  // Payments unavailable (gateway off, or plan not mapped to the active gateway)
  // — show the admin-configured message + a Contact CTA instead of a dead button.
  if (isUnavailable) {
    return (
      <div className='w-full'>
        <div className='w-full py-3.5 px-4 rounded-xl bg-gray-100 text-gray-600 text-center text-sm font-medium'>
          {checkoutMessage || 'Subscriptions are temporarily unavailable.'}
        </div>
        <a
          href='mailto:support@embroidize.com?subject=Subscription enquiry'
          className='w-full mt-2 inline-flex items-center justify-center py-3 px-4 rounded-xl bg-black text-white hover:bg-gray-900 transition-all duration-200 font-semibold text-sm'
        >
          Contact us
        </a>
      </div>
    );
  }

  // Normal subscribe button. Only the popular plan gets the filled button —
  // every other CTA on the page is outlined, so there is exactly one solid
  // black target and the eye lands on the plan we want chosen.
  return (
    <div>
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className={`w-full py-5 px-4 rounded-xl active:scale-[0.99] transition-all duration-200 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 ${
          isPopular
            ? 'bg-black text-white hover:bg-gray-900 disabled:bg-gray-400'
            : 'bg-white text-black border-2 border-black hover:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400'
        }`}
      >
        {isLoading ? (
          <span className='flex items-center justify-center gap-2 py-1'>
            <span
              className={`w-4 h-4 border-2 rounded-full animate-spin border-t-transparent ${
                isPopular ? 'border-white' : 'border-black'
              }`}
            />
            <span className='text-sm font-medium'>Processing...</span>
          </span>
        ) : (
          <>
            <span className='font-semibold text-base leading-tight'>
              {ctaTitle || `Subscribe to ${plan.name}`}
            </span>
          </>
        )}
      </button>

      {error && (
        <p className='text-red-500 text-xs mt-2 text-center'>{error}</p>
      )}
    </div>
  );
}
