'use client';
import { useDownloadReset } from '@/lib/hooks/useDownloadReset';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import {
  formatCountdown,
  formatDate,
  formatResetTime,
  formatWindow,
} from '@/utils/functions/page';
import { Divider } from '@heroui/divider';
import { Button } from '@heroui/react';
import Cookies from 'js-cookie';
import { Crown, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyPlanPage({ onClose }) {
  const { data: userInfoData, isLoading: userLoading } = useUserInfoQuery();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { currentPlanName } = useDownloadReset({ tickMs: 60_000 });

  const subscription = userInfoData?.subscription ?? null;

  const plan = subscription?.planId ?? null;

  // accessState is computed server-side and is the single label every screen
  // reads. Deriving "is this person subscribed?" from the mere presence of a
  // subscription record is what made this page announce
  // "Active Plan · Renews August 1, 2026" to someone whose plan had already
  // lapsed — the record still existed, it just no longer granted anything.
  const accessState = userInfoData?.accessState;
  const isExpired = accessState === 'expired';
  const isPaymentFailed = accessState === 'payment_failed';
  const isCancelled = accessState === 'cancelling';
  const isOneTime = accessState === 'lifetime';

  // Anyone without premium access sees the free-plan view — someone who never
  // subscribed and someone whose plan ended are both on the free tier. The
  // expired user additionally gets an explanation of what they lost.
  const isPaidUser = ['active', 'cancelling', 'lifetime', 'payment_failed'].includes(
    accessState,
  );
  const isFreeUser = !isPaidUser;

  const endedOn = userInfoData?.subscriptionEndedAt ?? subscription?.periodEndDate;
  const graceEndsOn = userInfoData?.graceEndsAt ?? null;

  const {
    usedDownloads,
    limit,
    remaining,
    isLimitReached,
    isReady,
    msLeft: timeLeft,
  } = useDownloadReset();

  const nextDailyReset = new Date();
  nextDailyReset.setUTCHours(24, 0, 0, 0);
  const dailyResetMsLeft = Math.max(0, nextDailyReset.getTime() - Date.now());
  const dailyResetLabel = (() => {
    const label = formatResetTime(nextDailyReset);
    return label ? label.charAt(0).toLowerCase() + label.slice(1) : '';
  })();

  // PAID DATA
  const usagePercent =
    plan?.downloadLimit > 0
      ? Math.min(
          Math.round(
            ((subscription?.downloadCount || 0) / plan.downloadLimit) * 100,
          ),
          100,
        )
      : null;

  const dailyUsagePercent =
    plan?.dailyLimit > 0
      ? Math.min(
          Math.round(
            ((subscription?.dailyDownloadCount || 0) / plan.dailyLimit) * 100,
          ),
          100,
        )
      : null;

  const dailyBarColor =
    dailyUsagePercent >= 90
      ? 'bg-red-500'
      : dailyUsagePercent >= 60
        ? 'bg-amber-400'
        : 'bg-violet-500';

  const goToUpgrade = () => {
    setIsUpgrading(true);
    router.push('/subscriptions');
  };

  const [tiers, setTiers] = useState([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/subscriptions`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const plans = data?.data?.plans ?? [];
        if (active) setTiers(plans);
      } catch {
        // Non-critical — the modal still works without the upgrade grid.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Per-month download history (aggregated from the download log — gateway
  // agnostic, so it works the same for Stripe and Creem subscribers).
  const userId = userInfoData?._id;
  const [monthly, setMonthly] = useState(null);
  useEffect(() => {
    if (!userId || !isPaidUser) return;
    let active = true;
    (async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/downloads/user/${userId}/monthly?months=6`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active) setMonthly(data?.data || null);
      } catch {
        // Non-critical — the plan page still renders without the history card.
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, isPaidUser]);

  const handleManagePlan = async () => {
    setIsRedirecting(true);
    setError(null);

    try {
      const token = Cookies.get('token');

      if (!token) {
        router.push('/auth/login?pathName=/user/myplan');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/subscriptions/manage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to open billing portal');
      }

      const data = await response.json();
      const portalUrl = data?.data?.url;

      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        throw new Error('No portal URL received.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      setIsRedirecting(false);
    }
  };

  // ─── Loading ──────────────────────────────────────
  if (userLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-10 h-10 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin' />
          <p className='text-slate-400 text-sm'>Loading your plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      {/* ── FREE USER BLOCK ─────────────────────────────────────────────────── */}
      {isFreeUser && (
        <div className='max-w-5xl mx-auto px-6 mt-6 space-y-6'>
          {/* A lapsed subscriber lands here too. Without this they'd simply see
              the free-plan view with no explanation of where their plan went. */}
          {isExpired && (
            <div className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm'>
              <div className='flex items-start gap-4'>
                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700'>
                  <Crown className='h-5 w-5' aria-hidden />
                </span>
                <div className='flex-1'>
                  <p className='text-base font-bold text-slate-900'>
                    Your {plan?.name || 'subscription'} plan has ended
                  </p>
                  <p className='mt-1 text-sm leading-relaxed text-slate-600'>
                    {endedOn
                      ? `It ended on ${formatDate(endedOn)}, so premium designs aren't included any more. `
                      : "Premium designs aren't included any more. "}
                    You&apos;re on the free plan below — and everything you
                    downloaded while subscribed is still yours to re-download,
                    free, any time.
                  </p>
                  <Button
                    onPress={goToUpgrade}
                    isLoading={isUpgrading}
                    className='mt-4 h-11 rounded-xl bg-slate-900 px-6 font-semibold text-white hover:bg-black'
                  >
                    Renew my plan
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className='bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6'>
            {/* Header */}
            <h2 className='text-xs font-bold text-slate-500 uppercase tracking-widest'>
              Free Plan Usage
            </h2>

            {/* Usage */}
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-extrabold text-slate-900'>
                  {usedDownloads}
                  <span className='text-slate-400 text-sm ml-1'>/{limit}</span>
                </p>
                <p className='text-xs text-slate-400'>
                  {limit} downloads /{' '}
                  {formatWindow(userInfoData?.downloadWindow)}
                </p>
              </div>

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  remaining === 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-violet-100 text-violet-700'
                }`}
              >
                {remaining > 0 ? `${remaining} left` : 'Limit reached'}
              </span>
            </div>

            {/* Progress */}
            <div className='w-full bg-slate-100 rounded-full h-2 overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usedDownloads / limit >= 0.9
                    ? 'bg-red-500'
                    : usedDownloads / limit >= 0.6
                      ? 'bg-amber-400'
                      : 'bg-violet-500'
                }`}
                style={{
                  width: `${Math.min((usedDownloads / limit) * 100, 100)}%`,
                }}
              />
            </div>

            {/* 🔥 VISUAL COUNTDOWN BLOCK */}
            <div
              className={`rounded-2xl p-5 text-center border ${
                isLimitReached
                  ? 'bg-gradient-to-br from-red-50 to-white border-red-200'
                  : 'bg-gradient-to-br from-green-50 to-white border-green-200'
              }`}
            >
              {isLimitReached ? (
                <>
                  <div className='text-red-500 text-sm font-semibold mb-1'>
                    Download Locked
                  </div>

                  {/* BIG COUNTDOWN */}
                  <div className='text-3xl font-extrabold text-red-600 tracking-wide animate-pulse'>
                    {formatCountdown(timeLeft)}
                  </div>

                  <p className='text-xs text-slate-500 mt-1'>
                    Next download available in
                  </p>

                  {/* Glow ring effect */}
                  <div className='mt-4 flex justify-center'>
                    <div className='w-20 h-20 rounded-full border-4 border-red-200 flex items-center justify-center shadow-inner animate-pulse'>
                      ⏳
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='text-green-600 text-sm font-semibold mb-1'>
                    Ready to Download 🎉
                  </div>

                  <div className='text-lg font-bold text-green-700'>
                    No waiting — go ahead!
                  </div>
                </>
              )}
            </div>

            {/* CTA */}
            {remaining === 0 && (
              <div className='text-center space-y-3'>
                <p className='text-lg text-red-500 font-medium'>
                  Skip the wait and download instantly 🚀
                </p>
              </div>
            )}

            {/* ── Upgrade tiers ── */}
            <div>
              <div className='grid grid-cols-3 gap-2.5'>
                {tiers.length > 0 &&
                  tiers.map((tier) => {
                    const isCurrent =
                      currentPlanName?.toLowerCase() ===
                      tier.name.toLowerCase();
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
            </div>

            {/* ── CTAs ── */}
            <div className='mt-6 space-y-2'>
              <Button
                onPress={goToUpgrade}
                isLoading={isUpgrading}
                aria-label='Upgrade now'
                className='h-12 w-full rounded-xl bg-green-600 text-base font-semibold text-white hover:bg-green-700'
                startContent={
                  !isUpgrading ? (
                    <Crown
                      className='h-4 w-4'
                      fill='currentColor'
                      aria-hidden
                    />
                  ) : null
                }
              >
                Upgrade Now
              </Button>

              {/*  Browse Designs */}
              <button
                onClick={() => router.push('/products')}
                className='w-full rounded-xl py-2.5 text-sm  h-12 font-semibold text-gray-600 bg-gray-50 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'
              >
                Browse Designs
              </button>
            </div>
          </div>
        </div>
      )}

      {isPaidUser && (
        <>
          {/* ── HERO ── */}
          <div
            className={`bg-gradient-to-br ${
              isCancelled
                ? 'from-orange-500 via-orange-600 to-red-700'
                : 'from-violet-600 via-violet-700 to-indigo-800'
            }`}
          >
            <div className='max-w-5xl mx-auto px-6 py-14'>
              {/* Payment-failed banner. They still have access — this is the
                  window in which updating a card costs them nothing. */}
              {isPaymentFailed && (
                <div className='bg-white/10 border border-white/20 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3'>
                  <span className='text-xl flex-shrink-0'>⚠️</span>
                  <div className='flex-1'>
                    <p className='text-white font-bold text-sm'>
                      Your last payment didn&apos;t go through
                    </p>
                    <p className='text-orange-100 text-xs mt-0.5 leading-relaxed'>
                      We&apos;re retrying your card automatically. Your downloads
                      are still working
                      {graceEndsOn ? (
                        <>
                          {' '}
                          until{' '}
                          <span className='font-bold text-white'>
                            {formatDate(graceEndsOn)}
                          </span>
                        </>
                      ) : null}
                      . Update your payment details to avoid any interruption.
                    </p>
                    <button
                      onClick={handleManagePlan}
                      disabled={isRedirecting}
                      className='mt-3 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 disabled:opacity-60'
                    >
                      {isRedirecting ? 'Redirecting…' : 'Update payment method'}
                    </button>
                  </div>
                </div>
              )}

              {/* Cancellation warning banner */}
              {isCancelled && (
                <div className='bg-white/10 border border-white/20 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3'>
                  <span className='text-xl flex-shrink-0'>⚠️</span>
                  <div>
                    <p className='text-white font-bold text-sm'>
                      Subscription Cancelled
                    </p>
                    <p className='text-orange-100 text-xs mt-0.5 leading-relaxed'>
                      You still have full access until{' '}
                      <span className='font-bold text-white'>
                        {formatDate(subscription?.periodEndDate)}
                      </span>
                      . After that, your plan will expire and downloads will
                      stop.
                    </p>
                  </div>
                </div>
              )}

              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
                {/* Left */}
                <div className='flex items-center gap-5'>
                  <div className='w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm'>
                    <span className='text-2xl font-black text-white'>
                      {plan?.name?.[0] ?? 'P'}
                    </span>
                  </div>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <span
                        className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-orange-300' : 'bg-emerald-400'}`}
                      />
                      <span
                        className={`text-xs font-semibold uppercase tracking-widest ${isCancelled ? 'text-orange-200' : 'text-violet-200'}`}
                      >
                        {isCancelled
                          ? 'Cancels at period end'
                          : isPaymentFailed
                            ? 'Payment failed'
                            : 'Active Plan'}
                      </span>
                    </div>
                    <h1 className='text-2xl md:text-3xl font-extrabold text-white tracking-tight'>
                      {plan?.name ?? 'My Plan'}
                    </h1>
                    <p
                      className={`text-sm mt-1 ${isCancelled ? 'text-orange-200' : 'text-violet-300'}`}
                    >
                      {isOneTime
                        ? 'One-time payment · Lifetime access'
                        : isCancelled
                          ? `Access until ${formatDate(endedOn)}`
                          : isPaymentFailed
                            ? `Payment overdue · Update your card${graceEndsOn ? ` by ${formatDate(graceEndsOn)}` : ''}`
                            : `Billed ${plan?.billingInterval}ly · Renews ${formatDate(endedOn)}`}
                    </p>
                  </div>
                </div>

                {/* Right — price */}
                <div className='bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-7 py-4 text-center md:text-right'>
                  <p className='text-3xl font-extrabold text-white'>
                    {plan?.price != null ? `$${plan.price}` : 'Free'}
                  </p>
                  <p
                    className={`text-xs mt-1 ${isCancelled ? 'text-orange-200' : 'text-violet-300'}`}
                  >
                    {isOneTime
                      ? 'one-time payment'
                      : `per ${plan?.billingInterval}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── FLOATING STATS ──────────────────────────────────────── */}
          <div className='max-w-5xl mx-auto px-6'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 -mt-7'>
              {[
                {
                  label: 'Total Downloads',
                  value: subscription?.downloadCount,
                  sub: plan?.downloadLimit
                    ? `of ${plan.downloadLimit}`
                    : 'Unlimited',
                  color: 'text-violet-600',
                  dot: 'bg-violet-400',
                },
                {
                  label: "Today's Downloads",
                  value: subscription?.dailyDownloadCount,
                  sub: plan?.dailyLimit
                    ? `of ${plan.dailyLimit} today`
                    : 'Unlimited',
                  color: 'text-indigo-600',
                  dot: 'bg-indigo-400',
                },
                {
                  label: 'Plan Type',
                  value: isOneTime ? 'One-time' : 'Recurring',
                  sub: isOneTime
                    ? 'Lifetime access'
                    : `${plan?.billingInterval}ly billing`,
                  color: 'text-emerald-600',
                  dot: 'bg-emerald-400',
                },
                {
                  label: isCancelled
                    ? 'Expires'
                    : isOneTime
                      ? 'Access'
                      : isPaymentFailed
                        ? 'Access ends'
                        : 'Renews',
                  value: isOneTime
                    ? 'Forever'
                    : isPaymentFailed
                      ? formatDate(graceEndsOn) || formatDate(endedOn)
                      : formatDate(endedOn),
                  sub: isCancelled
                    ? 'After this, access ends'
                    : isOneTime
                      ? 'No expiry date'
                      : isPaymentFailed
                        ? 'Unless payment succeeds'
                        : 'Next billing date',
                  color:
                    isCancelled || isPaymentFailed ? 'text-red-500' : 'text-amber-600',
                  dot: isCancelled || isPaymentFailed ? 'bg-red-400' : 'bg-amber-400',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className='bg-white border border-slate-100 rounded-2xl px-5 py-5 shadow-md hover:shadow-lg transition-shadow duration-200'
                >
                  <div className='flex items-center gap-1.5 mb-3'>
                    <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                    <p className='text-sm text-slate-600 font-semibold uppercase tracking-wider'>
                      {stat.label}
                    </p>
                  </div>
                  <p
                    className={`text-xl font-extrabold ${stat.color} leading-tight`}
                  >
                    {stat.value}
                  </p>
                  <p className='text-sm text-slate-600 mt-1'>{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN GRID ───────────────────────────────────────────── */}
          <div className='max-w-5xl mx-auto px-6 py-8'>
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
              {/* ── LEFT 3/5 ─────────────────────────────────────── */}
              <div className='lg:col-span-3 space-y-5'>
                {/* Usage card */}
                <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm'>
                  <div className='px-6 py-4 border-b border-slate-50 flex items-center justify-between'>
                    <h2 className='text-sm font-bold text-slate-700 uppercase tracking-widest'>
                      Usage Overview
                    </h2>
                    <span className='text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full'>
                      Resets{' '}
                      {isOneTime ? 'never' : `each ${plan?.billingInterval}`}
                    </span>
                  </div>

                  <div className='p-6 space-y-7'>
                    {/* Overall */}
                    <div>
                      <div className='flex justify-between items-end mb-3'>
                        <div>
                          <p className='text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1'>
                            Total Downloads
                          </p>
                          <p className='text-2xl font-extrabold text-slate-800'>
                            {subscription?.downloadCount}
                            {plan?.downloadLimit && (
                              <span className='text-slate-500 text-base font-normal'>
                                /{plan.downloadLimit}
                              </span>
                            )}
                          </p>
                        </div>
                        {usagePercent !== null ? (
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              usagePercent >= 90
                                ? 'bg-red-50 text-red-500'
                                : 'bg-violet-50 text-violet-600'
                            }`}
                          >
                            {usagePercent}% used
                          </span>
                        ) : (
                          <span className='text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600'>
                            Unlimited
                          </span>
                        )}
                      </div>
                      <div className='w-full bg-slate-100 rounded-full h-2 overflow-hidden'>
                        {usagePercent !== null ? (
                          <div
                            className='h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700'
                            style={{ width: `${usagePercent}%` }}
                          />
                        ) : (
                          <div className='h-full bg-gradient-to-r from-violet-300 to-indigo-300 w-full rounded-full' />
                        )}
                      </div>
                    </div>

                    <Divider className='bg-slate-50' />

                    {/* Daily */}
                    <div>
                      <div className='flex justify-between items-end mb-3'>
                        <div>
                          <p className='text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1'>
                            Today's Downloads
                          </p>
                          <p className='text-2xl font-extrabold text-slate-800'>
                            {subscription?.dailyDownloadCount}
                            {plan?.dailyLimit && (
                              <span className='text-slate-500 text-base font-normal'>
                                /{plan.dailyLimit}
                              </span>
                            )}
                          </p>
                        </div>
                        {dailyUsagePercent !== null ? (
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              dailyUsagePercent >= 90
                                ? 'bg-red-50 text-red-500'
                                : dailyUsagePercent >= 60
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-indigo-50 text-indigo-600'
                            }`}
                          >
                            {dailyUsagePercent}% used
                          </span>
                        ) : (
                          <span className='text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600'>
                            Unlimited
                          </span>
                        )}
                      </div>
                      <div className='w-full bg-slate-100 rounded-full h-2 overflow-hidden'>
                        {dailyUsagePercent !== null ? (
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${dailyBarColor}`}
                            style={{ width: `${dailyUsagePercent}%` }}
                          />
                        ) : (
                          <div className='h-full bg-gradient-to-r from-indigo-300 to-violet-300 w-full rounded-full' />
                        )}
                      </div>
                      {dailyUsagePercent !== null && (
                        <div className='flex flex-wrap items-center justify-between gap-2 mt-2'>
                          <p className='text-sm text-slate-600'>
                            Daily limit resets {dailyResetLabel}
                          </p>
                          {isReady && (
                            <span className='text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 tabular-nums'>
                              ⏳ {formatCountdown(dailyResetMsLeft)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                {plan?.features?.length > 0 && (
                  <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm'>
                    <div className='px-6 py-4 border-b border-slate-50'>
                      <h2 className='text-sm font-bold text-slate-700 uppercase tracking-widest'>
                        What's Included
                      </h2>
                    </div>
                    <div className='p-6'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
                        {[
                          ...plan.features,
                          ...(plan.dailyLimit
                            ? [`${plan.dailyLimit} daily file downloads`]
                            : []),
                        ].map((feature, idx) => (
                          <div
                            key={idx}
                            className='group flex items-center gap-3 bg-slate-50 hover:bg-violet-600 border border-slate-100 hover:border-violet-600 rounded-xl px-4 py-3 transition-all duration-200 cursor-default'
                          >
                            <span className='w-5 h-5 rounded-full bg-violet-100 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors duration-200'>
                              <span className='text-violet-600 group-hover:text-white text-xs transition-colors duration-200'>
                                ✓
                              </span>
                            </span>
                            <span className='text-sm font-medium text-slate-700 group-hover:text-white transition-colors duration-200'>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Downloads by month — history from the download log (works
                    the same whether billed through Stripe or Creem). */}
                {monthly && monthly.months?.some((m) => m.count > 0) && (
                  <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm'>
                    <div className='px-6 py-4 border-b border-slate-50'>
                      <h2 className='text-sm font-bold text-slate-700 uppercase tracking-widest'>
                        Downloads by Month
                      </h2>
                    </div>
                    <div className='p-6 space-y-2.5'>
                      {(() => {
                        const max = Math.max(
                          1,
                          ...monthly.months.map((m) => m.count),
                        );
                        return monthly.months.map((m) => (
                          <div
                            key={m.month}
                            className='flex items-center gap-3'
                          >
                            <span className='text-xs text-slate-500 w-16 shrink-0'>
                              {m.label}
                            </span>
                            <div className='flex-1 h-2 bg-slate-100 rounded-full overflow-hidden'>
                              <div
                                className='h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500'
                                style={{ width: `${(m.count / max) * 100}%` }}
                              />
                            </div>
                            <span className='text-xs font-bold text-slate-700 w-8 text-right shrink-0 tabular-nums'>
                              {m.count}
                            </span>
                          </div>
                        ));
                      })()}
                      <div className='flex justify-between pt-1 text-xs text-slate-400'>
                        <span>Last {monthly.months.length} months</span>
                        <span className='font-bold text-slate-600'>
                          {monthly.total} total
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT 2/5 ────────────────────────────────────── */}
              <div className='lg:col-span-2 space-y-5'>
                {/* Billing / Lifetime / Cancelled */}
                {isOneTime ? (
                  <div className='bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl p-6'>
                    <div className='w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-5 text-2xl'>
                      ∞
                    </div>
                    <h3 className='text-violet-200 text-lg font-extrabold mb-2'>
                      Lifetime Access
                    </h3>
                    <p className='text-violet-200 text-sm leading-relaxed mb-5'>
                      You made a one-time payment. Your access never expires and
                      you'll never be charged again.
                    </p>
                    <div className='bg-white/10 border border-white/10 rounded-xl px-4 py-3'>
                      <p className='text-xs text-violet-200 uppercase tracking-widest mb-0.5'>
                        Payment type
                      </p>
                      <p className='text-violet-200 text-sm font-bold'>
                        One-time · No renewals
                      </p>
                    </div>
                  </div>
                ) : isCancelled ? (
                  <div className='bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm'>
                    <div className='px-6 py-4 border-b border-orange-50 bg-orange-50'>
                      <h2 className='text-sm font-bold text-orange-700 uppercase tracking-widest'>
                        Subscription Cancelled
                      </h2>
                    </div>
                    <div className='p-6'>
                      <p className='text-xs text-slate-400 uppercase tracking-wider mb-1'>
                        Access ends on
                      </p>
                      <p className='text-xl font-extrabold text-red-500 mb-2'>
                        {formatDate(subscription?.periodEndDate)}
                      </p>
                      <p className='text-xs text-slate-400 leading-relaxed mb-5'>
                        You cancelled your subscription. You still have full
                        access until the date above. Resubscribe anytime to keep
                        your downloads going.
                      </p>

                      <Divider className='mb-5 bg-slate-50' />

                      <button
                        onClick={handleManagePlan}
                        disabled={isRedirecting}
                        className='w-full py-3 rounded-xl text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm shadow-violet-200 mb-3'
                      >
                        {isRedirecting ? (
                          <span className='flex items-center justify-center gap-2'>
                            <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
                            Redirecting...
                          </span>
                        ) : (
                          'Resubscribe →'
                        )}
                      </button>

                      {error && (
                        <div className='bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
                          <p className='text-xs text-red-500'>{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Active recurring billing card
                  <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm'>
                    <div className='px-6 py-4 border-b border-slate-50'>
                      <h2 className='text-sm font-bold text-slate-700 uppercase tracking-widest'>
                        Billing
                      </h2>
                    </div>
                    <div className='p-6'>
                      <p className='text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1'>
                        {isPaymentFailed ? 'Payment overdue' : 'Next charge'}
                      </p>
                      <p
                        className={`text-xl font-extrabold mb-5 ${
                          isPaymentFailed ? 'text-red-600' : 'text-slate-800'
                        }`}
                      >
                        {formatDate(endedOn)}
                      </p>
                      {isPaymentFailed && (
                        <p className='-mt-3 mb-5 text-xs leading-relaxed text-red-600'>
                          We couldn&apos;t take this payment. Update your card to
                          keep your plan
                          {graceEndsOn ? ` — access ends ${formatDate(graceEndsOn)}` : ''}
                          .
                        </p>
                      )}

                      <Divider className='mb-5 bg-slate-50' />

                      <p className='text-xs text-slate-400 leading-relaxed mb-5'>
                        Manage payment method, download invoices, or cancel your
                        plan via the secure billing portal.
                      </p>

                      {error && (
                        <div className='bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4'>
                          <p className='text-xs text-red-500'>{error}</p>
                        </div>
                      )}

                      <button
                        onClick={handleManagePlan}
                        disabled={isRedirecting}
                        className='w-full py-3 rounded-xl text-sm font-bold bg-violet-600 text-white hover:bg-black transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm shadow-violet-200'
                      >
                        {isRedirecting ? (
                          <span className='flex items-center justify-center gap-2'>
                            <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
                            Redirecting...
                          </span>
                        ) : (
                          'Manage Billing →'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick links */}
                <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm'>
                  <div className='px-6 py-4 border-b border-slate-50'>
                    <h2 className='text-sm font-bold text-slate-700 uppercase tracking-widest'>
                      Quick Links
                    </h2>
                  </div>
                  <div className='divide-y divide-slate-50'>
                    {[
                      {
                        label: 'Browse Designs',
                        path: '/products',
                        icon: '🧵',
                        color: 'text-violet-600',
                      },
                      {
                        label: 'View All Plans',
                        path: '/subscriptions',
                        icon: '📋',
                        color: 'text-indigo-600',
                      },
                      {
                        label: 'Download History',
                        path: '/user/user-details?tabName=downloads',
                        icon: '📥',
                        color: 'text-emerald-600',
                      },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className='w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors duration-150 group'
                      >
                        <div className='flex items-center gap-3'>
                          <span className='text-base'>{item.icon}</span>
                          <span
                            className={`text-sm font-medium text-slate-600 group-hover:${item.color} transition-colors`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span className='text-slate-300 group-hover:text-violet-500 transition-colors text-sm'>
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
