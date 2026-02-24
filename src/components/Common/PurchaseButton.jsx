'use client';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function PurchaseButton({
  plan,
  isPopular = false,
  isActivePlan = false, // ✅ Added
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pathName = usePathname();

  const handlePurchase = async () => {
    const token = Cookies.get('token');

    if (!token) {
      window.location.href = `/auth/login?pathName=${pathName}`;
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/subscriptions/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priceId: plan.stripePriceId }),
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

  // ✅ Active plan state — disabled button with checkmark
  if (isActivePlan) {
    return (
      <button
        disabled
        className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2 ${
          isPopular
            ? 'bg-white/20 text-white border border-white/40'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}
      >
        <span className={isPopular ? 'text-white' : 'text-green-500'}>✓</span>
        Active Plan
      </button>
    );
  }

  // ✅ Normal subscribe button
  return (
    <div>
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
          isPopular
            ? 'bg-white text-black hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400'
            : 'bg-black text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500'
        }`}
      >
        {isLoading ? (
          <span className='flex items-center justify-center gap-2'>
            <span
              className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                isPopular ? 'border-black' : 'border-white'
              }`}
            />
            Processing...
          </span>
        ) : (
          `Subscribe to ${plan.name}`
        )}
      </button>

      {error && (
        <p className='text-red-400 text-xs mt-2 text-center'>{error}</p>
      )}
    </div>
  );
}
