'use client';

import PaymentHelpForm from '@/components/Common/PaymentHelpForm';
import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Modal wrapper around PaymentHelpForm, used on /subscriptions.
//
// The form itself lives in PaymentHelpForm so the standalone /payment-help page
// (the shareable link) renders exactly the same thing — one implementation, one
// place to change behaviour.
//
// The trigger for this modal is ALWAYS visible on the pricing page, not shown
// only "after a failure": a card decline happens on the gateway's own hosted
// checkout, so this site is never told it occurred. Most declined customers just
// close the tab, and a purely conditional link would never reach them.
// ─────────────────────────────────────────────────────────────────────────────
export default function PaymentHelpModal({
  plans = [],
  onClose,
  // Which ask to open on: the credits offer links here already in credit mode
  // rather than dropping people on a plan picker they didn't want.
  initialType = 'subscription',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='pay-help-title'
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl outline-none'
      >
        <div className='mb-5 flex items-start justify-between gap-4'>
          <div>
            <h2 id='pay-help-title' className='text-xl font-bold text-black'>
              {initialType === 'credits' ? 'Request download credits' : 'Other ways to pay'}
            </h2>
            <p className='mt-1 text-sm leading-relaxed text-gray-600'>
              {initialType === 'credits'
                ? "Tell us how many credits you need and how you'd like to pay. We'll send you payment details and add them as soon as it arrives."
                : "Card not working, or you'd rather not use one? We can take your payment directly and set your account up by hand."}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label='Close'
            className='rounded-lg px-2 text-2xl leading-none text-gray-400 hover:text-gray-700'
          >
            ×
          </button>
        </div>

        <PaymentHelpForm plans={plans} initialType={initialType} />
      </div>
    </div>
  );
}
