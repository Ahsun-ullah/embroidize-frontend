'use client';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function PurchaseButton({
  plan,
  isPopular,
  isActivePlan,
  ctaTitle,
  ctaSubtitle,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pathName = usePathname();

  const priceId = plan.stripePriceId;
  const endpoint = '/subscriptions/create-checkout-session';
  const isUnavailable = !priceId;

  const handlePurchase = async () => {
    const token = Cookies.get('token');

    if (!token) {
      window.location.href = `/auth/login?pathName=${pathName}`;
      return;
    }

    if (isUnavailable) {
      setError('This plan is not available right now. Please try again later.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priceId }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to create checkout session',
        );
      }

      const data = await response.json();
      const checkoutSessionUrl = data.data.url;

      if (checkoutSessionUrl) {
        window.location.href = checkoutSessionUrl;
      } else {
        throw new Error('No checkout session URL received from backend.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
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

  // Normal subscribe button
  return (
    <div>
      <button
        onClick={handlePurchase}
        disabled={isLoading || isUnavailable}
        className='w-full py-5 px-4 rounded-xl bg-black text-white hover:bg-gray-900 active:scale-[0.99] transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5'
      >
        {isLoading ? (
          <span className='flex items-center justify-center gap-2 py-1'>
            <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            <span className='text-sm font-medium'>Processing...</span>
          </span>
        ) : (
          <>
            <span className='font-semibold text-base leading-tight'>
              {isUnavailable
                ? 'Not available'
                : ctaTitle || `Subscribe to ${plan.name}`}
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
