'use client';
import { useCountdown } from '@/lib/hooks/countdown';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import {
  formatCountdown,
  formatDate,
  formatWindow,
} from '@/utils/functions/page';
import { Divider } from '@heroui/divider';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MyPlanPage() {
  const { data: userInfoData, isLoading: userLoading } = useUserInfoQuery();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // ─── FIX #1: Keep the subscription as an object, not a boolean ───────────
  // BUG WAS: userInfoData?.subscription ? true : false
  //          This turned the object into `true`, making every subscription?.xxx → undefined
  const subscription = userInfoData?.subscription ?? null;

  // ─── FIX #2: plan lives on subscription.plan, not subscription.planId ────
  // BUG WAS: const plan = subscription?.planId  (planId is an ID string, not the plan object)
  const plan = subscription?.plan ?? null;

  // ✅ USER TYPE
  // ─── FIX #3: These now work correctly because subscription is the real object ─
  // BUG WAS: subscription was `true` (boolean), so subscription.status was always undefined,
  //          isPaidUser was always false, isFreeUser was always true
  const isPaidUser = !!subscription && subscription.status === 'active';
  const isFreeUser = !isPaidUser;
  const isOneTime = isPaidUser && !subscription?.stripeSubscriptionId;
  const isCancelled = subscription?.cancelAtPeriodEnd === true;

  // FREE DATA
  const usedDownloads = userInfoData?.usedDownloads ?? 0;
  const limit = userInfoData?.downloadLimit ?? 0;
  const remaining = userInfoData?.remainingDownloads ?? 0;
  const timeUntilReset = userInfoData?.timeUntilReset ?? 0;
  const timeLeft = useCountdown(timeUntilReset);

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
        <div className='max-w-5xl mx-auto px-6 mt-6'>
          <div className='bg-white border border-slate-100 rounded-2xl p-6 shadow-sm'>
            <h2 className='text-sm font-bold text-slate-700 uppercase tracking-widest mb-4'>
              Free Plan Usage
            </h2>

            <div className='flex items-center justify-between mb-3'>
              <p className='text-lg font-extrabold text-slate-800'>
                {usedDownloads}
                <span className='text-slate-400 text-sm font-normal'>
                  /{limit}
                </span>
              </p>

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  remaining === 0
                    ? 'bg-red-50 text-red-500'
                    : 'bg-violet-50 text-violet-600'
                }`}
              >
                {remaining > 0 ? `${remaining} left` : 'Limit reached'}
              </span>
            </div>

            <div className='w-full bg-slate-100 rounded-full h-2 mb-3'>
              <div
                className={`h-full rounded-full ${
                  limit > 0 && usedDownloads / limit >= 0.9
                    ? 'bg-red-500'
                    : limit > 0 && usedDownloads / limit >= 0.6
                      ? 'bg-amber-400'
                      : 'bg-violet-500'
                }`}
                style={{
                  width: `${
                    limit > 0 ? Math.min((usedDownloads / limit) * 100, 100) : 0
                  }%`,
                }}
              />
            </div>

            <p className='text-sm text-slate-500 mb-2'>
              {limit} downloads per {formatWindow(userInfoData?.downloadWindow)}
            </p>

            <p className='text-xs text-slate-400 mb-4'>
              {timeLeft > 0
                ? `Next download available in ${formatCountdown(timeLeft)}`
                : 'You can download again now'}
            </p>

            {remaining === 0 && (
              <p className='text-xs text-red-500 mb-4 font-medium'>
                You've reached your limit. Upgrade to continue instantly 🚀
              </p>
            )}

            <div className='flex gap-3'>
              <button
                onClick={() => router.push('/subscriptions')}
                className='bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition'
              >
                Upgrade for Unlimited 🚀
              </button>

              <button
                onClick={() => router.push('/products')}
                className='border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm hover:bg-slate-50 transition'
              >
                Browse Designs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FIX #4: Entire paid section gated behind isPaidUser ──────────────
           BUG WAS: Hero, stats, usage bars, billing card all rendered unconditionally.
           Free users saw broken/empty UI since subscription and plan were null.        */}
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
                        {isCancelled ? 'Cancels at period end' : 'Active Plan'}
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
                          ? `Access until ${formatDate(subscription?.periodEndDate)}`
                          : `Billed ${plan?.billingInterval}ly · Renews ${formatDate(subscription?.periodEndDate)}`}
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
                      : 'Renews',
                  value: isCancelled
                    ? formatDate(subscription?.periodEndDate)
                    : isOneTime
                      ? 'Forever'
                      : formatDate(subscription?.periodEndDate),
                  sub: isCancelled
                    ? 'After this, access ends'
                    : isOneTime
                      ? 'No expiry date'
                      : 'Next billing date',
                  color: isCancelled ? 'text-red-500' : 'text-amber-600',
                  dot: isCancelled ? 'bg-red-400' : 'bg-amber-400',
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
                      <p className='text-sm text-slate-600 mt-2'>
                        Daily limit resets at midnight
                      </p>
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
                        Next charge
                      </p>
                      <p className='text-xl font-extrabold text-slate-800 mb-5'>
                        {formatDate(subscription?.periodEndDate)}
                      </p>

                      <Divider className='mb-5 bg-slate-50' />

                      <p className='text-xs text-slate-400 leading-relaxed mb-5'>
                        Manage payment method, download invoices, or cancel your
                        plan via the secure Stripe portal.
                      </p>

                      {error && (
                        <div className='bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4'>
                          <p className='text-xs text-red-500'>{error}</p>
                        </div>
                      )}

                      <button
                        onClick={handleManagePlan}
                        disabled={isRedirecting}
                        className='w-full py-3 rounded-xl text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm shadow-violet-200'
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
