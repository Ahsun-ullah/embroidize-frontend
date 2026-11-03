'use client';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import Link from 'next/link';
import { useState } from 'react';

// One click, not automatic on load: mail scanners open links in emails, and
// an automatic unsubscribe would unsubscribe people who never clicked.
export default function UnsubscribeClient({ token }) {
  const [state, setState] = useState({ phase: token ? 'ready' : 'invalid', message: '' });

  const unsubscribe = async () => {
    setState({ phase: 'working', message: '' });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'This unsubscribe link is not valid.');
      setState({ phase: 'done', message: json?.data?.email || '' });
    } catch (err) {
      setState({ phase: 'error', message: err.message || 'Something went wrong.' });
    }
  };

  return (
    <div className='bg-[#fafafa]'>
      <Header />
      <main className='container flex min-h-[50vh] items-center justify-center py-16'>
        <div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center'>
          {state.phase === 'done' ? (
            <>
              <h1 className='text-2xl font-bold'>You&apos;re unsubscribed</h1>
              <p className='mt-3 text-gray-600'>
                {state.message ? `${state.message} won't` : "You won't"} get offer emails from
                Embroidize any more. Receipts and account emails still arrive. You can turn offers
                back on from your account page.
              </p>
            </>
          ) : state.phase === 'invalid' ? (
            <>
              <h1 className='text-2xl font-bold'>Link not valid</h1>
              <p className='mt-3 text-gray-600'>
                This unsubscribe link is incomplete. You can turn offer emails off from your account
                page instead.
              </p>
            </>
          ) : (
            <>
              <h1 className='text-2xl font-bold'>Unsubscribe from offer emails?</h1>
              <p className='mt-3 text-gray-600'>
                You&apos;ll stop getting new-design and offer emails. Receipts and account emails
                still arrive.
              </p>
              <button
                type='button'
                onClick={unsubscribe}
                disabled={state.phase === 'working'}
                className='mt-6 w-full rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-60'
              >
                {state.phase === 'working' ? 'Unsubscribing…' : 'Unsubscribe'}
              </button>
              {state.phase === 'error' && (
                <p className='mt-3 text-sm text-red-600'>{state.message}</p>
              )}
            </>
          )}
          <Link href='/user/user-details' className='mt-6 inline-block text-sm text-gray-500 underline'>
            Go to my account
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
