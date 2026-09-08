'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import OfferCountdown from '@/components/Common/OfferCountdown';
import PaymentHelpModal from '@/components/Common/PaymentHelpModal';
import PurchaseButton from '@/components/Common/PurchaseButton';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import FeaturedReviews from '@/features/reviews/FeaturedReviews';
import { windowPhrase } from '@/lib/apis/public/siteConfig';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { Divider } from '@heroui/divider';
import { GiftIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { buildSubscriptionFaqs } from './faqs';

/* One-Time Payment — diamond/gem (premium one-time investment) */
const OneTimeIcon = () => (
  <svg
    width='26'
    height='26'
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
    width='26'
    height='26'
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
    width='26'
    height='26'
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
const CheckCircle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24'>
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
/* Comparison-table "not included" marker */
const DashIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' aria-hidden='true'>
    <line
      x1='7'
      y1='12'
      x2='17'
      y2='12'
      stroke='currentColor'
      strokeWidth='2.4'
      strokeLinecap='round'
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
const RefreshIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
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
const HeadsetIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
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
const PeopleIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
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

/* Money with cents only when they exist ($149, $4.99). */
const money = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  return Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`;
};

/* ---------- Derive display info from billingInterval ----------
   Yearly plans are quoted as a per-month equivalent with the full term total
   underneath, because "$4.99/mo" beside the monthly plan's "$9.99/mo" is the
   only presentation that lets someone compare the two at a glance. The
   strikethrough price is divided by the same term so both stay in one unit.

   renewNote always quotes plan.price, never originalPrice: the gateway charges
   the same amount on renewal, so a higher "renews at" figure would be a price
   we never actually bill. */
const getPlanDisplay = (plan, originalPrice) => {
  const i = (plan.billingInterval || '').toLowerCase();
  const price = Number(plan.price) || 0;
  const orig = originalPrice != null ? Number(originalPrice) : null;

  if (!i) {
    return {
      icon: <OneTimeIcon />,
      tagline: 'Pay once, yours forever',
      pill: 'One-time payment',
      headlinePrice: price,
      headlineSuffix: '',
      strikePrice: orig,
      termTotalLine: null,
      renewNote: 'One-time payment — this never renews',
      renewsCell: 'Never',
      billingCell: 'One-time',
      ctaTitle: `Get ${plan.name}`,
    };
  }
  if (i.startsWith('year')) {
    return {
      icon: <YearlyIcon />,
      tagline: 'Best value — our lowest monthly rate',
      pill: 'Billed yearly',
      headlinePrice: price / 12,
      headlineSuffix: '/mo',
      strikePrice: orig != null ? orig / 12 : null,
      termTotalLine: `Get 12 months for ${money(price)}`,
      renewNote: `Renews at ${money(price)}/year · cancel anytime`,
      renewsCell: 'Yearly',
      billingCell: 'Billed yearly',
      ctaTitle: `Choose ${plan.name}`,
    };
  }
  if (i.startsWith('week')) {
    return {
      icon: <MonthlyIcon />,
      tagline: 'Short commitment, full access',
      pill: 'Billed weekly',
      headlinePrice: price,
      headlineSuffix: '/wk',
      strikePrice: orig,
      termTotalLine: null,
      renewNote: `Renews at ${money(price)}/week · cancel anytime`,
      renewsCell: 'Weekly',
      billingCell: 'Billed weekly',
      ctaTitle: `Choose ${plan.name}`,
    };
  }
  return {
    icon: <MonthlyIcon />,
    tagline: 'Flexible — stop whenever you like',
    pill: 'Billed monthly',
    headlinePrice: price,
    headlineSuffix: '/mo',
    strikePrice: orig,
    termTotalLine: null,
    renewNote: `Renews at ${money(price)}/month · cancel anytime`,
    renewsCell: 'Monthly',
    billingCell: 'Billed monthly',
    ctaTitle: `Choose ${plan.name}`,
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

/* ---------- Feature comparison ----------
   Only rows we can stand behind: read straight off the plan documents, or
   claims the cards above the table already make. */
const COMPARISON_ROWS = [
  { label: 'Price', get: (c) => c.priceCell },
  { label: 'Billing', get: (c) => c.billingCell },
  { label: 'Downloads', get: (c) => c.downloadsCell },
  { label: 'Entire design library', get: () => true },
  {
    label: 'All machine formats (PES, DST, JEF, VP3, HUS, EXP, PCS, CND, XXX)',
    // The full format list is fine across a wide table cell but wraps to four
    // lines in the stacked mobile row, so that view uses the short form.
    shortLabel: 'All machine formats',
    get: () => true,
  },
  { label: 'New designs as they are added', get: () => true },
  { label: 'Commercial use licence', get: (c) => c.commercial },
  { label: 'Re-download anything you have taken', get: () => true },
  { label: 'Renews', get: (c) => c.renewsCell },
];

function ComparisonCell({ value, highlight = false }) {
  if (value === true)
    return (
      <span className='inline-flex text-black'>
        <CheckCircle size={highlight ? 22 : 20} />
      </span>
    );
  if (value === false)
    return (
      <span className='inline-flex text-gray-300'>
        <DashIcon />
      </span>
    );
  return (
    <span
      className={`text-black ${
        highlight ? 'text-base font-bold' : 'text-sm font-medium'
      }`}
    >
      {value}
    </span>
  );
}

function ComparisonTable({ columns }) {
  return (
    <section className='mt-16'>
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-extrabold tracking-tight text-black md:text-3xl'>
          Compare the plans
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          Every plan opens the same library. What changes is how much you can
          take each day, and what you are allowed to do with it.
        </p>
      </div>

      {/* Mobile: one card per plan. A five-column table cannot be made readable
          at 375px — side-scrolling pushes the plan you are comparing against off
          screen, which is the whole point of the table — so the same rows are
          restacked as label/value pairs under each plan. */}
      <div className='space-y-4 md:hidden'>
        {columns.map((c) => (
          <div
            key={c.key}
            className={`overflow-hidden rounded-2xl bg-white shadow-sm ${
              c.highlight ? 'ring-2 ring-black' : ''
            }`}
          >
            <div
              className={`px-5 py-3 ${c.highlight ? 'bg-black' : 'bg-gray-50'}`}
            >
              {c.highlight && (
                <span className='mb-1 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-black'>
                  <StarFilled />
                  MOST POPULAR
                </span>
              )}
              <div
                className={
                  c.highlight
                    ? 'text-base font-bold text-white'
                    : 'text-sm font-bold text-black'
                }
              >
                {c.name}
              </div>
            </div>

            <dl className='divide-y divide-gray-100'>
              {COMPARISON_ROWS.map((row) => (
                <div
                  key={row.label}
                  className='flex items-center justify-between gap-4 px-5 py-3'
                >
                  <dt className='text-xs leading-snug text-gray-600'>
                    {row.shortLabel ?? row.label}
                  </dt>
                  <dd className='shrink-0 text-right'>
                    <ComparisonCell
                      value={row.get(c)}
                      highlight={c.highlight}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className='hidden overflow-hidden rounded-2xl bg-white shadow-md md:block'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[640px] border-separate border-spacing-0 text-left'>
            <thead>
              <tr>
                <th className='sticky left-0 z-10 border-b border-gray-200 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Features
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-5 text-center align-bottom ${
                      c.highlight
                        ? 'rounded-t-xl bg-black py-5'
                        : 'border-b border-gray-200 py-4'
                    }`}
                  >
                    {c.highlight && (
                      <span className='mb-1.5 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-black'>
                        <StarFilled />
                        MOST POPULAR
                      </span>
                    )}
                    <div
                      className={
                        c.highlight
                          ? 'text-base font-bold text-white'
                          : 'text-sm font-bold text-black'
                      }
                    >
                      {c.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, ri) => (
                <tr key={row.label}>
                  <th
                    scope='row'
                    className={`sticky left-0 z-10 px-5 py-3.5 text-sm font-medium text-gray-700 ${
                      ri % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    {row.label}
                  </th>
                  {columns.map((c) => {
                    // The popular column is drawn as a boxed card sitting over
                    // the table: black cap above, black sides down the rows,
                    // closed off under the last one.
                    const isLast = ri === COMPARISON_ROWS.length - 1;
                    return (
                      <td
                        key={c.key}
                        className={`px-5 py-3.5 text-center ${
                          c.highlight
                            ? `border-x-2 border-black bg-gray-100 ${
                                isLast ? 'rounded-b-xl border-b-2' : ''
                              }`
                            : ri % 2 === 1
                              ? 'bg-gray-50'
                              : ''
                        }`}
                      >
                        <ComparisonCell
                          value={row.get(c)}
                          highlight={c.highlight}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faqs }) {
  return (
    <section className='mt-16'>
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-extrabold tracking-tight text-black md:text-3xl'>
          Frequently asked questions
        </h2>
      </div>

      <div className='mx-auto max-w-3xl space-y-3'>
        {faqs.map(({ q, a }) => (
          <details
            key={q}
            className='group rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md'
          >
            <summary className='flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-black'>
              {q}
              <span className='shrink-0 text-2xl font-light text-gray-400 transition-transform group-open:rotate-45'>
                +
              </span>
            </summary>
            <p className='mt-3 text-sm leading-relaxed text-gray-600'>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function SubscriptionsPageClient({
  siteConfig,
  featuredReviews = [],
  totalReviewCount = 0,
}) {
  // Admin-managed free-tier quota (from /public/site-config via the server
  // page). Either value can be null when the config could not be read — the
  // copy then drops the figure instead of quoting a stale one.
  const freeLimit = siteConfig?.freeDownloadLimit;
  const freeWindow = windowPhrase(siteConfig?.freeDownloadWindow);
  const freeAllowance =
    freeLimit && freeWindow ? `${freeLimit} downloads per ${freeWindow}` : null;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Message shown (with a Contact CTA) when a plan can't be bought right now —
  // gateway is off or the plan isn't mapped to the active gateway.
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const pathName = usePathname();
  const router = useRouter();
  const { data: userInfoData } = useUserInfoQuery();
  // `accessState` is computed server-side by helpers/subscriptionAccess.ts and is
  // the same label the download gate enforces — every other screen (My Plan, the
  // site banner, the product download card) already reads it.
  //
  // This page used to re-derive access from the raw `subscription.status`, which
  // disagrees with the server whenever the paid-through date has lapsed but the
  // record still says active/past_due (a missed renewal webhook, or a past_due
  // sub beyond its dunning grace). That showed "✓ Active Plan" on a dead plan
  // AND disabled its button, so the one customer most likely to want to pay
  // again was the one person who couldn't.
  const HAS_ACCESS_STATES = [
    'active',
    'cancelling',
    'lifetime',
    'payment_failed',
  ];
  const sub = userInfoData?.subscription;
  const hasAccess = HAS_ACCESS_STATES.includes(userInfoData?.accessState);
  const activePlanId = hasAccess ? (sub?.planId?._id ?? null) : null;
  // Free-plan card state:
  //  - guest (not registered)          → nothing is "active"; CTA → /auth/register
  //  - registered, no live subscription (none, canceled, or expired)
  //                                    → Free plan shows as the active plan
  //  - registered with live subscription → the paid plan shows active instead
  const isLoggedIn = Boolean(userInfoData?.email || userInfoData?._id);
  const isFreeActive = isLoggedIn && !activePlanId;

  const sortPlans = useCallback((plans) => {
    // Define the order you want plans to appear in
    const PLAN_ORDER = ['one-time', 'year', 'month', 'week'];

    return [...plans].sort((a, b) => {
      const getOrderKey = (plan) => {
        if (!plan.billingInterval) return 'one-time';
        return plan.billingInterval.toLowerCase();
      };
      return (
        PLAN_ORDER.indexOf(getOrderKey(a)) - PLAN_ORDER.indexOf(getOrderKey(b))
      );
    });
  }, []);

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
      // They came back from checkout without paying — the one moment we know
      // something went wrong, so promote the alternative-payment offer.
      setCheckoutTrouble(true);
    }

    // ?pay=1 opens the "other ways to pay" modal straight away. Used by the
    // "Renew my access" button on My Plan, so a manual subscriber lands on the
    // plans (to see what they're renewing) with the request form already open
    // rather than having to hunt for the link.
    if (searchParams.get('pay') === '1') {
      setShowPayHelp(true);
    }
  }, [pathName, router]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/subscriptions`,
        );
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(sortPlans(data.data.plans ?? [])); // ← sort here
        setCheckoutMessage(data.data.checkoutMessage ?? '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [sortPlans]);

  // "Pay another way". Shown ALWAYS, not only after a failure: a card decline
  // happens on the gateway's hosted checkout, so this site is never told it
  // occurred — most declined customers just close the tab. The only signal we
  // ever get is ?status=cancelled (they clicked back), which we use to make the
  // same entry point louder rather than to decide whether to show it at all.
  const [showPayHelp, setShowPayHelp] = useState(false);
  const [checkoutTrouble, setCheckoutTrouble] = useState(false);

  const faqs = buildSubscriptionFaqs(freeLimit, freeWindow);

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

  // Card grid sizing. Four cards (Free + three terms) is the normal case, but
  // the paid plans come from the DB, so a two- or three-card page has to stay
  // centred instead of stretching across the full 7xl track.
  const cardCount = 1 + (plans.length || 1);
  const gridCols =
    cardCount >= 4
      ? 'sm:grid-cols-2 xl:grid-cols-4'
      : cardCount === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2';
  const gridMax =
    cardCount >= 4 ? 'max-w-7xl' : cardCount === 3 ? 'max-w-5xl' : 'max-w-3xl';

  // Columns for the comparison table: the static Free tier plus whatever paid
  // plans the API returned, in the same order as the cards above it.
  const comparisonColumns = [
    {
      key: 'free',
      name: 'Free Forever',
      priceCell: '$0',
      billingCell: 'No billing',
      downloadsCell:
        freeLimit && freeWindow ? `${freeLimit} per ${freeWindow}` : 'Limited',
      commercial: false,
      renewsCell: 'Never',
      highlight: false,
    },
    ...plans.map((plan) => {
      const staticVals = getStaticDefaults(plan);
      const originalPrice = plan.originalPrice ?? staticVals.originalPrice;
      const d = getPlanDisplay(plan, originalPrice);
      return {
        key: plan._id,
        name: plan.name,
        priceCell: `${money(d.headlinePrice)}${d.headlineSuffix}`,
        billingCell: d.billingCell,
        downloadsCell:
          plan.dailyLimit != null ? `${plan.dailyLimit} per day` : '—',
        commercial: true,
        renewsCell: d.renewsCell,
        highlight: (plan.billingInterval || '')
          .toLowerCase()
          .startsWith('year'),
      };
    }),
  ];

  return (
    <>
      <Header />

      <div className='min-h-screen bg-[#F5F5F7] py-12 pb-20 px-4 relative overflow-hidden'>
        {/* ---------- HERO ---------- */}
        <div className='mx-auto mb-8 max-w-2xl text-center'>
          <span className='text-xs font-bold uppercase tracking-[0.2em] text-gray-400'>
            Pricing
          </span>
          <h1 className='mt-3 text-4xl font-extrabold tracking-tight text-black md:text-5xl'>
            Choose Your Plan
          </h1>
          <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base'>
            Get instant access to premium embroidery designs in every format.
            Commercial use included, cancel anytime.
          </p>
        </div>

        {/* ---------- SINGLE OFFER COUNTDOWN ----------
            Was repeated inside every paid card; one bar above the grid says it
            once and leaves each card telling a single price story. */}
        {plans.length > 0 && (
          <div className='mx-auto mb-8 flex max-w-md items-center justify-center gap-3 rounded-full bg-black px-6 py-3 text-white shadow-md'>
            <ClockIcon />
            <p className='text-sm font-semibold text-white'>
              Limited time offer — ends in{' '}
              <OfferCountdown className='font-mono' />
            </p>
          </div>
        )}

        {/* Trust chips — only claims this page can stand behind. Rendered as
            white pills so they read as part of the carded page rather than
            loose text floating on the grey. */}
        <div className='mx-auto mb-10 flex max-w-3xl flex-wrap items-center justify-center gap-2'>
          {[
            'Cancel anytime',
            'All machine formats included',
            'Commercial use on paid plans',
            'Instant download',
          ].map((chip) => (
            <span
              key={chip}
              className='flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-black/5'
            >
              <span className='text-black'>
                <CheckCircle size={14} />
              </span>
              {chip}
            </span>
          ))}
        </div>

        {/* Loud version — only after we KNOW checkout didn't complete. */}
        {checkoutTrouble && (
          <div className='mx-auto mb-8 max-w-2xl rounded-2xl border-2 border-black bg-white p-6 text-center shadow-lg'>
            <p className='text-lg font-bold text-black'>
              Payment didn&apos;t go through?
            </p>
            <p className='mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600'>
              Cards are declined for all sorts of reasons that have nothing to
              do with you. We can take your payment another way and set your
              account up by hand — usually within a few hours.
            </p>
            <button
              onClick={() => setShowPayHelp(true)}
              className='mt-4 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-900'
            >
              See other ways to pay →
            </button>
          </div>
        )}

        <div className='max-w-7xl mx-auto relative z-10'>
          {/* The Free plan is ALWAYS shown. Paid plans render when available;
              otherwise a "premium coming soon" message sits beside Free. */}
          <div
            className={`mx-auto grid w-full grid-cols-1 items-stretch gap-6 ${gridCols} ${gridMax}`}
          >
            {/* ---------- STATIC FREE PLAN CARD ---------- */}
            <div
              className={`relative flex flex-col rounded-3xl bg-white p-6 pt-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                isFreeActive ? 'ring-2 ring-green-500' : 'ring-1 ring-black/5'
              }`}
            >
              {isFreeActive && (
                <div className='absolute -top-3.5 left-1/2 z-20 -translate-x-1/2'>
                  <span className='whitespace-nowrap rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold text-white shadow-md'>
                    ✓ Active Plan
                  </span>
                </div>
              )}

              {/* Header: icon + name + one-line tagline */}
              <div className='mb-5 flex items-center gap-3'>
                <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-black'>
                  <GiftIcon width='26' height='26' strokeWidth='1.6' />
                </div>
                <div>
                  <h2 className='text-lg font-bold leading-tight text-black'>
                    Free Forever
                  </h2>
                  <p className='text-xs text-gray-500'>
                    Try the whole library first
                  </p>
                </div>
              </div>

              {/* Price block — same fixed-height rows as the paid cards so all
                  four headline prices land on one line across the grid. */}
              <div className='mb-1 flex h-6 items-end'>
                <span className='inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600'>
                  No card needed
                </span>
              </div>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-4xl font-extrabold tracking-tight text-black'>
                  $0
                </span>
                <span className='text-sm font-medium text-gray-500'>
                  forever
                </span>
              </div>
              <p className='mt-1.5 h-5 text-xs text-gray-500'>
                {freeAllowance || 'Free downloads included'}
              </p>
              <p className='mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500'>
                Free forever — nothing to cancel
              </p>

              {/* CTA — mirrors PurchaseButton's states */}
              <div className='mt-4'>
                {isFreeActive ? (
                  <button
                    disabled
                    className='flex w-full cursor-not-allowed flex-col items-center justify-center gap-0.5 rounded-xl bg-green-500 px-4 py-3.5 text-white'
                  >
                    <span className='flex items-center gap-2 text-sm font-semibold'>
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
                    className='flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-gray-200 px-4 py-3.5 text-gray-500'
                  >
                    <span className='text-sm font-semibold'>
                      Included in your plan
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/auth/register')}
                    className='flex w-full items-center justify-center rounded-xl border-2 border-black bg-white px-4 py-4 text-black transition-all duration-200 hover:bg-gray-100 active:scale-[0.99]'
                  >
                    <span className='text-base font-semibold leading-tight'>
                      Start Free Now
                    </span>
                  </button>
                )}
              </div>

              {/* Features */}
              <p className='mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400'>
                What you get
              </p>
              <ul className='mb-6 flex-1 space-y-2.5'>
                {[
                  freeAllowance || 'A set number of free downloads',
                  'Access to the whole design library',
                  'All design formats in one ZIP',
                  'New designs as they are added',
                  'Personal use only',
                  'No credit card required',
                ].map((f) => (
                  <li
                    key={f}
                    className='flex items-start gap-2.5 text-sm text-gray-700'
                  >
                    <span className='mt-0.5 flex-shrink-0 text-black'>
                      <CheckCircle />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Footer trust row */}
              <div className='mt-auto flex items-center justify-center gap-6 border-t border-gray-100 pt-4'>
                <div className='flex items-center gap-1.5 text-xs text-gray-600'>
                  <ShieldIcon /> No payment required
                </div>
              </div>
            </div>

            {/* ---------- PAID PLANS (or coming-soon message) ---------- */}
            {plans.length === 0 ? (
              <div className='relative flex flex-col items-center justify-center rounded-3xl bg-white p-7 pt-8 text-center shadow-lg'>
                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-black'>
                  <StarFilled />
                </div>
                <h2 className='text-xl font-bold text-black'>
                  Premium plans coming soon
                </h2>
                <p className='mt-2 text-sm text-gray-600'>
                  We&rsquo;re putting the finishing touches on our premium
                  subscriptions. In the meantime, enjoy the free plan — check
                  back shortly.
                </p>
                <a
                  href='mailto:support@embroidize.com?subject=Notify me about premium plans'
                  className='mt-6 w-full rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-900'
                >
                  Notify me
                </a>
              </div>
            ) : (
              plans.map((plan) => {
                const isActivePlan = activePlanId === plan._id;
                const isPopular = (plan.billingInterval || '')
                  .toLowerCase()
                  .startsWith('year');
                const staticVals = getStaticDefaults(plan);
                const savings = plan.savePercent ?? staticVals.savePercent;
                const originalPrice =
                  plan.originalPrice ?? staticVals.originalPrice;
                const d = getPlanDisplay(plan, originalPrice);
                // Only strike a price that is actually higher than the one we
                // charge. savePercent of 0 makes originalPrice === price, which
                // used to render "$9.99 $9.99" with the second one crossed out.
                const showStrike =
                  Number(savings) > 0 &&
                  d.strikePrice != null &&
                  d.strikePrice > d.headlinePrice;

                return (
                  <div
                    key={plan._id}
                    className={`relative flex flex-col rounded-3xl bg-white p-6 pt-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                      // One chain, not two appended rings: ring-1 and ring-2 both
                      // set the same Tailwind ring-width variable, so emitting
                      // both leaves the winner down to stylesheet order.
                      isActivePlan
                        ? 'ring-2 ring-green-500'
                        : isPopular
                          ? 'shadow-2xl ring-2 ring-black xl:-mt-5 xl:mb-5'
                          : 'ring-1 ring-black/5'
                    }`}
                  >
                    {/* MOST POPULAR header band. A solid bar bled to the card
                        edges (-mx-6 -mt-8 cancels the card's p-6 pt-8) reads far
                        harder than a floating pill, and needs no overflow-hidden
                        that would clip the ring. */}
                    {isPopular && !isActivePlan && (
                      <div className='-mx-6 -mt-8 mb-6 flex items-center justify-center gap-1.5 rounded-t-3xl bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white'>
                        <StarFilled />
                        Most Popular
                      </div>
                    )}
                    {/* Active Plan badge */}
                    {isActivePlan && (
                      <div className='absolute -top-3.5 left-1/2 z-20 -translate-x-1/2'>
                        <span className='whitespace-nowrap rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold text-white shadow-md'>
                          ✓ Active Plan
                        </span>
                      </div>
                    )}

                    {/* Header: icon + name + one-line tagline */}
                    <div className='mb-5 flex items-center gap-3'>
                      <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-black'>
                        {d.icon}
                      </div>
                      <div>
                        <h2 className='text-lg font-bold leading-tight text-black'>
                          {plan.name}
                        </h2>
                        <p className='text-xs text-gray-500'>{d.tagline}</p>
                      </div>
                    </div>

                    {/* Price block — discount badge, strikethrough, headline,
                        term total, renewal note. */}
                    <div className='mb-1 flex h-6 items-end gap-2'>
                      {savings ? (
                        <span className='inline-block rounded-full bg-black px-2.5 py-0.5 text-[11px] font-bold text-white'>
                          {savings}% OFF
                        </span>
                      ) : null}
                      {showStrike && (
                        <span className='text-sm text-gray-400 line-through'>
                          {money(d.strikePrice)}
                          {d.headlineSuffix}
                        </span>
                      )}
                    </div>
                    <div className='flex items-baseline gap-1.5'>
                      <span
                        className={`font-extrabold tracking-tight text-black ${
                          isPopular ? 'text-5xl' : 'text-4xl'
                        }`}
                      >
                        {money(d.headlinePrice)}
                      </span>
                      {d.headlineSuffix && (
                        <span className='text-sm font-medium text-gray-500'>
                          {d.headlineSuffix}
                        </span>
                      )}
                    </div>
                    <p className='mt-1.5 h-5 text-xs text-gray-500'>
                      {d.termTotalLine ??
                        (plan.dailyLimit != null
                          ? `${plan.dailyLimit} downloads per day`
                          : '')}
                    </p>
                    <p className='mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500'>
                      {d.renewNote}
                    </p>

                    {/* CTA button */}
                    <div className='mt-4'>
                      <PurchaseButton
                        plan={plan}
                        isPopular={isPopular}
                        isActivePlan={isActivePlan}
                        ctaTitle={d.ctaTitle}
                        ctaSubtitle={d.pill}
                        checkoutMessage={checkoutMessage}
                      />
                    </div>

                    {/* Features */}
                    <p className='mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400'>
                      What you get
                    </p>
                    <ul className='mb-6 flex-1 space-y-2.5'>
                      {plan.features?.map((feature, idx) => (
                        <li
                          key={idx}
                          className='flex items-start gap-2.5 text-sm text-gray-700'
                        >
                          <span className='mt-0.5 flex-shrink-0 text-black'>
                            <CheckCircle />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Footer trust row */}
                    <div className='mt-auto flex items-center justify-center gap-6 border-t border-gray-100 pt-4'>
                      <div className='flex items-center gap-1.5 text-xs text-gray-600'>
                        <ShieldIcon /> Secure, encrypted payment
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quiet, permanent entry point. This is the one that actually
              catches most people — see the note where showPayHelp is declared. */}
          <div className='mt-8 text-center'>
            <button
              onClick={() => setShowPayHelp(true)}
              className='text-sm text-gray-600 underline underline-offset-4 transition hover:text-black'
            >
              Having trouble paying? Other payment methods →
            </button>
          </div>

          {/* ---------- COMPARISON TABLE ---------- */}
          {plans.length > 0 && <ComparisonTable columns={comparisonColumns} />}

          {/* ---------- CUSTOMER TESTIMONIALS ---------- */}
          <FeaturedReviews
            reviews={featuredReviews}
            totalCount={totalReviewCount}
          />

          {/* ---------- TRUST BAR ---------- */}
          <div className='mt-16 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8'>
            <div className='grid grid-cols-2 gap-6 md:grid-cols-4'>
              {[
                {
                  icon: <ShieldIcon size={22} />,
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
                  {/* Badged icon, matching the plan cards' icon treatment —
                      a bare 34px stroke icon read as unfinished beside them. */}
                  <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-black'>
                    {item.icon}
                  </div>
                  <div className='pt-0.5'>
                    <p className='text-sm font-semibold text-black'>
                      {item.title}
                    </p>
                    <p className='mt-0.5 text-xs leading-snug text-gray-500'>
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- FAQ ---------- */}
          <FaqSection faqs={faqs} />
        </div>
      </div>

      {showPayHelp && (
        <PaymentHelpModal plans={plans} onClose={() => setShowPayHelp(false)} />
      )}

      <Divider className='bg-gray-200' />
      <Footer />
    </>
  );
}
