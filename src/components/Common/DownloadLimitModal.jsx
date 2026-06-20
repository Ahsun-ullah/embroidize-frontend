'use client';

import { useDownloadReset } from '@/lib/hooks/useDownloadReset';
import { formatResetCountdown, formatResetTime } from '@/utils/functions/page';
import { AlertTriangle, Clock, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Download Limit Reached modal.
 *
 * Usage + reset countdown come from `useDownloadReset` — the same single source
 * of truth the My Plan page uses — so the numbers and reset time are always
 * identical between the two surfaces. Props are kept backward compatible with
 * the previous version (ProductDownloadCard passes them unchanged).
 *
 * @param {object}   props
 * @param {{type?: 'free'|'daily'|'period', count?: number, duration?: string}} props.limitModalData
 * @param {() => void} props.onClose
 * @param {(d: string) => string} [props.formatDuration]
 */
function DownloadLimitModal({ limitModalData = {}, onClose, formatDuration }) {
  const router = useRouter();
  const dialogRef = useRef(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [barReady, setBarReady] = useState(false); // drives the fill animation

  // Minute cadence — the modal only shows "13h 42m", so per-second ticks would
  // be wasted re-renders. Reset moment still matches My Plan (same source).
  const { usedDownloads, limit, msLeft, nextResetTime, currentPlanName } =
    useDownloadReset({ tickMs: 60_000 });

  // For free users the usage comes from the live query; for a subscriber who hit
  // a daily/period cap we fall back to the limit passed in limitModalData (they
  // are, by definition, at 100%).
  const total = limit > 0 ? limit : (limitModalData?.count ?? 0);
  const used = limit > 0 ? usedDownloads : (limitModalData?.count ?? total);
  const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;

  const isPeriod = limitModalData?.type === 'period';

  const title = isPeriod
    ? 'Download Limit Reached'
    : 'Daily Download Limit Reached';

  const subtitle = isPeriod
    ? `You've used all ${total} downloads for this billing period.`
    : `You've used all ${total} free download${total === 1 ? '' : 's'} available today. Your limit will reset automatically.`;

  // ── Accessibility: close on Escape, lock body scroll, focus the dialog ──
  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    const prevFocus = document.activeElement;
    dialogRef.current?.focus();

    // Trigger the progress-bar fill transition on the next frame.
    const raf = requestAnimationFrame(() => setBarReady(true));

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      cancelAnimationFrame(raf);
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [onClose]);

  const goToUpgrade = () => {
    setIsUpgrading(true);
    router.push('/subscriptions');
  };

  const resetLabel = formatResetTime(nextResetTime);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='dl-title'
        aria-describedby='dl-desc'
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl outline-none animate-fade-in'
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label='Close dialog'
          className='absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
        >
          <span aria-hidden className='text-lg leading-none'>
            ✕
          </span>
        </button>

        {/* ── Header ── */}
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400'>
            <AlertTriangle className='h-8 w-8' strokeWidth={2.2} aria-hidden />
          </div>
          <h2
            id='dl-title'
            className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white'
          >
            {title}
          </h2>
          <p
            id='dl-desc'
            className='mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400'
          >
            {subtitle}
          </p>
        </div>

        {/* ── Countdown ── */}
        <div className='mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10'>
          {msLeft > 0 ? (
            <div className='flex items-center justify-center gap-4'>
              <div className='flex items-center gap-2 text-neutral-500 dark:text-neutral-300'>
                <Clock
                  className='h-5 w-5 text-red-500 dark:text-red-400'
                  aria-hidden
                />
                <span className='text-sm font-medium'>Resets in</span>
              </div>
              <div className='text-left'>
                <p className='text-2xl font-extrabold tabular-nums leading-none text-red-500 dark:text-red-400'>
                  {formatResetCountdown(msLeft)}
                </p>
                {resetLabel && (
                  <p className='mt-1 text-xs text-neutral-500 dark:text-neutral-400'>
                    ({resetLabel})
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Subscriber daily/period caps have no rolling timestamp from the API.
            <div className='flex items-center justify-center gap-2'>
              <Clock
                className='h-5 w-5 text-red-500 dark:text-red-400'
                aria-hidden
              />
              <span className='text-sm font-medium text-neutral-500 dark:text-neutral-300'>
                Resets
              </span>
              <span className='text-lg font-bold text-neutral-900 dark:text-white'>
                {isPeriod ? 'next billing period' : 'at midnight'}
              </span>
            </div>
          )}
        </div>

        {/* ── Usage progress ── */}
        <div className='mt-5'>
          <div className='flex items-center justify-between text-sm'>
            <span className='font-semibold text-neutral-700 dark:text-neutral-200'>
              Downloads used
            </span>
            <span className='font-bold tabular-nums text-red-500 dark:text-red-400'>
              {used} / {total}
            </span>
          </div>
          <div
            className='mt-2 h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700'
            role='progressbar'
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label='Downloads used'
          >
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                pct >= 100 ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: barReady ? `${pct}%` : '0%' }}
            />
          </div>
          <p className='mt-1.5 text-xs text-neutral-500 dark:text-neutral-400'>
            {used} out of {total} download{total === 1 ? '' : 's'} used
          </p>
        </div>

        <div className='my-6 h-px w-full bg-neutral-100 dark:bg-neutral-800' />

        {/* ── Upgrade tiers ── */}
        {/* <div>
          <div className='mb-4 flex items-start gap-3'>
            <Crown
              className='h-7 w-7 shrink-0 text-yellow-400'
              fill='currentColor'
              strokeWidth={1.5}
              aria-hidden
            />
            <div>
              <p className='text-sm font-bold text-neutral-900 dark:text-white'>
                Upgrade for More Downloads
              </p>
              <p className='text-xs text-neutral-500 dark:text-neutral-400'>
                Unlock higher daily limits and enjoy uninterrupted downloads.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-2.5'>
            {UPGRADE_TIERS.map((tier) => {
              const isCurrent =
                currentPlanName?.toLowerCase() === tier.name.toLowerCase();
              return (
                <button
                  key={tier.name}
                  onClick={() => {
                    onClose?.();
                    router.push('/subscriptions');
                  }}
                  aria-label={`Upgrade to ${tier.name}, ${tier.dailyLimit} downloads per day`}
                  className={`group relative flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                    isCurrent
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-green-100 bg-green-50 hover:border-green-400 dark:border-green-500/20 dark:bg-green-500/10 dark:hover:border-green-400'
                  }`}
                >

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                    }`}
                  >
                    <Download className='h-5 w-5' aria-hidden />
                  </span>
                  <span className='flex flex-col leading-tight'>
                    <span
                      className={`text-base font-extrabold tabular-nums ${
                        isCurrent
                          ? 'text-white'
                          : 'text-green-700 dark:text-green-400'
                      }`}
                    >
                      {tier.dailyLimit}
                      <span className='ml-0.5 text-[11px] font-medium'>
                        / day
                      </span>
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-white/90'
                          : 'text-green-800 dark:text-green-300'
                      }`}
                    >
                      {tier.name}
                      {isCurrent && (
                        <span className='ml-1 text-[9px] font-semibold uppercase opacity-80'>
                          · Current
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div> */}

        {/* ── CTAs ── */}
        {/* <div className='mt-6 space-y-2'>
          <Button
            onPress={goToUpgrade}
            isLoading={isUpgrading}
            aria-label='Upgrade now'
            className='h-12 w-full rounded-xl bg-green-600 text-base font-semibold text-white hover:bg-green-700'
            startContent={
              !isUpgrading ? <Crown className='h-4 w-4' fill='currentColor' aria-hidden /> : null
            }
          >
            Upgrade Now
          </Button>
          <button
            onClick={onClose}
            className='w-full rounded-xl py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'
          >
            Maybe Later
          </button>
        </div> */}

        {/* ── Footer ── */}
        <div className='mt-5 flex flex-col gap-2 border-t border-neutral-100 pt-4 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400 sm:flex-row sm:items-center sm:justify-between'>
          <span className='flex items-center gap-1.5'>
            <Info className='h-3.5 w-3.5 text-blue-500' aria-hidden />
            {limit > 0 ? (
              <span>
                Free Plan:{' '}
                <span className='font-semibold text-neutral-700 dark:text-neutral-200'>
                  {limit} download{limit === 1 ? '' : 's'} per day
                </span>
              </span>
            ) : limitModalData?.duration && formatDuration ? (
              <span>
                Limit:{' '}
                <span className='font-semibold text-neutral-700 dark:text-neutral-200'>
                  {total} per {formatDuration(limitModalData.duration)}
                </span>
              </span>
            ) : (
              <span>
                Plan limit:{' '}
                <span className='font-semibold text-neutral-700 dark:text-neutral-200'>
                  {total}
                </span>
              </span>
            )}
          </span>
          {resetLabel && (
            <span>
              Next reset:{' '}
              <span className='font-semibold text-neutral-700 dark:text-neutral-200'>
                {resetLabel}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DownloadLimitModal;
