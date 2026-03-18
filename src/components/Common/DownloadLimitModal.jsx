import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

 function DownloadLimitModal({ limitModalData, onClose, formatDuration }) {
  const router = useRouter();

  // FIX #3: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // FIX #4: Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    // FIX #1: Backdrop click closes modal
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
      onClick={onClose}
    >
      {/* FIX #1: Stop propagation so clicks inside card don't close modal */}
      <div
        className='relative bg-white rounded-2xl p-8 max-w-lg w-full mx-4 text-center shadow-xl animate-fadeIn'
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIX #2: Close (×) button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-lg leading-none'
          aria-label='Close'
        >
          ✕
        </button>

        {/* Icon */}
        <div className='mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl'>
          ⛔
        </div>

        {/* Title */}
        <h2 className='text-2xl font-semibold mb-2'>Download Limit Reached</h2>

        {/* Dynamic Message */}
        <p className='text-gray-600 mb-4'>
          {limitModalData.type === 'period' && (
            <>
              You've used all <b>{limitModalData.count}</b> downloads for this
              billing period.
              <br />
              <span className='text-sm text-gray-500'>
                Upgrade to continue downloading instantly.
              </span>
            </>
          )}

          {limitModalData.type === 'daily' && (
            <>
              You've reached your daily limit of <b>{limitModalData.count}</b>{' '}
              downloads.
              <br />
              <span className='text-sm text-gray-500'>
                Upgrade for higher daily limits and unlimited access.
              </span>
            </>
          )}

          {limitModalData.type === 'free' && (
            <>
              Free plan limit reached ({limitModalData.count} downloads /{' '}
              {formatDuration(limitModalData.duration)}).
              <br />
              <span className='text-sm text-gray-500'>
                Unlock unlimited downloads with a premium plan.
              </span>
            </>
          )}
        </p>

        {/* Value Proposition */}
        <div className='bg-gray-50 rounded-lg p-4 mb-5 text-left text-sm text-gray-700'>
          <ul className='space-y-1'>
            <li>✅ Unlimited or higher download limits</li>
            <li>⚡ Faster access to all premium designs</li>
            <li>📁 All formats included (PES, DST, EXP, etc.)</li>
            <li>🚫 No waiting or restrictions</li>
          </ul>
        </div>

        {/* FIX #6: All CTA buttons in one consistent group */}
        <div className='flex gap-3 justify-center'>
          <button
            className='bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition'
            onClick={() => {
              onClose();
              router.push('/subscriptions');
            }}
          >
            Upgrade Now 🚀
          </button>

          <button
            className='border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100 transition'
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>

        {/* FIX #5 + #6: My Plan as full-width styled link, separated below CTAs */}
        <div className='mt-3'>
          <Link
            href='/user/my-plan'
            prefetch={false}
            onClick={onClose}
            className='inline-flex items-center justify-center w-full border border-gray-200 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-50 transition text-sm'
          >
            View My Plan
          </Link>
        </div>

        {/* FIX #7: Show reset hint for ALL types, not just non-period */}
        <p className='text-xs text-gray-400 mt-4'>
          Limits reset automatically based on your plan.
        </p>
      </div>
    </div>
  );
}

export default DownloadLimitModal;