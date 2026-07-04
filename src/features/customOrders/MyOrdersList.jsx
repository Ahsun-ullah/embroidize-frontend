'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { Button, Spinner } from '@heroui/react';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import OrderStatusChip from './OrderStatusChip';
import {
  downloadOrderZip,
  fetchMyOrders,
  hasOrderAccess,
  saveBlob,
} from './ordersApi';

const DOWNLOADABLE = new Set(['delivered', 'in_revision', 'completed']);

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Shared "My Orders" list — used by /user/custom-order (registered) and
// /orders (guest magic-link session). Auth is whatever cookie is present.
export default function MyOrdersList({ accessPath = '/orders/access' }) {
  const [state, setState] = useState({ loading: true, orders: [], email: '', error: null });
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hasOrderAccess()) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: 'no-access' }));
        return;
      }
      try {
        const data = await fetchMyOrders();
        if (!cancelled)
          setState({ loading: false, orders: data.orders || [], email: data.email || '', error: null });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error: err.status === 401 ? 'no-access' : err.message,
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = async (order) => {
    setDownloadingId(order._id);
    try {
      const { blob, filename } = await downloadOrderZip(order._id);
      saveBlob(blob, filename);
    } catch (err) {
      ErrorToast('Download failed', err.message, 4000);
    } finally {
      setDownloadingId(null);
    }
  };

  if (state.loading) {
    return (
      <div className='flex justify-center py-20'>
        <Spinner color='default' label='Loading your orders…' />
      </div>
    );
  }

  if (state.error === 'no-access') {
    return (
      <div className='mx-auto max-w-md py-16 text-center'>
        <h2 className='mb-2 text-xl font-bold'>Sign in to see your orders</h2>
        <p className='mb-6 text-sm text-zinc-600'>
          Use your account, or get a secure access link by email — no password
          needed.
        </p>
        <div className='flex justify-center gap-3'>
          <Button as={Link} href='/auth/login' variant='bordered' className='border-black text-black'>
            Log in
          </Button>
          <Button as={Link} href={accessPath} className='bg-black text-white'>
            Email me a link
          </Button>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className='py-16 text-center text-sm text-zinc-600'>
        Could not load your orders: {state.error}
      </div>
    );
  }

  if (state.orders.length === 0) {
    return (
      <div className='mx-auto max-w-md py-16 text-center'>
        <h2 className='mb-2 text-xl font-bold'>No orders yet</h2>
        <p className='mb-6 text-sm text-zinc-600'>
          {state.email ? `No custom orders found for ${state.email}.` : 'No custom orders found.'}
        </p>
        <Button
          as={Link}
          href='/custom-embroidery-digitizing-service'
          className='bg-black text-white'
        >
          Start a custom order
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {state.email && (
        <p className='text-sm text-zinc-500'>
          Orders for <span className='font-semibold text-zinc-800'>{state.email}</span>
        </p>
      )}
      {state.orders.map((order) => (
        <div
          key={order._id}
          className='flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between'
        >
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <Link
                href={`/custom-order-checkout/${order._id}`}
                className='font-semibold text-black underline-offset-2 hover:underline'
              >
                {order.orderNumber}
              </Link>
              <OrderStatusChip status={order.status} />
            </div>
            <p className='mt-1 text-xs text-zinc-500'>
              Placed {formatDate(order.createdAt)}
              {order.estimatedPrice > 0 && ` · $${Number(order.estimatedPrice).toFixed(2)}`}
              {order.deliveredAt && ` · Delivered ${formatDate(order.deliveredAt)}`}
            </p>
          </div>
          <div className='flex flex-shrink-0 items-center gap-2'>
            {DOWNLOADABLE.has(order.status) && order.hasDeliveryFile && (
              <Button
                size='sm'
                className='bg-black text-white'
                isLoading={downloadingId === order._id}
                startContent={downloadingId === order._id ? null : <Download size={14} />}
                onPress={() => handleDownload(order)}
              >
                Download
              </Button>
            )}
            <Button
              as={Link}
              size='sm'
              variant='bordered'
              className='border-zinc-300 text-zinc-700'
              href={`/custom-order-checkout/${order._id}`}
            >
              {order.status === 'awaiting_payment' ? 'Review & pay' : 'View'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
