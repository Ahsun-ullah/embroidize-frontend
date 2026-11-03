'use client';

import UpgradePlanPicker, {
  planDailyLimit,
  upgradePlans,
} from '@/components/Common/UpgradePlanPicker';
import { windowPhrase } from '@/lib/apis/public/siteConfig';
import { useDownloadReset } from '@/lib/hooks/useDownloadReset';
import { formatDesignCount, useUpgradeOffer } from '@/lib/hooks/useUpgradeOffer';
import { formatResetTime } from '@/utils/functions/page';
import { Download, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : '');

/**
 * Shown when a download is refused for quota reasons.
 *
 * Free users (and lapsed subscribers, who are free users again) get the
 * upsell: the design they tried to download, the live plans as radio cards and
 * a CTA that goes straight to that plan's checkout (with the
 * `subscription_checkout` tracking event — see UpgradePlanPicker).
 *
 * Paying subscribers who hit their own daily / period cap get the same shell
 * without the plan cards: they already have a plan, so the action is to manage
 * it, not to start a second checkout.
 *
 * @param {object} limitModalData  { type, count, duration, planName, endedAt }
 *                                 from the download endpoint's 403
 * @param {object} product         { name, imageUrl } of the design they tried
 *                                 to download (optional)
 */
function DownloadLimitModal({ limitModalData = {}, product, onClose }) {
  const router = useRouter();
  const dialogRef = useRef(null);

  const { usedDownloads, limit, downloadWindow, msLeft, nextResetTime } =
    useDownloadReset({ tickMs: 60_000 });
  const { plans, totalDesigns } = useUpgradeOffer();

  const total = limit > 0 ? limit : (limitModalData?.count ?? 0);
  const used = limit > 0 ? usedDownloads : total;

  // A lapsed subscriber is a FREE user now, so their numbers and countdown are
  // the free-tier ones — /userinfo reports them that way, which is what feeds
  // useDownloadReset above. Only the wording differs.
  const isExpired = limitModalData?.type === 'subscription_expired';
  const isPeriod = limitModalData?.type === 'period';
  const isFree = limitModalData?.type === 'free' || isExpired;
  const isDaily = !isPeriod && !isFree;

  // "1d" (the default) is a rolling 24-hour window, which the copy calls
  // "today's"; other windows read as "all N free downloads".
  const windowLabel = windowPhrase(downloadWindow);
  const isDayWindow = !windowLabel || windowLabel === 'day';
  const windowEvery = isDayWindow ? '24 hours' : windowLabel;

  // Subscriber daily quota rolls over at the server day boundary (UTC
  // midnight), not the user's local midnight — same math as My Plan. The
  // hook's own msLeft/nextResetTime only cover the free-tier window.
  const nextDailyReset = new Date();
  nextDailyReset.setUTCHours(24, 0, 0, 0);
  const effectiveMsLeft = isDaily
    ? Math.max(0, nextDailyReset.getTime() - Date.now())
    : msLeft;
  const effectiveResetTime = isDaily ? nextDailyReset : nextResetTime;
  const resetLabel =
    effectiveMsLeft > 0 ? lowerFirst(formatResetTime(effectiveResetTime)) : '';

  const designCount = formatDesignCount(totalDesigns);
  const maxDaily = upgradePlans(plans)
    .map(planDailyLimit)
    .filter((n) => n != null)
    .reduce((max, n) => Math.max(max, n), 0);

  const endedOnLabel = limitModalData?.endedAt
    ? new Date(limitModalData.endedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const plural = (n) => (n === 1 ? '' : 's');

  let pill;
  let title;
  let subtitle;
  if (isExpired) {
    pill = `Your ${limitModalData?.planName || 'subscription'} plan has ended`;
    title = designCount
      ? `Renew to get this design, plus ${designCount} more`
      : 'Renew to get this design';
    subtitle = `Your plan ended${endedOnLabel ? ` on ${endedOnLabel}` : ''}. You're on the free plan now (${total} download${plural(total)} every ${windowEvery}), and everything you already downloaded is still yours to re-download free.`;
  } else if (isFree) {
    pill = isDayWindow
      ? `You've used today's ${used} free download${plural(used)}`
      : `You've used all ${used} free download${plural(used)}`;
    title = designCount
      ? `Get this design now, plus ${designCount} more`
      : 'Get this design now with Pro';
    subtitle =
      maxDaily > 0
        ? `Pro members download up to ${maxDaily} designs a day, in every machine format.`
        : 'Pro members get more downloads every day, in every machine format.';
  } else if (isPeriod) {
    pill = `You've used all ${total} downloads this billing period`;
    title = 'Download Limit Reached';
    subtitle =
      'Your downloads refill when your next billing period starts. You can review usage and billing on My Plan.';
  } else {
    pill = `You've used today's ${total} download${plural(total)}`;
    title = 'Daily Download Limit Reached';
    subtitle =
      'Your daily downloads refill automatically. Everything you already downloaded is still available to re-download.';
  }

  const footerText = isFree
    ? resetLabel
      ? `Free downloads reset ${resetLabel}`
      : `Free downloads reset every ${windowEvery}`
    : isPeriod
      ? 'Downloads reset with your next billing period'
      : resetLabel
        ? `Downloads reset ${resetLabel}`
        : 'Downloads reset at midnight (UTC)';

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    const prevFocus = document.activeElement;
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
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
        className='relative max-h-[95vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl outline-none animate-fade-in sm:p-6'
      >
        <button
          type='button'
          onClick={onClose}
          aria-label='Close dialog'
          className='absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900'
        >
          <X className='h-4 w-4' aria-hidden />
        </button>

        {/* ── The design they tried to download ── */}
        {product?.imageUrl && (
          <div className='relative mb-4 aspect-[16/7] w-full overflow-hidden rounded-2xl bg-pink-50'>
            <Image
              src={product.imageUrl}
              alt={product.name || 'Embroidery design'}
              fill
              sizes='(max-width: 480px) 100vw, 420px'
              className='object-contain p-2'
              unoptimized
            />
          </div>
        )}

        {/* ── Header ── */}
        <div className='text-center'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600'>
            <Download className='h-3.5 w-3.5' aria-hidden />
            {pill}
          </span>
          <h2
            id='dl-title'
            className='mt-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900'
          >
            {title}
          </h2>
          <p
            id='dl-desc'
            className='mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500'
          >
            {subtitle}
          </p>
        </div>

        {/* ── Action ── */}
        <div className='mt-5'>
          {isFree ? (
            <UpgradePlanPicker
              plans={plans}
              ctaLabel={
                isExpired
                  ? 'Renew and download this design'
                  : 'Download this design with Pro'
              }
            />
          ) : (
            <button
              type='button'
              onClick={() => {
                onClose?.();
                router.push('/user/my-plan');
              }}
              className='flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-[15px] font-semibold text-white transition hover:bg-black'
            >
              Manage my plan
            </button>
          )}
        </div>

        {/* ── Footer ── */}
        <div className='mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500'>
          <span>{footerText}</span>
          <button
            type='button'
            onClick={onClose}
            className='shrink-0 font-semibold text-pink-700 underline underline-offset-2 hover:text-pink-800'
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadLimitModal;
