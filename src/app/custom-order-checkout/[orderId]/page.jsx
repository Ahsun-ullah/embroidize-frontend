'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import OrderMessages from '@/features/customOrders/OrderMessages';
import OrderReview from '@/features/customOrders/OrderReview';
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
import OrderStatusChip from '@/features/customOrders/OrderStatusChip';
import OrderTimeline from '@/features/customOrders/OrderTimeline';
import { openOrderReceipt } from '@/features/customOrders/receipt';
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
import {
  AlertCircle,
  CreditCard,
  Download,
  Expand,
  FileText,
  RefreshCw,
  ShieldCheck,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

const DOWNLOADABLE = new Set(['delivered', 'in_revision', 'completed']);

// Subtle checkerboard so transparent-background artwork reads clearly against
// white — the classic "design canvas" look, in grayscale to stay on-brand.
const CHECKER = {
  backgroundColor: '#ffffff',
  backgroundImage:
    'linear-gradient(45deg, #f1f1f3 25%, transparent 25%), linear-gradient(-45deg, #f1f1f3 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f1f3 75%), linear-gradient(-45deg, transparent 75%, #f1f1f3 75%)',
  backgroundSize: '18px 18px',
  backgroundPosition: '0 0, 0 9px, 9px -9px, -9px 0',
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ---------- small presentational helpers ---------- */

// Editorial eyebrow — tiny, widely-tracked small caps.
function Eyebrow({ children, className = '' }) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 ${className}`}
    >
      {children}
    </p>
  );
}

// Numbered editorial section, presented as its own card so every block is
// clearly separated and easy to scan.
function Section({ no, title, aside, children }) {
  return (
    <section className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7'>
      <div className='mb-5 flex items-baseline justify-between gap-3'>
        <div className='flex items-baseline gap-4'>
          <span className='text-xs font-semibold tabular-nums text-zinc-400'>
            {no}
          </span>
          <h2 className='text-lg font-bold tracking-tight text-zinc-900'>
            {title}
          </h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Receipt-style row with a dotted leader between label and value.
function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className='flex items-baseline gap-3 py-2 text-sm'>
      <span className='shrink-0 text-zinc-500'>{label}</span>
      <span
        aria-hidden
        className='mb-1 min-w-4 flex-1 border-b border-dotted border-zinc-300'
      />
      <span className='text-right font-medium tabular-nums text-zinc-900'>
        {value}
      </span>
    </div>
  );
}

function DesignPanel({ file, caption, onZoom }) {
  return (
    <figure className='flex min-w-0 flex-1 flex-col gap-2'>
      <button
        type='button'
        onClick={() => onZoom({ url: file.url, caption })}
        style={CHECKER}
        className='group relative flex h-56 items-center justify-center overflow-hidden border border-zinc-200 p-3 transition hover:border-black sm:h-80'
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.url}
          alt={caption}
          className='max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.02]'
        />
        <span className='absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100'>
          <Expand size={11} /> Zoom
        </span>
      </button>
      <figcaption className='text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500'>
        {caption}
      </figcaption>
    </figure>
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
    <div className='mx-auto max-w-md px-4 py-24'>
      <div className='rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center shadow-sm'>
        <Eyebrow>Secure access</Eyebrow>
        <h1 className='mt-2 text-3xl font-extrabold tracking-tight text-zinc-900'>
          Access your order
        </h1>
        {sent ? (
          <p className='mt-4 text-sm leading-relaxed text-zinc-600'>
            If any orders exist for that email, a secure access link is on its
            way. Check your inbox (and spam folder), then click the link to open
            this page again.
          </p>
        ) : (
          <>
            <p className='mb-8 mt-3 text-sm leading-relaxed text-zinc-600'>
              Enter the email you used for your order and we&apos;ll send you a
              secure link — no password needed. Or{' '}
              <Link
                href='/auth/login'
                className='font-medium text-zinc-900 underline underline-offset-2'
              >
                log in
              </Link>{' '}
              if you have an account.
            </p>
            <form onSubmit={submit} className='flex flex-col gap-3 sm:flex-row'>
              <input
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                className='w-full border-b border-zinc-300 bg-transparent px-1 py-2.5 text-center text-sm outline-none transition focus:border-black sm:text-left'
              />
              <Button
                type='submit'
                isLoading={busy}
                radius='full'
                className='bg-black px-6 font-medium text-white'
              >
                Send link
              </Button>
            </form>
          </>
        )}
      </div>
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
  const [zoom, setZoom] = useState(null); // { url, caption } for the design lightbox
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

  // After a Stripe success redirect the webhook may lag a few seconds — poll
  // until it lands (max ~30s). Covers both the initial quote payment (status
  // flips off awaiting_payment) and an extra "balance due" payment (the
  // duePayment marker clears).
  const awaitingConfirmation =
    checkoutResult === 'success' &&
    Boolean(order) &&
    (order.status === 'awaiting_payment' || Boolean(order.duePayment));

  useEffect(() => {
    if (!awaitingConfirmation) return undefined;

    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      const fresh = await load();
      const settled =
        fresh && fresh.status !== 'awaiting_payment' && !fresh.duePayment;
      if (settled || attempts >= 10) {
        clearInterval(pollRef.current);
      }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [awaitingConfirmation, load]);

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
      ErrorToast(
        'Notes required',
        'Please describe what you would like changed.',
        3000,
      );
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
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Spinner color='default' label='Loading your order…' />
      </div>
    );
  }

  if (noAccess)
    return (
      <div className='min-h-screen bg-[#f4f4f4]'>
        <AccessPrompt />
      </div>
    );

  if (error || !order) {
    return (
      <div className='min-h-screen bg-[#f4f4f4]'>
        <div className='mx-auto max-w-md px-4 py-24'>
          <div className='rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center shadow-sm'>
            <div className='mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 text-zinc-400'>
              <AlertCircle size={24} />
            </div>
            <p className='text-sm text-zinc-600'>
              {error || 'Order not found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const meta = statusMeta(order.status);
  const revisionsLeft = Math.max(
    0,
    (order.freeRevisionLimit ?? 2) - (order.revisionsUsed ?? 0),
  );
  // A revision can always be requested once the design has been delivered — no
  // 14-day window and no hard free-limit cutoff. Requests beyond the included
  // free revisions still go through (backend flags them as paid so admin can
  // quote). `revisionsLeft` is used only to warn the customer in the modal.
  const canRequestRevision =
    order.status === 'delivered' || order.status === 'completed';

  // Receipt is available once money has actually been collected.
  const canDownloadReceipt =
    ['paid', 'in_progress', 'delivered', 'in_revision', 'completed'].includes(
      order.status,
    ) && Number(order.estimatedPrice) > 0;

  const showReview = ['delivered', 'completed', 'in_revision'].includes(
    order.status,
  );
  // The order is only marked "completed" once the customer leaves a review, so
  // nudge for it while the design is delivered but not yet reviewed.
  const reviewCompletesOrder = order.status === 'delivered' && !order.myReview;
  const isDownloadable =
    DOWNLOADABLE.has(order.status) && order.hasDeliveryFile;

  // Extra payment requested by the admin (e.g. an optional paid-revision fee).
  // Shown as its own "balance due" panel; the order keeps its current status,
  // so delivered files stay downloadable while it's outstanding.
  const dueExtra =
    order.status !== 'awaiting_payment' &&
    Number(order.duePayment?.amount) > 0
      ? order.duePayment
      : null;

  // On mobile, keep the primary action within thumb reach via a sticky bottom
  // bar so the customer never has to scroll back up to pay or download.
  const showMobilePayBar =
    (order.status === 'awaiting_payment' || Boolean(dueExtra)) &&
    checkoutResult !== 'success';
  const showMobileDownloadBar =
    (order.status === 'delivered' || order.status === 'completed') &&
    isDownloadable;
  const hasMobileBar = showMobilePayBar || showMobileDownloadBar;

  // Editorial section numbering — increments in render order so only the
  // sections that actually appear are counted.
  let sectionNo = 0;
  const nextNo = () => String(++sectionNo).padStart(2, '0');

  return (
    <div className='min-h-screen bg-[#f4f4f4]'>
      <div
        className={`container mx-auto max-w-5xl px-4 py-10 sm:py-14 ${
          hasMobileBar ? 'pb-28 lg:pb-14' : ''
        }`}
      >
        {/* Editorial masthead card — identity, status and progress */}
        <header className='mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7'>
          <Eyebrow>Custom order</Eyebrow>
          <div className='mt-1 flex flex-wrap items-center justify-between gap-4'>
            <h1 className='text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl'>
              {order.orderNumber}
            </h1>
            <OrderStatusChip status={order.status} />
          </div>
          <p className='mt-2 text-sm text-zinc-500'>
            Placed {formatDate(order.createdAt)}
          </p>
          <div className='mt-8 border-t border-zinc-200 pt-6'>
            <OrderTimeline order={order} />
          </div>
        </header>

        {/* Main: story column (left) + summary rail (right) */}
        <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8'>
          {/* ---------- LEFT: action, design, review, messages ---------- */}
          <div className='flex min-w-0 flex-col gap-6 lg:flex-1'>
            {/* Status-based primary action */}
            {order.status === 'pending_review' && (
              <Section no={nextNo()} title='Status'>
                <p className='max-w-prose text-sm leading-relaxed text-zinc-600'>
                  We&apos;ve received your order. Our team is reviewing the
                  details and will email you a quote shortly — no payment is
                  needed yet.
                </p>
              </Section>
            )}

            {order.status === 'awaiting_payment' &&
              (checkoutResult === 'success' ? (
                <Section no={nextNo()} title='Payment'>
                  <div className='flex flex-col items-center gap-3 py-6 text-center'>
                    <Spinner size='sm' color='default' />
                    <p className='text-sm text-zinc-700'>
                      Payment received — confirming with Stripe…
                    </p>
                  </div>
                </Section>
              ) : (
                <Section no={nextNo()} title='Payment'>
                  {/* Invoice moment: strong double rules frame the amount */}
                  <div className='border-y-2 border-black py-6'>
                    <div className='flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
                      <div>
                        <Eyebrow>Amount due</Eyebrow>
                        <p className='mt-1 text-5xl font-extrabold tracking-tight tabular-nums text-zinc-900'>
                          ${Number(order.estimatedPrice || 0).toFixed(2)}
                        </p>
                        {order.estimatedDelivery && (
                          <p className='mt-2 text-xs text-zinc-500'>
                            Est. delivery {order.estimatedDelivery}
                          </p>
                        )}
                      </div>
                      <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end'>
                        <Button
                          size='lg'
                          radius='full'
                          className='bg-black px-8 font-semibold text-white transition hover:bg-zinc-800'
                          isLoading={paying}
                          startContent={
                            paying ? null : <CreditCard size={18} />
                          }
                          onPress={handlePay}
                        >
                          Pay with Stripe
                        </Button>
                        <p className='flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 sm:justify-end'>
                          <ShieldCheck size={12} />
                          Work starts once payment is confirmed.
                        </p>
                      </div>
                    </div>
                    {checkoutResult === 'cancelled' && (
                      <p className='mt-5 border-t border-zinc-200 pt-4 text-xs text-zinc-500'>
                        Checkout was cancelled — you can try again whenever
                        you&apos;re ready.
                      </p>
                    )}
                  </div>
                </Section>
              ))}

            {/* Balance due — an extra payment the admin requested (e.g. a paid
                revision fee). The order stays in its current status, so files
                remain downloadable while this is outstanding. */}
            {dueExtra &&
              (checkoutResult === 'success' ? (
                <Section no={nextNo()} title='Additional payment'>
                  <div className='flex flex-col items-center gap-3 py-6 text-center'>
                    <Spinner size='sm' color='default' />
                    <p className='text-sm text-zinc-700'>
                      Payment received — confirming with Stripe…
                    </p>
                  </div>
                </Section>
              ) : (
                <Section no={nextNo()} title='Additional payment'>
                  <div className='border-y-2 border-black py-6'>
                    <div className='flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
                      <div>
                        <Eyebrow>Balance due</Eyebrow>
                        <p className='mt-1 text-5xl font-extrabold tracking-tight tabular-nums text-zinc-900'>
                          ${Number(dueExtra.amount).toFixed(2)}
                        </p>
                        {dueExtra.note && (
                          <p className='mt-2 max-w-prose text-sm text-zinc-600'>
                            {dueExtra.note}
                          </p>
                        )}
                      </div>
                      <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end'>
                        <Button
                          size='lg'
                          radius='full'
                          className='bg-black px-8 font-semibold text-white transition hover:bg-zinc-800'
                          isLoading={paying}
                          startContent={paying ? null : <CreditCard size={18} />}
                          onPress={handlePay}
                        >
                          Pay with Stripe
                        </Button>
                        <p className='flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 sm:justify-end'>
                          <ShieldCheck size={12} />
                          Your files stay available meanwhile.
                        </p>
                      </div>
                    </div>
                    {checkoutResult === 'cancelled' && (
                      <p className='mt-5 border-t border-zinc-200 pt-4 text-xs text-zinc-500'>
                        Checkout was cancelled — you can try again whenever
                        you&apos;re ready.
                      </p>
                    )}
                  </div>
                </Section>
              ))}

            {(order.status === 'paid' || order.status === 'in_progress') && (
              <Section no={nextNo()} title='Status'>
                <p className='max-w-prose text-sm leading-relaxed text-zinc-600'>
                  <span className='font-semibold text-zinc-900'>
                    {order.status === 'paid'
                      ? 'Payment confirmed — you’re in the queue. '
                      : 'We’re digitizing your design. '}
                  </span>
                  You&apos;ll get an email with your download as soon as
                  it&apos;s ready.
                  {order.estimatedDelivery && (
                    <>
                      {' '}
                      Estimated delivery{' '}
                      <span className='font-semibold text-zinc-900'>
                        {order.estimatedDelivery}
                      </span>
                      .
                    </>
                  )}
                </p>
              </Section>
            )}

            {order.status === 'in_revision' && (
              <Section
                no={nextNo()}
                title='Status'
                aside={
                  isDownloadable && (
                    <Button
                      size='sm'
                      radius='full'
                      variant='bordered'
                      className='shrink-0 border-zinc-300 font-medium text-zinc-100 bg-black py-6 px-6 text-xl  hover:bg-zinc-200 hover:text-black transition-transform active:scale-95'
                      isLoading={downloading}
                      startContent={downloading ? null : <Download size={20} />}
                      onPress={handleDownload}
                    >
                      Download files
                    </Button>
                  )
                }
              >
                <p className='max-w-prose text-lg leading-relaxed text-zinc-600'>
                  <span className='font-semibold text-zinc-900'>
                    A revision is in progress.{' '}
                  </span>
                  We&apos;ll email you when the updated file is ready. Your
                  previous files stay available here.
                </p>
              </Section>
            )}

            {(order.status === 'delivered' || order.status === 'completed') &&
              isDownloadable && (
                <Section no={nextNo()} title='Your files'>
                  <div className='border-y-2 border-black py-6'>
                    <h3 className='text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl'>
                      Your embroidery files are ready.
                    </h3>
                    <p className='mt-2 max-w-prose text-lg leading-relaxed text-zinc-600'>
                      The ZIP contains every machine format — download it as
                      many times as you like.
                    </p>
                    <div className='mt-6 flex flex-col gap-2 sm:flex-row'>
                      <Button
                        size='lg'
                        radius='full'
                        className='bg-black px-8 font-semibold text-white transition hover:bg-zinc-800'
                        isLoading={downloading}
                        startContent={
                          downloading ? null : <Download size={18} />
                        }
                        onPress={handleDownload}
                      >
                        Download files
                      </Button>
                      {canRequestRevision && (
                        <Button
                          size='lg'
                          radius='full'
                          variant='bordered'
                          className='border-zinc-300 px-8 font-semibold text-zinc-900'
                          startContent={<RefreshCw size={15} />}
                          onPress={onOpen}
                        >
                          Request a revision
                        </Button>
                      )}
                    </div>
                    {(order.revisionsUsed > 0 ||
                      reviewCompletesOrder ||
                      (canRequestRevision && revisionsLeft === 0)) && (
                      <div className='mt-6 space-y-1.5 border-t border-zinc-200 pt-4 text-xs text-zinc-500'>
                        {order.revisionsUsed > 0 && (
                          <p>
                            {order.revisionsUsed} of {order.freeRevisionLimit}{' '}
                            included revisions used.
                            {canRequestRevision &&
                              revisionsLeft === 0 &&
                              ' Further revisions may be charged — we’ll email a quote if any applies.'}
                          </p>
                        )}
                        {reviewCompletesOrder && (
                          <p className='flex items-center gap-1.5 font-medium text-zinc-900'>
                            <Star size={12} className='fill-current' />
                            Leave a review to mark this order complete.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Section>
              )}

            {(order.status === 'expired' || order.status === 'cancelled') && (
              <Section no={nextNo()} title={meta.label}>
                <p className='max-w-prose text-sm leading-relaxed text-zinc-600'>
                  Want to pick this back up? Email{' '}
                  <a
                    href='mailto:support@embroidize.com'
                    className='font-medium text-zinc-900 underline underline-offset-2'
                  >
                    support@embroidize.com
                  </a>{' '}
                  and we&apos;ll reopen your order.
                </p>
              </Section>
            )}

            {/* Design showcase */}
            {(order.designReference?.url || order.deliveryPreview?.url) && (
              <Section
                no={nextNo()}
                title='Design'
                aside={
                  order.deliveryPreview?.url && (
                    <span className='text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500'>
                      Preview ready
                    </span>
                  )
                }
              >
                <div className='flex flex-col gap-5 sm:flex-row'>
                  {order.designReference?.url && (
                    <DesignPanel
                      file={order.designReference}
                      caption='Your reference'
                      onZoom={setZoom}
                    />
                  )}
                  {order.deliveryPreview?.url && (
                    <DesignPanel
                      file={order.deliveryPreview}
                      caption='Final preview'
                      onZoom={setZoom}
                    />
                  )}
                </div>
              </Section>
            )}

            {/* Review — appears once delivered; submitting it completes the order */}
            {showReview && (
              <Section
                no={nextNo()}
                title={order.myReview ? 'Your review' : 'How did we do?'}
                aside={
                  reviewCompletesOrder && (
                    <span className='text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-900'>
                      Completes your order
                    </span>
                  )
                }
              >
                {!order.myReview && (
                  <p className='mb-4 max-w-prose text-sm leading-relaxed text-zinc-600'>
                    A quick review means a lot — and marks your order complete.
                  </p>
                )}
                <OrderReview
                  orderId={orderId}
                  initialReview={order.myReview}
                  onSubmitted={load}
                  embedded
                />
              </Section>
            )}

            {/* Messages / chat */}
            <Section no={nextNo()} title='Messages'>
              <p className='mb-4 max-w-prose text-sm leading-relaxed text-zinc-600'>
                Chat with our digitizing team — ask a question, request a tweak,
                or check on progress.
              </p>
              <OrderMessages orderId={orderId} embedded />
            </Section>
          </div>

          {/* ---------- RIGHT: order summary + help (sticky) ---------- */}
          <aside className='lg:sticky lg:top-8 lg:w-[300px] lg:shrink-0'>
            {/* Order summary — receipt-style card with dotted leaders */}
            <div className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6'>
              <Eyebrow>Order details</Eyebrow>
              <div className='mt-2'>
                <DetailRow
                  label='Design type'
                  value={order.designType || order.complexity}
                />
                <DetailRow
                  label='Machine format'
                  value={order.machineFormat || order.fileFormat}
                />
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
                <DetailRow
                  label='Rush order'
                  value={order.rushOrder ? 'Yes' : null}
                />
                <DetailRow
                  label='Estimated delivery'
                  value={order.estimatedDelivery || null}
                />
                <DetailRow
                  label='Paid on'
                  value={order.paidAt ? formatDate(order.paidAt) : null}
                />
                <DetailRow
                  label='Delivered on'
                  value={
                    order.deliveredAt ? formatDate(order.deliveredAt) : null
                  }
                />
              </div>

              {order.estimatedPrice > 0 && (
                <div className='mt-3 border-t-2 border-black pt-3'>
                  {/* Per-payment breakdown once there's more than one (e.g.
                      initial charge + a paid revision). */}
                  {order.payments?.length > 1 && (
                    <div className='mb-2 space-y-1'>
                      {order.payments.map((p, i) => (
                        <div
                          key={i}
                          className='flex items-baseline justify-between text-xs text-zinc-500'
                        >
                          <span>
                            Payment {i + 1} · {formatDate(p.at)}
                          </span>
                          <span className='tabular-nums'>
                            ${Number(p.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className='flex items-baseline justify-between'>
                    <span className='text-sm font-bold uppercase tracking-wider text-zinc-900'>
                      Total
                    </span>
                    <span className='text-xl font-extrabold tabular-nums text-zinc-900'>
                      ${Number(order.estimatedPrice).toFixed(2)}
                    </span>
                  </div>
                  {dueExtra && (
                    <div className='mt-1 flex items-baseline justify-between text-xs font-semibold text-zinc-900'>
                      <span>Balance due</span>
                      <span className='tabular-nums'>
                        ${Number(dueExtra.amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {(order.specialInstructions || order.details) && (
                <div className='mt-6 border-t border-zinc-200 pt-4'>
                  <Eyebrow className='mb-1.5'>Instructions</Eyebrow>
                  <p className='whitespace-pre-wrap text-sm leading-relaxed text-zinc-700'>
                    {order.specialInstructions || order.details}
                  </p>
                </div>
              )}

              {canDownloadReceipt && (
                <div className='mt-6 border-t border-zinc-200 pt-4'>
                  <Button
                    size='sm'
                    radius='full'
                    variant='bordered'
                    className='w-full border-zinc-300 font-medium text-zinc-100 bg-black py-6 text-xl  hover:bg-zinc-200 hover:text-black transition-transform active:scale-95'
                    startContent={<FileText size={20} />}
                    onPress={() => openOrderReceipt(order)}
                  >
                    Download receipt
                  </Button>
                </div>
              )}

              {/* Support */}
              <div className='mt-6 border-t border-zinc-200 pt-4'>
                <p className='text-xs leading-relaxed text-zinc-500'>
                  <span className='font-semibold text-zinc-900'>
                    Need help?{' '}
                  </span>
                  Email{' '}
                  <a
                    href='mailto:support@embroidize.com'
                    className='font-medium text-zinc-800 underline underline-offset-2'
                  >
                    support@embroidize.com
                  </a>{' '}
                  and we&apos;ll get back to you.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Sticky mobile action bar — keeps pay / download within thumb reach */}
        {hasMobileBar && (
          <div className='fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 pb-[env(safe-area-inset-bottom)] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden'>
            <div className='mx-auto flex max-w-5xl items-center gap-3'>
              {showMobilePayBar ? (
                <>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[11px] font-medium uppercase tracking-wider text-zinc-400'>
                      {dueExtra ? 'Balance due' : 'Amount due'}
                    </p>
                    <p className='text-xl font-bold leading-tight tabular-nums text-zinc-900'>
                      $
                      {Number(
                        dueExtra ? dueExtra.amount : order.estimatedPrice || 0,
                      ).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size='lg'
                    radius='full'
                    className='shrink-0 bg-black px-6 font-semibold text-white'
                    isLoading={paying}
                    startContent={paying ? null : <CreditCard size={18} />}
                    onPress={handlePay}
                  >
                    Pay now
                  </Button>
                </>
              ) : (
                <Button
                  size='lg'
                  radius='full'
                  fullWidth
                  className='bg-black font-semibold text-white'
                  isLoading={downloading}
                  startContent={downloading ? null : <Download size={18} />}
                  onPress={handleDownload}
                >
                  Download files
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Design zoom lightbox */}
        <Modal
          isOpen={Boolean(zoom)}
          onOpenChange={(open) => !open && setZoom(null)}
          size='3xl'
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>{zoom?.caption}</ModalHeader>
                <ModalBody className='pb-6'>
                  {zoom && (
                    <div
                      style={CHECKER}
                      className='overflow-hidden rounded-xl border border-zinc-200 p-3'
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={zoom.url}
                        alt={zoom.caption}
                        className='mx-auto max-h-[75vh] w-full object-contain'
                      />
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant='light' onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Revision modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Request a revision</ModalHeader>
                <ModalBody>
                  <p className='text-xs text-zinc-500'>
                    {revisionsLeft > 0
                      ? `${revisionsLeft} of ${order.freeRevisionLimit} included revisions remaining.`
                      : `You’ve used your ${order.freeRevisionLimit} included revisions. This request may be charged as a paid revision — we’ll email you a quote if so.`}
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
