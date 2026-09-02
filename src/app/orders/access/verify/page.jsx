'use client';

import {
  ORDER_SESSION_COOKIE,
  verifyAccessToken,
} from '@/features/customOrders/ordersApi';
import { Button, Spinner } from '@heroui/react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

// Consumes a single-use magic-link token, stores the guest order session, and
// redirects to My Orders (or the deep-linked order page). Spec §3/§5.
function VerifyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState('verifying'); // verifying | failed
  const ranRef = useRef(false);

  useEffect(() => {
    // Tokens are single-use — guard against React double-invoking the effect.
    if (ranRef.current) return;
    ranRef.current = true;

    const token = searchParams.get('token');
    const orderId = searchParams.get('orderId');
    if (!token) {
      setState('failed');
      return;
    }

    (async () => {
      try {
        const data = await verifyAccessToken(token);
        Cookies.set(ORDER_SESSION_COOKIE, data.sessionToken, {
          expires: 30,
          sameSite: 'Lax',
          secure: window.location.protocol === 'https:',
        });
        router.replace(
          data.orderId || orderId
            ? `/custom-order-checkout/${data.orderId || orderId}`
            : '/orders',
        );
      } catch {
        setState('failed');
      }
    })();
  }, [searchParams, router]);

  if (state === 'failed') {
    return (
      <div className='mx-auto max-w-md px-4 py-16 text-center'>
        <h1 className='mb-2 text-2xl font-bold'>Link expired</h1>
        <p className='mb-6 text-sm text-zinc-600'>
          This access link is invalid, expired, or was already used. Request a
          fresh one — it only takes a second.
        </p>
        <Button as={Link} href='/orders/access' className='bg-black text-white'>
          Get a new link
        </Button>
      </div>
    );
  }

  return (
    <div className='flex min-h-[50vh] items-center justify-center'>
      <Spinner color='default' label='Signing you in…' />
    </div>
  );
}

export default function OrdersAccessVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-[50vh] items-center justify-center'>
          <Spinner color='default' />
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
