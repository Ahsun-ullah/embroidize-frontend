'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import PurchaseButton from '@/components/Common/PurchaseButton';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { Divider } from '@heroui/divider';
import { GiftIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/* One-Time Payment — diamond/gem (premium one-time investment) */
const OneTimeIcon = () => (
  <svg
    width='34'
    height='34'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M6 3h12l4 6-10 12L2 9z' />
    <path d='M11 3L8 9l4 12 4-12-3-6' />
    <line x1='2' y1='9' x2='22' y2='9' />
  </svg>
);

/* Yearly Premium — crown (best value, top tier) */
const YearlyIcon = () => (
  <svg
    width='34'
    height='34'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 7l3.5 10h11L21 7l-5 4-4-7-4 7-5-4z' />
    <line x1='5' y1='20' x2='19' y2='20' />
    <circle cx='12' cy='4' r='1' fill='currentColor' />
    <circle cx='3' cy='7' r='1' fill='currentColor' />
    <circle cx='21' cy='7' r='1' fill='currentColor' />
  </svg>
);

/* Monthly Pro — refresh cycle (recurring monthly) */
const MonthlyIcon = () => (
  <svg
    width='34'
    height='34'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M21 12a9 9 0 0 1-15.5 6.3L3 16' />
    <path d='M3 12a9 9 0 0 1 15.5-6.3L21 8' />
    <polyline points='21 3 21 8 16 8' />
    <polyline points='3 21 3 16 8 16' />
  </svg>
);
const CheckCircle = () => (
  <svg width='18' height='18' viewBox='0 0 24 24'>
    <circle cx='12' cy='12' r='11' fill='currentColor' />
    <path
      d='M7 12.5l3 3 7-7'
      stroke='white'
      strokeWidth='2.4'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
const ClockIcon = () => (
  <svg
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='12' cy='12' r='10' />
    <polyline points='12 6 12 12 16 14' />
  </svg>
);
const ShieldIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
  </svg>
);
const StarFilled = () => (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='currentColor'>
    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
  </svg>
);
const RefreshIcon = () => (
  <svg
    width='34'
    height='34'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.4'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polyline points='23 4 23 10 17 10' />
    <polyline points='1 20 1 14 7 14' />
    <path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
  </svg>
);
const HeadsetIcon = () => (
  <svg
    width='34'
    height='34'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.4'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 18v-6a9 9 0 0 1 18 0v6' />
    <path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z' />
  </svg>
);
const PeopleIcon = () => (
  <svg
    width='34'
    height='34'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.4'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
  </svg>
);

/* ---------- Derive display info from billingInterval ---------- */
const getPlanDisplay = (plan) => {
  const i = (plan.billingInterval || '').toLowerCase();
  if (!i) {
    return {
      icon: <OneTimeIcon />,
      subtitle: 'Lifetime Access',
      pill: 'One-Time Payment',
      priceSuffix: '',
      priceLabel: 'One-time payment',
      ctaTitle: `Get ${plan.name}`,
      ctaSub: 'One-time payment',
    };
  }
  if (i.startsWith('year')) {
    return {
      icon: <YearlyIcon />,
      subtitle: 'Best Value',
      pill: 'Billed yearly',
      priceSuffix: '/year',
      priceLabel: 'Billed yearly',
      ctaTitle: `Start ${plan.name}`,
      ctaSub: 'Billed yearly',
    };
  }
  return {
    icon: <MonthlyIcon />,
    subtitle: 'Flexible Choice',
    pill: 'Billed monthly',
    priceSuffix: '/month',
    priceLabel: 'Billed monthly',
    ctaTitle: `Start ${plan.name}`,
    ctaSub: 'Billed monthly',
  };
};

const getStaticDefaults = (plan) => {
  let savePercent = 0;

  if (plan?.billingInterval === null) savePercent = plan?.savePercent ?? '';
  else if (plan?.billingInterval === 'year')
    savePercent = plan?.savePercent ?? '';
  else if (plan?.billingInterval === 'month')
    savePercent = plan?.savePercent ?? '';

  const originalPrice = (Number(plan.price) / (1 - savePercent / 100)).toFixed(
    2,
  );

  return {
    savePercent,
    originalPrice: Number(originalPrice),
  };
};

export default function SubscriptionsPageClient() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathName = usePathname();
  const router = useRouter();
  const { data: userInfoData } = useUserInfoQuery();
  // A subscription only counts as "active" while its status grants access.
  // /userinfo keeps returning the subscription doc after a Stripe-portal
  // cancellation (status 'canceled', pointer never nulled), so checking mere
  // existence would show the dead plan as "Active" forever and block
  // re-subscribing. Statuses mirror the backend's accessStatuses list.
  const ACCESS_STATUSES = ['active', 'trialing', 'past_due'];
  const sub = userInfoData?.subscription;
  const activePlanId =
    sub && ACCESS_STATUSES.includes(sub.status)
      ? (sub.planId?._id ?? null)
      : null;
  // Free-plan card state:
  //  - guest (not registered)          → nothing is "active"; CTA → /auth/register
  //  - registered, no live subscription (none, canceled, or expired)
  //                                    → Free plan shows as the active plan
  //  - registered with live subscription → the paid plan shows active instead
  const isLoggedIn = Boolean(userInfoData?.email || userInfoData?._id);
  const isFreeActive = isLoggedIn && !activePlanId;

  // Define the order you want plans to appear in
  const PLAN_ORDER = ['one-time', 'year', 'month'];

  const sortPlans = (plans) => {
    return [...plans].sort((a, b) => {
      const getOrderKey = (plan) => {
        if (!plan.billingInterval) return 'one-time';
        return plan.billingInterval.toLowerCase();
      };
      return (
        PLAN_ORDER.indexOf(getOrderKey(a)) - PLAN_ORDER.indexOf(getOrderKey(b))
      );
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get('status');
    const redirect = searchParams.get('redirect');

    // Stash a post-subscribe return path (e.g. the premium product the user
    // came from). sessionStorage survives the Stripe checkout round-trip so we
    // can send them back after payment completes.
    if (redirect) {
      sessionStorage.setItem('postSubscribeRedirect', redirect);
    }

    if (status === 'success') {
      SuccessToast('Success', 'Payment completed successfully!', 10000);
      const returnTo = sessionStorage.getItem('postSubscribeRedirect');
      sessionStorage.removeItem('postSubscribeRedirect');
      router.push(returnTo || '/subscriptions');
    } else if (status === 'cancelled') {
      ErrorToast('Cancelled', 'Payment was cancelled.', 10000);
    }
  }, [pathName]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/subscriptions`,
        );
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(sortPlans(data.data.plans ?? [])); // ← sort here
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const [dailyResetTime, setDailyResetTime] = useState('Loading...');

  useEffect(() => {
    const DEADLINE = new Date();
    DEADLINE.setHours(23, 59, 59, 999);

    const updateCountdown = () => {
      const now = new Date();
      const diff = DEADLINE.getTime() - now.getTime();

      if (diff <= 0) {
        setDailyResetTime('Offer ended');
        return;
      }

      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setDailyResetTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <>
        <Header />
        <div className='min-h-screen flex items-center justify-center bg-[#F5F5F7]'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin' />
            <p className='text-gray-500 text-sm'>Loading plans...</p>
          </div>
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className='min-h-screen flex items-center justify-center bg-[#F5F5F7]'>
          <div className='text-center'>
            <p className='text-red-500 font-semibold text-lg'>
              Something went wrong
            </p>
            <p className='text-gray-400 text-sm mt-1'>{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      <div className='min-h-screen bg-[#F5F5F7] py-12 pb-20 px-4 relative overflow-hidden'>
        {/* Page heading — add above the pricing grid */}
        <div className='text-center mb-8 max-w-2xl mx-auto'>
          <h1 className='text-3xl md:text-4xl font-extrabold text-black tracking-tight'>
            Choose Your Plan
          </h1>
          <p className='mt-3 text-gray-600 text-sm md:text-base'>
            Get instant access to premium embroidery designs in every format.
            Commercial use included, cancel anytime.
          </p>
        </div>

        <div className='max-w-7xl mx-auto relative z-10 items-center'>
          {plans.length === 0 ? (
            <div className='text-center py-24 border border-gray-200 rounded-xl bg-white'>
              <p className='text-gray-400 text-lg'>No plans available yet.</p>
              <p className='text-gray-300 text-sm mt-1'>
                Check back soon for new offers.
              </p>
            </div>
          ) : (
            <>
              {/* ONE container for all cards → centered, equal height, consistent */}
              <div className='w-full flex flex-wrap justify-center items-stretch gap-6 mb-8'>
                {/* ---------- STATIC FREE PLAN CARD ---------- */}
                <div
                  className={`w-full max-w-sm md:w-[360px] relative bg-white rounded-3xl shadow-lg p-7 pt-8 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    isFreeActive ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {/* Badge: "Active Plan" for registered free users, otherwise a neutral starter badge */}
                  {isFreeActive ? (
                    <div className='absolute -top-4 left-1/2 -translate-x-1/2 z-20'>
                      <span className='bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap'>
                        ✓ Active Plan
                      </span>
                    </div>
                  ) : (
                    <div className='absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap'>
                      <StarFilled />
                      Best For Starter
                    </div>
                  )}

                  {/* Header: icon + title */}
                  <div className='flex items-start gap-4 mb-5'>
                    <div className='w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-black flex-shrink-0'>
                      <GiftIcon
                        width='34'
                        height='34'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.6'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </div>
                    <div className='pt-1'>
                      <h2 className='text-xl font-bold text-black '>
                        Free Forever
                      </h2>
                      <p className='text-sm text-gray-600 mt-1'>
                        For Life Time
                      </p>
                    </div>
                  </div>

                  {/* Price row */}
                  <div className='flex items-start justify-between mb-5'>
                    <div>
                      <div className='flex items-baseline gap-2 flex-wrap'>
                        <span className='text-4xl font-extrabold text-black tracking-tight'>
                          $0
                        </span>
                        <span className='text-sm text-gray-500'>
                          / Forever Free
                        </span>
                        <span className='inline-block mt-2 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full'>
                          No Billing
                        </span>
                      </div>
                    </div>
                    <div className='bg-gray-100 rounded-xl px-4 py-2 text-center min-w-[80px]'>
                      <div className='text-2xl font-bold text-black leading-none'>
                        5
                      </div>
                      <div className='text-[10px] text-gray-600 mt-1 leading-tight'>
                        Downloads
                        <br />
                        per day
                      </div>
                    </div>
                  </div>

                  {/* Tagline box */}
                  <div className='bg-gray-100 rounded-xl px-4 py-4 mb-5 text-center gap-3'>
                    Perfect for trying out Embroidize!
                  </div>

                  {/* Features list */}
                  <ul className='space-y-2.5 mb-6 flex-1'>
                    {[
                      '5 Downloads per day',
                      'Access For Life Time new designs',
                      'All Design Formats',
                      'Personal Use Only',
                      'On Demand support',
                      'No Credit Card Required',
                    ].map((f) => (
                      <li
                        key={f}
                        className='flex items-start gap-2.5 text-sm text-gray-700'
                      >
                        <span className='text-black flex-shrink-0 mt-0.5'>
                          <CheckCircle />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA — mirrors PurchaseButton's states */}
                  {isFreeActive ? (
                    <button
                      disabled
                      className='w-full py-3.5 px-4 rounded-xl bg-green-500 text-white cursor-not-allowed flex flex-col items-center justify-center gap-0.5'
                    >
                      <span className='font-semibold text-sm flex items-center gap-2'>
                        <span className='text-white'>✓</span>
                        Active Plan
                      </span>
                      <span className='text-xs text-green-100'>
                        You are on the free plan
                      </span>
                    </button>
                  ) : isLoggedIn ? (
                    <button
                      disabled
                      className='w-full py-3.5 px-4 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center'
                    >
                      <span className='font-semibold text-sm'>
                        Included in your plan
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/auth/register')}
                      className='w-full py-5 px-4 rounded-xl bg-black text-white hover:bg-gray-900 active:scale-[0.99] transition-all duration-200 flex items-center justify-center'
                    >
                      <span className='font-semibold text-base leading-tight'>
                        Start Free Now
                      </span>
                    </button>
                  )}

                  {/* Footer trust row */}
                  <div className='flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100'>
                    <div className='flex items-center gap-1.5 text-xs text-gray-600'>
                      <ShieldIcon /> No Payment Required
                    </div>
                  </div>
                </div>

                {/* ---------- DYNAMIC PRICING CARDS ---------- */}
                {plans.map((plan) => {
                  const isActivePlan = activePlanId === plan._id;
                  const isPopular = (plan.billingInterval || '')
                    .toLowerCase()
                    .startsWith('year');
                  const d = getPlanDisplay(plan);
                  const staticVals = getStaticDefaults(plan);
                  const savings = plan.savePercent ?? staticVals.savePercent;
                  const originalPrice =
                    plan.originalPrice ?? staticVals.originalPrice;

                  return (
                    <div
                      key={plan._id}
                      className={`w-full max-w-sm md:w-[360px] relative bg-white rounded-3xl shadow-lg p-7 pt-8 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                        isPopular ? 'md:scale-[1.02] ring-1 ring-black/5' : ''
                      } ${isActivePlan ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {/* MOST POPULAR badge */}
                      {isPopular && !isActivePlan && (
                        <div className='absolute -top-4 left-1/2 -translate-x-1/2 z-20'>
                          <span className='bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md whitespace-nowrap'>
                            <StarFilled />
                            MOST POPULAR
                          </span>
                        </div>
                      )}
                      {/* Active Plan badge */}
                      {isActivePlan && (
                        <div className='absolute -top-4 left-1/2 -translate-x-1/2 z-20'>
                          <span className='bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap'>
                            ✓ Active Plan
                          </span>
                        </div>
                      )}

                      {/* SAVE ribbon */}
                      {savings && (
                        <div
                          className='absolute top-0 right-0 bg-black text-white w-24 h-24 rounded-tr-3xl flex flex-col items-center justify-center text-center'
                          style={{
                            clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                          }}
                        >
                          <div className='absolute top-3 right-2 text-right leading-tight'>
                            <div className='text-[10px] font-semibold tracking-wider'>
                              SAVE
                            </div>
                            <div className='text-base font-bold'>
                              {savings}%
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Header: icon + title */}
                      <div className='flex items-start gap-4 mb-5'>
                        <div className='w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-black flex-shrink-0'>
                          {d.icon}
                        </div>
                        <div className='pt-1'>
                          <h2 className='text-xl font-bold text-black leading-tight'>
                            {plan.name}
                          </h2>
                          <p className='text-sm text-gray-600 mt-1'>
                            {d.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Price row */}
                      <div className='flex items-start justify-between mb-5'>
                        <div>
                          <div className='flex items-baseline gap-2 flex-wrap'>
                            <span className='text-4xl font-extrabold text-black tracking-tight'>
                              {plan.price != null ? `$${plan.price}` : 'Free'}
                            </span>
                            {d.priceSuffix && (
                              <span className='text-sm text-gray-500'>
                                {d.priceSuffix}
                              </span>
                            )}
                            {plan.savePercent != null && (
                              <span className='text-sm text-gray-400 line-through'>
                                ${originalPrice}
                              </span>
                            )}
                            <span className='inline-block mt-2 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full'>
                              {d.pill}
                            </span>
                          </div>
                        </div>
                        {plan.dailyLimit != null && (
                          <div className='bg-gray-100 rounded-xl px-4 py-2 text-center min-w-[80px]'>
                            <div className='text-2xl font-bold text-black leading-none'>
                              {plan.dailyLimit}
                            </div>
                            <div className='text-[10px] text-gray-600 mt-1 leading-tight'>
                              Downloads
                              <br />
                              per day
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Limited time offer banner */}
                      <div className='bg-gray-100 rounded-xl px-4 py-3 mb-5 flex items-center gap-3'>
                        <div className='text-gray-700'>
                          <ClockIcon />
                        </div>
                        <div className='leading-tight flex-1'>
                          <p className='text-sm font-semibold text-black'>
                            Limited time offer!
                          </p>
                          <p className='text-xs text-gray-600'>
                            Offer ends in{' '}
                            <span className='font-mono font-semibold text-black'>
                              {dailyResetTime || '--:--:--'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Features list */}
                      <ul className='space-y-2.5 mb-6 flex-1'>
                        {plan.features?.map((feature, idx) => (
                          <li
                            key={idx}
                            className='flex items-start gap-2.5 text-sm text-gray-700'
                          >
                            <span className='text-black flex-shrink-0 mt-0.5'>
                              <CheckCircle />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA button */}
                      <PurchaseButton
                        plan={plan}
                        isPopular={isPopular}
                        isActivePlan={isActivePlan}
                        ctaTitle={d.ctaTitle}
                        ctaSubtitle={d.ctaSub}
                      />

                      {/* Footer trust row */}
                      <div className='flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100'>
                        <div className='flex items-center gap-1.5 text-xs text-gray-600'>
                          <ShieldIcon /> 100% Safe, Secure & Encrypted Payment
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {/* ---------- TRUST BAR ---------- */}
          <div className='bg-white rounded-2xl shadow-md p-6 md:p-8'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              {[
                {
                  icon: <ShieldIcon size={34} />,
                  title: '100% Secure Payment',
                  body: 'Your payment information is always protected.',
                },
                {
                  icon: <RefreshIcon />,
                  title: 'Cancel Anytime',
                  body: 'No hidden fees. Cancel whenever you want.',
                },
                {
                  icon: <HeadsetIcon />,
                  title: '24/7 Support',
                  body: 'We’re here to help you anytime you need.',
                },
                {
                  icon: <PeopleIcon />,
                  title: 'Trusted Worldwide',
                  body: 'Loved by thousands of embroidery enthusiasts.',
                },
              ].map((item, i) => (
                <div key={i} className='flex items-start gap-3'>
                  <div className='text-black flex-shrink-0 mt-1'>
                    {item.icon}
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-black'>
                      {item.title}
                    </p>
                    <p className='text-xs text-gray-500 mt-0.5 leading-snug'>
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Divider className='bg-gray-200' />
      <Footer />
    </>
  );
}
