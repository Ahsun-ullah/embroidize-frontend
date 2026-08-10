'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useExchangePinterestCodeMutation } from '@/lib/redux/admin/pinterest/pinterestSlice';
import { Button } from '@heroui/react';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

// Pinterest redirects the admin's browser here with ?code=. The exchange itself
// runs on the backend behind admin auth — this page only forwards the code, so
// the token swap never sits on an unauthenticated route.
function PinterestCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exchange] = useExchangePinterestCodeMutation();
  const [error, setError] = useState('');

  // React 18 StrictMode mounts effects twice in development; an authorization
  // code is single-use, so the second call would fail and show a false error.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const denied = searchParams.get('error');

    if (denied) {
      setError(
        searchParams.get('error_description') ||
          'Pinterest authorisation was cancelled.',
      );
      return;
    }

    if (!code) {
      setError('Pinterest did not return an authorization code.');
      return;
    }

    exchange({ code, state })
      .unwrap()
      .then(() => {
        SuccessToast('Connected', 'Pinterest account connected.', 3000);
        router.replace('/admin/settings/pinterest');
      })
      .catch((err) => {
        const message =
          err?.data?.message || 'Could not complete the Pinterest connection.';
        setError(message);
        ErrorToast('Connection failed', message, 5000);
      });
  }, [searchParams, exchange, router]);

  if (error) {
    return (
      <div className='max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-6'>
        <p className='flex items-center gap-2 font-semibold text-gray-900'>
          <AlertCircle size={18} /> Connection failed
        </p>
        <p className='text-sm text-gray-600'>{error}</p>
        <Button
          as={Link}
          href='/admin/settings/pinterest'
          className='bg-gray-900 text-white'
        >
          Back to Pinterest settings
        </Button>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3 text-gray-600'>
      <Loader2 size={18} className='animate-spin' />
      <span>Finishing the Pinterest connection…</span>
    </div>
  );
}

export default function PinterestCallbackPage() {
  // useSearchParams opts the page into client-side rendering; without its own
  // Suspense boundary the whole route bails out of prerendering and ships empty
  // HTML.
  return (
    <Suspense
      fallback={
        <div className='flex items-center gap-3 text-gray-600'>
          <Loader2 size={18} className='animate-spin' />
          <span>Loading…</span>
        </div>
      }
    >
      <PinterestCallbackInner />
    </Suspense>
  );
}
