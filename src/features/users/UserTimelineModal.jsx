'use client';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
} from '@heroui/react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MARKETING_LABELS } from '@/features/users/BehaviourFilters';

const LABELS = {
  download: 'Downloaded',
  design_view: 'Viewed design',
  pricing_view: 'Visited pricing',
  plan_click: 'Clicked a plan',
  search: 'Searched',
  checkout_started: 'Started checkout',
  checkout_completed: 'Paid',
  limit_hit: 'Hit download limit',
  premium_blocked: 'Refused premium design',
  login: 'Signed in',
};

const TONE = {
  checkout_completed: 'bg-green-100 text-green-800',
  checkout_started: 'bg-amber-100 text-amber-800',
  plan_click: 'bg-amber-50 text-amber-700',
  limit_hit: 'bg-red-100 text-red-700',
  premium_blocked: 'bg-red-100 text-red-700',
  download: 'bg-gray-900 text-white',
};

const when = (d) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime())
    ? ''
    : t.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
};

/**
 * Everything one user did, newest first: downloads, design and pricing views,
 * plan clicks, checkouts, limit hits and refused premium designs.
 */
export default function UserTimelineModal({ user, onClose }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    (async () => {
      setState({ loading: true, error: '', data: null });
      try {
        const token = Cookies.get('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/users/${user._id}/timeline`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Could not load activity.');
        if (!cancelled) setState({ loading: false, error: '', data: json.data });
      } catch (err) {
        if (!cancelled)
          setState({ loading: false, error: err.message || 'Could not load activity.', data: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const info = state.data?.user;
  const items = state.data?.items || [];

  return (
    <Modal isOpen={!!user} onClose={onClose} size='2xl' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <span>Activity: {user?.name || user?.email}</span>
          {info && (
            <span className='text-xs font-normal text-gray-500'>
              Last seen {info.lastSeenAt ? when(info.lastSeenAt) : 'not yet tracked'} · Last sign-in{' '}
              {info.lastLoginAt ? when(info.lastLoginAt) : 'not yet tracked'} · Offer emails:{' '}
              {MARKETING_LABELS[info.marketingState] || '—'}
              {info.marketingEmailable ? ' (can receive)' : ' (cannot receive)'}
            </span>
          )}
        </ModalHeader>
        <ModalBody className='pb-6'>
          {state.loading && (
            <div className='flex justify-center py-8'>
              <Spinner size='sm' />
            </div>
          )}
          {state.error && <p className='text-sm text-red-600'>{state.error}</p>}
          {!state.loading && !state.error && items.length === 0 && (
            <p className='text-sm text-gray-500'>No activity recorded yet.</p>
          )}
          <ol className='flex flex-col divide-y divide-gray-100'>
            {items.map((it, i) => (
              <li key={`${it.type}-${it.at}-${i}`} className='flex flex-wrap items-center gap-2 py-2 text-sm'>
                <span className='w-40 shrink-0 text-xs text-gray-500'>{when(it.at)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    TONE[it.type] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {LABELS[it.type] || it.type}
                </span>
                {it.product && (
                  it.product.slug ? (
                    <Link
                      href={`/product/${it.product.slug}`}
                      target='_blank'
                      className='text-gray-900 underline-offset-2 hover:underline'
                    >
                      {it.product.name}
                    </Link>
                  ) : (
                    <span className='text-gray-900'>{it.product.name}</span>
                  )
                )}
                {it.plan && <span className='text-gray-900'>{it.plan.name}</span>}
                {it.value && <span className='text-xs text-gray-500'>{it.value}</span>}
                {it.source && <span className='text-xs text-gray-400'>from {it.source}</span>}
              </li>
            ))}
          </ol>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
