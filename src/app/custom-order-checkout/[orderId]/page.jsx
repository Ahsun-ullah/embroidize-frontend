'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import { CreditCard, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import OrderStatusChip from '@/features/customOrders/OrderStatusChip';
import {
  createCheckoutSession,
  downloadOrderZip,
  fetchOrder,
  hasOrderAccess,
  requestAccessLink,
  requestRevision,
  saveBlob,
  statusMeta,
} from '@/features/customOrders/ordersApi';

const DOWNLOADABLE = new Set(['delivered', 'in_revision', 'completed']);

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className='flex justify-between gap-4 border-b border-zinc-100 py-2 text-sm'>
      <span className='font-medium text-zinc-500'>{label}</span>
      <span className='text-right text-zinc-800'>{value}</span>
    </div>
  );
}

// Inline "get access" form shown when the visitor has no session for this order.
function AccessPrompt() {
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
    <div className='mx-auto max-w-md py-16 text-center'>
      <h1 className='mb-2 text-2xl font-bold'>Access your order</h1>
      {sent ? (
        <p className='text-sm text-zinc-600'>
          If any orders exist for that email, a secure access link is on its
          way. Check your inbox (and spam folder), then click the link to open
          this page again.
        </p>
      ) : (
        <>
          <p className='mb-6 text-sm text-zinc-600'>
            Enter the email you used for your order and we&apos;ll send you a
            secure link — no password needed. Or{' '}
            <Link href='/auth/login' className='underline'>
              log in
            </Link>{' '}
            if you have an account.
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
        </>
      )}
    </div>
  );
}

function CustomOrderCheckoutInner() {
  const { orderId } = useParams();
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get('checkout');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const pollRef = useRef(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const load = useCallback(async () => {
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
      setNoAccess(false);
      setError(null);
      return data;
    } catch (err) {
      if (err.status === 401) setNoAccess(true);
      else setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!hasOrderAccess()) {
      setNoAccess(true);
      setLoading(false);
      return;
    }
    load();
  }, [load]);

  // After a Stripe success redirect the webhook may lag a few seconds —
  // poll until the status flips to paid (max ~30s).
  useEffect(() => {
    if (checkoutResult !== 'success' || !order) return undefined;
    if (order.status !== 'awaiting_payment') return undefined;

    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      const fresh = await load();
      if ((fresh && fresh.status !== 'awaiting_payment') || attempts >= 10) {
        clearInterval(pollRef.current);
      }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [checkoutResult, order?.status, load]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { url } = await createCheckoutSession(orderId);
      window.location.href = url;
    } catch (err) {
      ErrorToast('Payment error', err.message, 4000);
      setPaying(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { blob, filename } = await downloadOrderZip(orderId);
      saveBlob(blob, filename);
    } catch (err) {
      ErrorToast('Download failed', err.message, 4000);
    } finally {
      setDownloading(false);
    }
  };

  const handleRevision = async (close) => {
    if (!revisionNotes.trim()) {
      ErrorToast('Notes required', 'Please describe what you would like changed.', 3000);
      return;
    }
    setSubmittingRevision(true);
    try {
      await requestRevision(orderId, revisionNotes.trim());
      SuccessToast(
        'Revision requested',
        'We will email you as soon as the updated file is ready.',
        5000,
      );
      setRevisionNotes('');
      close();
      await load();
    } catch (err) {
      ErrorToast('Could not request revision', err.message, 5000);
    } finally {
      setSubmittingRevision(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <Spinner color='default' label='Loading your order…' />
      </div>
    );
  }

  if (noAccess) return <AccessPrompt />;

  if (error || !order) {
    return (
      <div className='py-20 text-center text-sm text-zinc-600'>
        {error || 'Order not found.'}
      </div>
    );
  }

  const meta = statusMeta(order.status);
  const revisionsLeft = Math.max(
    0,
    (order.freeRevisionLimit ?? 2) - (order.revisionsUsed ?? 0),
  );
  const canRequestRevision =
    (order.status === 'delivered' ||
      (order.status === 'completed' &&
        order.deliveredAt &&
        Date.now() - new Date(order.deliveredAt).getTime() < 14 * 24 * 60 * 60 * 1000)) &&
    revisionsLeft > 0;

  return (
    <div className='mx-auto max-w-2xl px-4 py-10'>
      {/* Header */}
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold'>Order {order.orderNumber}</h1>
          <p className='text-xs text-zinc-500'>Placed {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusChip status={order.status} />
      </div>

      {/* Status banner */}
      <div className='mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5'>
        {order.status === 'pending_review' && (
          <p className='text-sm text-zinc-700'>
            <span className='font-semibold'>We&apos;ve received your order.</span>{' '}
            Our team is reviewing it and will email you a quote shortly.
          </p>
        )}

        {order.status === 'awaiting_payment' && (
          <div className='text-center'>
            {checkoutResult === 'success' ? (
              <div className='flex flex-col items-center gap-2'>
                <Spinner size='sm' color='default' />
                <p className='text-sm text-zinc-700'>
                  Payment received — confirming with Stripe…
                </p>
              </div>
            ) : (
              <>
                <p className='mb-1 text-sm text-zinc-500'>Your price</p>
                <p className='mb-4 text-4xl font-bold'>
                  ${Number(order.estimatedPrice || 0).toFixed(2)}
                </p>
                <Button
                  size='lg'
                  className='bg-black px-10 text-white'
                  isLoading={paying}
                  startContent={paying ? null : <CreditCard size={18} />}
                  onPress={handlePay}
                >
                  Pay securely with Stripe
                </Button>
                <p className='mt-3 text-xs text-zinc-500'>
                  Work starts as soon as your payment is confirmed.
                </p>
                {checkoutResult === 'cancelled' && (
                  <p className='mt-2 text-xs text-zinc-500'>
                    Checkout was cancelled — you can try again whenever you&apos;re ready.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {(order.status === 'paid' || order.status === 'in_progress') && (
          <p className='text-sm text-zinc-700'>
            <span className='font-semibold'>
              {order.status === 'paid' ? 'Payment confirmed — your order is in the queue.' : 'We&apos;re digitizing your design.'}
            </span>{' '}
            You&apos;ll get an email with your download as soon as it&apos;s ready.
          </p>
        )}

        {DOWNLOADABLE.has(order.status) && (
          <div className='text-center'>
            <p className='mb-4 text-sm text-zinc-700'>
              <span className='font-semibold'>
                {order.status === 'in_revision'
                  ? 'A revision is in progress.'
                  : 'Your embroidery files are ready.'}
              </span>{' '}
              {order.hasDeliveryFile &&
                'Your ZIP contains all machine formats — download it as many times as you like.'}
            </p>
            {order.hasDeliveryFile && (
              <div className='flex flex-wrap items-center justify-center gap-3'>
                <Button
                  size='lg'
                  className='bg-black px-8 text-white'
                  isLoading={downloading}
                  startContent={downloading ? null : <Download size={18} />}
                  onPress={handleDownload}
                >
                  Download files
                </Button>
                {canRequestRevision && (
                  <Button
                    size='lg'
                    variant='bordered'
                    className='border-black text-black'
                    startContent={<RefreshCw size={16} />}
                    onPress={onOpen}
                  >
                    Request a revision
                  </Button>
                )}
              </div>
            )}
            <p className='mt-3 text-xs text-zinc-500'>
              {order.revisionsUsed > 0 &&
                `${order.revisionsUsed} of ${order.freeRevisionLimit} included revisions used. `}
              {!canRequestRevision && revisionsLeft === 0 &&
                'Need another change? Contact support@embroidize.com for a quote.'}
            </p>
          </div>
        )}

        {(order.status === 'expired' || order.status === 'cancelled') && (
          <p className='text-sm text-zinc-700'>
            <span className='font-semibold'>{meta.label}.</span> Want to pick
            this back up? Email{' '}
            <a href='mailto:support@embroidize.com' className='underline'>
              support@embroidize.com
            </a>{' '}
            and we&apos;ll reopen your order.
          </p>
        )}
      </div>

      {/* Order summary */}
      <div className='rounded-xl border border-zinc-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500'>
          Order details
        </h2>
        <DetailRow label='Design type' value={order.designType || order.complexity} />
        <DetailRow label='Machine format' value={order.machineFormat || order.fileFormat} />
        <DetailRow label='Fabric / garment' value={order.fabricType} />
        <DetailRow
          label='Finished size'
          value={
            order.finishedSize ||
            (order.sizeWidth && order.sizeHeight
              ? `${order.sizeWidth} × ${order.sizeHeight} ${order.sizeUnit || ''}`
              : null)
          }
        />
        <DetailRow label='Rush order' value={order.rushOrder ? 'Yes' : null} />
        {order.estimatedPrice > 0 && (
          <DetailRow label='Price' value={`$${Number(order.estimatedPrice).toFixed(2)}`} />
        )}
        <DetailRow label='Paid on' value={order.paidAt ? formatDate(order.paidAt) : null} />
        <DetailRow
          label='Delivered on'
          value={order.deliveredAt ? formatDate(order.deliveredAt) : null}
        />
        {(order.specialInstructions || order.details) && (
          <div className='pt-3 text-sm'>
            <p className='mb-1 font-medium text-zinc-500'>Instructions</p>
            <p className='whitespace-pre-wrap text-zinc-800'>
              {order.specialInstructions || order.details}
            </p>
          </div>
        )}
      </div>

      <p className='mt-6 text-center text-xs text-zinc-400'>
        Questions about this order? Email{' '}
        <a href='mailto:support@embroidize.com' className='underline'>
          support@embroidize.com
        </a>
      </p>

      {/* Revision modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Request a revision</ModalHeader>
              <ModalBody>
                <p className='text-xs text-zinc-500'>
                  {revisionsLeft} of {order.freeRevisionLimit} included revisions
                  remaining.
                </p>
                <Textarea
                  label='What would you like changed?'
                  minRows={4}
                  value={revisionNotes}
                  onValueChange={setRevisionNotes}
                  placeholder='e.g. Make the lettering slightly bolder and reduce the width to 3 inches.'
                />
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  className='bg-black text-white'
                  isLoading={submittingRevision}
                  onPress={() => handleRevision(onClose)}
                >
                  Submit request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function CustomOrderCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-[50vh] items-center justify-center'>
          <Spinner color='default' />
        </div>
      }
    >
      <CustomOrderCheckoutInner />
    </Suspense>
  );
}
