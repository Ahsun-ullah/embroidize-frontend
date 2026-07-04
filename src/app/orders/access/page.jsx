'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { requestAccessLink } from '@/features/customOrders/ordersApi';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';

// "Email me my orders" — guests request a single-use magic login link (spec §3).
export default function OrdersAccessPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await requestAccessLink(email.trim());
      setSent(true);
    } catch (err) {
      ErrorToast('Error', err.message, 4000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='mx-auto max-w-md px-4 py-16 text-center'>
      <h1 className='mb-2 text-2xl font-bold'>Access your orders</h1>
      {sent ? (
        <div className='rounded-xl border border-zinc-200 bg-zinc-50 p-6'>
          <p className='text-sm text-zinc-700'>
            If any orders exist for <span className='font-semibold'>{email}</span>,
            a secure access link is on its way. It&apos;s valid for 30 minutes —
            check your inbox and spam folder.
          </p>
        </div>
      ) : (
        <>
          <p className='mb-8 text-sm text-zinc-600'>
            Enter the email you used when placing your custom order and
            we&apos;ll send you a secure link to view your orders and downloads
            — no password needed.
          </p>
          <form onSubmit={submit} className='flex gap-2'>
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              className='w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-black focus:outline-none'
            />
            <Button type='submit' isLoading={busy} className='bg-black text-white'>
              Send link
            </Button>
          </form>
          <p className='mt-6 text-xs text-zinc-500'>
            Have an account?{' '}
            <Link href='/auth/login' className='underline'>
              Log in
            </Link>{' '}
            to see your orders instantly.
          </p>
        </>
      )}
    </div>
  );
}
