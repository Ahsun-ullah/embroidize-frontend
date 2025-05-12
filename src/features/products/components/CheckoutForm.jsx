'use client';

import LoadingSpinner from '@/components/Common/LoadingSpinner';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { Button, Input } from '@heroui/react';

export default function CheckoutForm({
  clientSecret,
  productName,
  priceCents,
  onSuccess,
  onCancel,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplying, setPromoApplying] = useState(false);

  // If you want to support coupons, implement this to call your backend
  // and update the PaymentIntent, returning a fresh clientSecret.
  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoApplying(true);
    try {
      const res = await fetch('/api/payments/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: clientSecret,
          coupon: promoCode,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Invalid promo code');
      // setClientSecret(json.clientSecret);
    } catch (err) {
      ErrorToast('Coupon Error', err.message, 3000);
    } finally {
      setPromoApplying(false);
    }
  };

  const formattedPrice = (priceCents / 100).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setErrorMsg(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMsg(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      SuccessToast('Success', 'Your Payment Is Successful', 3000);
      onSuccess();
    }
  };

  if (!stripe || !elements) {
    return <p>Loading payment form…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Order Summary */}
      <div className='border-b pb-2'>
        <p className='text-lg font-semibold'>{productName}</p>
        <p className='text-gray-600'>${formattedPrice}</p>
      </div>

      {/* Promo Code */}
      <div className='flex gap-2'>
        <Input
          placeholder='Promo code'
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          disabled={promoApplying || processing}
        />
        <Button
          onClick={applyPromo}
          disabled={promoApplying || processing || !promoCode.trim()}
        >
          {promoApplying ? <LoadingSpinner /> : 'Apply'}
        </Button>
      </div>

      {/* Payment Element */}
      <div className='p-3 border rounded-md'>
        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMsg && <p className='text-red-600'>{errorMsg}</p>}

      {/* Actions */}
      <div className='flex justify-end gap-2'>
        <Button variant='flat' onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
        <Button type='submit' disabled={processing}>
          {processing ? <LoadingSpinner /> : `Pay $${formattedPrice}`}
        </Button>
      </div>
    </form>
  );
}
